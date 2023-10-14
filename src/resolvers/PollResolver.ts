import { v2 } from "@google-cloud/translate"
import * as strsim from "string-similarity"
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { Poll } from "../../prisma/models/polls/Poll"
import { createPollTimer } from "../middleware/graphql/createPollTimer"
import { isLoggedIn } from "../middleware/graphql/isLoggedIn"
import { prisma } from "../prisma"
import { graphqlContext } from "../types/graphqlContext"
import "dotenv-safe/config"
import { redisCacheToObject } from "../utils/redisCacheToObject"
import {
	NO_VALUE_PLACEHOLDER,
	REDIS_HASH_KEY_LANGUAGE_CODES,
	REDIS_HASH_KEY_OPTION,
	REDIS_HASH_KEY_POLL,
	REDIS_HASH_KEY_POLL_TEXTS,
	REDIS_HASH_KEY_TOPIC,
	REDIS_KEY_CREATE_POLL_TIMER,
	REDIS_SET_KEY_POLL_OPTIONS,
	REDIS_SET_KEY_POLL_TOPICS,
	REDIS_SET_KEY_TOPICS,
	REDIS_SET_KEY_TOPIC_FOLLOWERS,
	REDIS_SET_KEY_TOPIC_POLLS,
	REDIS_SET_KEY_USER_FOLLOWERS,
	REDIS_SORTEDSET_KEY_HOME_FEED,
	UNKNOWN,
} from "./../constants"
import { redisCacheCheck } from "./../utils/redisCacheCheck"
import { FeedItem } from "./FeedResolver"

@InputType()
class MediaInput {
	@Field()
	type: string
	@Field()
	URL: string
}

@InputType()
class OptionInput {
	@Field()
	text: string
	@Field(() => MediaInput, { nullable: true })
	media?: MediaInput
}

@InputType()
export class CreatePollInput {
	@Field()
	text!: string
	@Field(() => MediaInput, { nullable: true })
	media?: { type: string; URL: string }
	@Field(() => [OptionInput])
	options!: { text: string; media?: { type: string; URL: string } }[]
	@Field(() => [String])
	newTopics: string[]
	@Field(() => [String])
	existingTopics: string[]
	@Field({ defaultValue: false })
	anonymous!: boolean
}

@Resolver()
export class PollResolver {
	@Query(() => Poll, { nullable: true })
	async getSinglePoll(
		@Arg("id", () => String) id: string,
		@Ctx() { redis }: graphqlContext
	): Promise<Poll | null> {
		return await redisCacheCheck({
			key: REDIS_HASH_KEY_POLL + id,
			args: [],
			type: "hgetall",
			hit: async (cache) => redisCacheToObject(cache),
			miss: async () => {
				const data = await prisma.poll.findUnique({ where: { id } })
				if (!data) return null
				redis.hset(REDIS_HASH_KEY_POLL + id, Object.entries(data).flat(1))
				return data
			},
		})
	}

	@Query(() => Boolean)
	@UseMiddleware(isLoggedIn, createPollTimer)
	async createPollCheck() {
		return true
	}

	@Query(() => [FeedItem])
	@UseMiddleware(isLoggedIn, createPollTimer)
	async getSimilarPolls(@Arg("text") text: string, @Ctx() { redis }: graphqlContext) {
		const data: Record<string, string> = await redisCacheCheck({
			key: REDIS_HASH_KEY_POLL_TEXTS,
			args: [],
			type: "hgetall",
			hit: async (cache) => redisCacheToObject(cache),
			miss: async () => {
				const data = await prisma.poll.findMany({ select: { id: true, text: true } })
				if (!data || data.length === 0) return {}
				redis.hset(
					REDIS_HASH_KEY_POLL_TEXTS,
					data.flatMap((e) => [e.id, e.text])
				)
				return data.reduce((res, e) => ({ ...res, [e.id]: e.text }), {})
			},
		})
		return Object.entries(data)
			.filter((e) => strsim.compareTwoStrings(text, e[1]) > 0.5)
			.map((e) => ({ id: e[0] }))
	}

	@Mutation(() => Poll, { nullable: true })
	@UseMiddleware(isLoggedIn, createPollTimer)
	async createPoll(
		@Arg("createPollInput") createPollInput: CreatePollInput,
		@Ctx() { req, redis }: graphqlContext
	): Promise<Poll | null> {
		const { text, media, options, newTopics, anonymous, existingTopics } = createPollInput
		const posterId = req.session.userId

		// timer
		await redis.set(
			REDIS_KEY_CREATE_POLL_TIMER + req.session.userId,
			"_",
			"ex", // sec
			5 // * 60 // 5 min // TODO remember to change this back
		)

		// identify language
		let languageCode = "un"
		const languages = await redisCacheCheck({
			key: REDIS_HASH_KEY_LANGUAGE_CODES,
			args: [],
			type: "hkeys",
			hit: (cache) => cache,
			miss: async () => {
				const data = (await prisma.language.findMany())?.filter((e) => e.code !== UNKNOWN)
				redis.hset(
					REDIS_HASH_KEY_LANGUAGE_CODES,
					...data.flatMap((e) => [e.code, e.nativeName])
				)
				return data.map((e) => e.code)
			},
		})
		const googleTranslateAPI = new v2.Translate({
			key: process.env.GOOGLE_APIKEY,
		})
		const googleDetectRes = (await googleTranslateAPI.detect(text))[0]
		if (googleDetectRes.confidence > 0.8)
			languageCode = languages[languages.indexOf(googleDetectRes.language)] || "un" // undefined

		// create poll
		const createdPoll = await prisma.poll.create({
			data: {
				language: { connect: { code: languageCode } },
				text,
				options: {
					create: options.map((e) => ({
						language: { connect: { code: languageCode } },
						text: e.text,
						...(e.media && {
							mediaType: { connect: { code: e.media.type } },
							mediaURL: e.media.URL,
						}),
					})).reverse(),
				},
				...(!anonymous && { poster: { connect: { id: posterId } } }),
				...(anonymous && { anonymousPoster: { connect: { id: posterId } } }),
				...(media && { mediaType: { connect: { code: media.type } }, mediaURL: media.URL }),
				...(existingTopics.length > 0 && {
					topics: {
						create: existingTopics.map((e) => ({ topicId: e })),
					},
				}),
			},
			include: { options: true },
		})
		console.log(createdPoll)
		redis.hset(
			REDIS_HASH_KEY_POLL + createdPoll.id,
			Object.entries(createdPoll)
				.filter((e) => e[0] !== "options")
				.flat(1)
		)
		redis.sadd(
			REDIS_SET_KEY_POLL_OPTIONS + createdPoll.id,
			createdPoll.options.map((e) => e.id)
		)
		createdPoll.options.forEach((e) =>
			redis.hset(REDIS_HASH_KEY_OPTION + e.id, Object.entries(e).flat(1))
		)

		// Insert New Topics
		if (newTopics.length > 0) {
			newTopics.forEach(async (id) => {
				redis.hset(REDIS_HASH_KEY_TOPIC + id, "id", id)
				await prisma.topic.upsert({
					create: { id, polls: { create: { pollId: createdPoll.id } } },
					update: { polls: { create: { pollId: createdPoll.id } } },
					where: { id },
				})
			})
			redis.sadd(REDIS_SET_KEY_TOPICS, newTopics)
			redis.sadd(REDIS_SET_KEY_POLL_TOPICS + createdPoll.id, newTopics)
			newTopics.forEach(async (e) => {
				redis.sadd(REDIS_SET_KEY_TOPIC_POLLS + e, createdPoll.id)
				// const topicFollowers = await redisCacheCheck({
				// 	key: REDIS_SET_KEY_TOPIC_FOLLOWERS + e,
				// 	args: [],
				// 	type: "smembers",
				// 	hit: async (cache) => cache,
				// 	miss: async () => {
				// 		const rawData = await prisma.topic
				// 			.findUnique({ where: { id: e } })
				// 			.followers({ select: { followerId: true } })
				// 		if (!rawData || rawData.length === 0) return []
				// 		const data = rawData.map((e) => e.followerId)
				// 		redis.sadd(REDIS_SET_KEY_TOPIC_FOLLOWERS + e, data)
				// 		return data
				// 	},
				// })
				// topicFollowers.forEach(async (e: string) => {
				// 	const n = await redis.zcard(REDIS_SORTEDSET_KEY_HOME_FEED + e)
				// 	redis.zincrby(REDIS_SORTEDSET_KEY_HOME_FEED + e, n + 1, createdPoll.id)
				// })
			})
		}

		// Insert Poll Topic Relationships for Existing Topics
		if (existingTopics.length > 0) {
			redis.sadd(REDIS_SET_KEY_POLL_TOPICS + createdPoll.id, existingTopics)
			existingTopics.forEach(async (e) => {
				redis.sadd(REDIS_SET_KEY_TOPIC_POLLS + e, createdPoll.id)
				const topicFollowers = await redisCacheCheck({
					key: REDIS_SET_KEY_TOPIC_FOLLOWERS + e,
					args: [],
					type: "smembers",
					hit: async (cache) => cache,
					miss: async () => {
						const rawData = await prisma.topic
							.findUnique({ where: { id: e } })
							.followers({ select: { followerId: true } })
						if (!rawData || rawData.length === 0) return []
						const data = rawData.map((e) => e.followerId)
						redis.sadd(REDIS_SET_KEY_TOPIC_FOLLOWERS + e, data)
						return data
					},
				})
				topicFollowers.forEach(async (e: string) => {
					const n = await redis.zcard(REDIS_SORTEDSET_KEY_HOME_FEED + e)
					redis.zincrby(REDIS_SORTEDSET_KEY_HOME_FEED + e, n + 1, createdPoll.id)
				})
			})
		}

		// Update Feeds for Poster's Followers
		const n_1 = await redis.zcard(REDIS_SORTEDSET_KEY_HOME_FEED + posterId)
		redis.zincrby(REDIS_SORTEDSET_KEY_HOME_FEED + posterId, n_1, createdPoll.id)
		const userFollowers = await redisCacheCheck({
			key: REDIS_SET_KEY_USER_FOLLOWERS + posterId,
			args: [],
			type: "smembers",
			hit: (cache) => cache,
			miss: async () => {
				const rawData = await prisma.user
					.findUnique({ where: { id: posterId } })
					.followers({ select: { followerId: true } })
				if (!rawData || rawData.length === 0) return []
				const data = rawData.map((e) => e.followerId)
				redis.sadd(REDIS_SET_KEY_USER_FOLLOWERS + posterId, data)
				return data
			},
		})
		userFollowers.forEach(async (e) => {
			const p = await redis.zscore(REDIS_SORTEDSET_KEY_HOME_FEED + e, createdPoll.id)
			if (p) redis.zincrby(REDIS_SORTEDSET_KEY_HOME_FEED + e, 5, createdPoll.id)
			else {
				const n = await redis.zcard(REDIS_SORTEDSET_KEY_HOME_FEED + e)
				redis.zincrby(REDIS_SORTEDSET_KEY_HOME_FEED + e, n + 10, createdPoll.id)
			}
		})

		// All Poll Texts
		redis.hset(REDIS_HASH_KEY_POLL_TEXTS, createdPoll.id, text)

		return {
			...createdPoll,
			topics: await prisma.pollTopic.findMany({
				where: { pollId: createdPoll.id },
				include: { topic: true },
			}),
		}
	}

	@Mutation(() => Boolean)
	async deletePoll(@Arg("id", () => String) id: string, @Ctx() { redis }: graphqlContext) {
		const optionIds: string[] = await redisCacheCheck({
			key: REDIS_SET_KEY_POLL_OPTIONS + id,
			args: [],
			type: "smembers",
			hit: async (cache) => cache,
			miss: async () => {
				const rawData = await prisma.poll.findUnique({ where: { id } }).options({
					select: { id: true },
				})
				if (!rawData || rawData.length === 0) return []
				const data = rawData.map((e) => e.id)
				return data
			},
		})
		redis.del(REDIS_SET_KEY_POLL_OPTIONS + id)
		optionIds.forEach((optionId) => redis.del(REDIS_HASH_KEY_OPTION + optionId))

		const topicIds: string[] = await redisCacheCheck({
			key: REDIS_SET_KEY_POLL_TOPICS + id,
			args: [],
			type: "smembers",
			hit: async (cache) => {
				if (cache.length === 1 && cache[0] === NO_VALUE_PLACEHOLDER) return []
				return cache
			},
			miss: async () => {
				const rawData = await prisma.poll
					.findUnique({ where: { id } })
					.topics({ select: { topicId: true } })
				if (!rawData || rawData.length === 0) return []
				const data = rawData.map((e) => e.topicId)
				return data
			},
		})
		redis.del(REDIS_SET_KEY_POLL_TOPICS + id)
		topicIds.forEach((topicId) => redis.srem(REDIS_SET_KEY_TOPIC_POLLS + topicId, id))

		redis.hdel(REDIS_HASH_KEY_POLL_TEXTS, id)

		await prisma.poll.delete({ where: { id } })
		redis.del(REDIS_HASH_KEY_POLL + id)
		return true
	}
}
