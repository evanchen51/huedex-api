import { v2 } from "@google-cloud/translate"
import * as strsim from "string-similarity"
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { Poll } from "../../prisma/models/polls/Poll"
import { createPollTimer } from "../middleware/graphql/createPollTimer"
import { isLoggedIn } from "../middleware/graphql/isLoggedIn"
import { prisma } from "../prisma"
import { GraphQLContext } from "../types/GraphQLContext"
import { redisCacheToObject } from "../utils/redisCacheToObject"
import {
	REDIS_KEY_CREATE_POLL_TIMER,
	REDIS_KEY_HOME_FEED,
	REDIS_KEY_LANGUAGE_CODES,
	REDIS_KEY_OPTION,
	REDIS_KEY_POLL,
	REDIS_KEY_POLL_OPTIONS,
	REDIS_KEY_POLL_TEXTS,
	REDIS_KEY_POLL_TOPICS,
	REDIS_KEY_TOPIC,
	REDIS_KEY_TOPICS,
	REDIS_KEY_TOPIC_FOLLOWERS,
	REDIS_KEY_TOPIC_POLLS,
	REDIS_KEY_USER_FOLLOWERS
} from "./../constants"
import { redisCacheCheck } from "./../utils/redisCacheCheck"
import { FeedItem } from "./FeedResolver"

@InputType()
export class CreatePollInput {
	@Field()
	text!: string
	@Field(() => [String])
	optionTexts!: string[]
	@Field(() => [String])
	topicIds: string[]
	@Field(() => [String])
	newTopics: string[]
	@Field({ defaultValue: false })
	anonymous!: boolean
}

@Resolver()
export class PollResolver {
	@Query(() => Poll, { nullable: true })
	async getSinglePoll(
		@Arg("id", () => String) id: string,
		@Ctx() { redis }: GraphQLContext
	): Promise<Poll | null> {
		return await redisCacheCheck({
			key: REDIS_KEY_POLL + id,
			args: [],
			type: "hgetall",
			hit: async (cache) => redisCacheToObject(cache),
			miss: async () => {
				const data = await prisma.poll.findUnique({ where: { id } })
				if (!data) return null
				redis.hset(REDIS_KEY_POLL + id, Object.entries(data).flat(1))
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
	async getSimilarPolls(@Arg("text") text: string, @Ctx() { redis }: GraphQLContext) {
		const data: Record<string, string> = await redisCacheCheck({
			key: REDIS_KEY_POLL_TEXTS,
			args: [],
			type: "hgetall",
			hit: async (cache) => redisCacheToObject(cache),
			miss: async () => {
				const data = await prisma.poll.findMany({ select: { id: true, text: true } })
				redis.hset(
					REDIS_KEY_POLL_TEXTS,
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
		@Ctx() { req, redis }: GraphQLContext
	): Promise<Poll | null> {
		const { text, optionTexts, newTopics, anonymous } = createPollInput
		const posterId = req.session.userId
		let { topicIds } = createPollInput

		// timer
		await redis.set(
			REDIS_KEY_CREATE_POLL_TIMER + req.session.userId,
			"_",
			"ex", // sec
			5 // * 60 // 5 min // TODO remember to change this back
		)

		// identify lang
		let languageCode = "un"
		const languages = await redisCacheCheck({
			key: REDIS_KEY_LANGUAGE_CODES,
			args: [],
			type: "hkeys",
			hit: (cache) => cache,
			miss: async () => {
				const data = await prisma.language.findMany({ skip: 1 })
				redis.hset(REDIS_KEY_LANGUAGE_CODES, ...data.flatMap((e) => [e.code, e.nativeName]))
				return data.map((e) => e.code)
			},
		})
		const googleTranslateAPI = new v2.Translate({
			key: "AIzaSyCqL0CrmWt8t5h30tdi0TKHj1XgLWzkpB0",
		})
		const googleDetectRes = (await googleTranslateAPI.detect(text))[0]
		if (googleDetectRes.confidence > 0.8)
			languageCode = languages[languages.indexOf(googleDetectRes.language)] || "un" // undefined

		// create poll
		const createdPoll = await prisma.poll.create({
			data: {
				posterId: !anonymous ? posterId : null,
				anonymousPosterId: anonymous ? posterId : null,
				languageCode,
				text,
				options: {
					create: optionTexts.map((e: string) => ({
						languageCode,
						text: e,
					})),
				},
			},
			include: { options: true },
		})
		redis.hset(
			REDIS_KEY_POLL + createdPoll.id,
			Object.entries(createdPoll)
				.filter((e) => e[0] !== "options")
				.flat(1)
		)
		redis.sadd(
			REDIS_KEY_POLL_OPTIONS + createdPoll.id,
			createdPoll.options.map((e) => e.id)
		)
		createdPoll.options.forEach((e) =>
			redis.hset(REDIS_KEY_OPTION + e.id, Object.entries(e).flat(1))
		)

		// Insert New Topics if needed
		if (newTopics.length > 0) {
			const createdNewTopics = await Promise.all(
				newTopics.map(async (name) => {
					return await prisma.topic.upsert({
						create: { name },
						update: {},
						where: { name },
					})
				})
			)
			createdNewTopics.forEach((e) =>
				redis.hset(REDIS_KEY_TOPIC + e.id, Object.entries(e).flat(1))
			)
			redis.hset(
				REDIS_KEY_TOPICS,
				createdNewTopics.flatMap((e) => [e.name, e.id])
			)
			topicIds = topicIds.concat(createdNewTopics.map((e) => e.id))
		}

		// Insert Poll Topic Relationships
		if (topicIds.length > 0) {
			await prisma.pollTopic.createMany({
				data: topicIds.map((topicId) => ({ pollId: createdPoll.id, topicId })),
			})
			redis.sadd(REDIS_KEY_POLL_TOPICS + createdPoll.id, topicIds)
			topicIds.forEach(async (e) => {
				redis.sadd(REDIS_KEY_TOPIC_POLLS + e, createdPoll.id)
				const topicFollowers = await redisCacheCheck({
					key: REDIS_KEY_TOPIC_FOLLOWERS + e,
					args: [],
					type: "smembers",
					hit: async (cache) => cache,
					miss: async () => {
						const data = (
							await prisma.topic
								.findUnique({ where: { id: e } })
								.followers({ select: { followerId: true } })
						).map((e) => e.followerId)
						if (data.length === 0) return []
						redis.sadd(REDIS_KEY_TOPIC_FOLLOWERS + e, data)
						return data
					},
				})
				topicFollowers.forEach(async (e: string) => {
					const n = await redis.zcard(REDIS_KEY_HOME_FEED + e)
					redis.zincrby(REDIS_KEY_HOME_FEED + e, n + 1, createdPoll.id)
				})
			})
		}
		// Update Feeds
		const n_1 = await redis.zcard(REDIS_KEY_HOME_FEED + posterId)
		redis.zincrby(REDIS_KEY_HOME_FEED + posterId, n_1, createdPoll.id)
		const userFollowers = await redisCacheCheck({
			key: REDIS_KEY_USER_FOLLOWERS + posterId,
			args: [],
			type: "smembers",
			hit: (cache) => cache,
			miss: async () => {
				const data = (
					await prisma.user
						.findUnique({ where: { id: posterId } })
						.followers({ select: { followerId: true } })
				).map((e) => e.followerId)
				if (data.length === 0) return []
				redis.sadd(REDIS_KEY_USER_FOLLOWERS + posterId, data)
				return data
			},
		})
		userFollowers.forEach(async (e) => {
			const p = await redis.zscore(REDIS_KEY_HOME_FEED + e, createdPoll.id)
			if (p) redis.zincrby(REDIS_KEY_HOME_FEED + e, 5, createdPoll.id)
			else {
				const n = await redis.zcard(REDIS_KEY_HOME_FEED + e)
				redis.zincrby(REDIS_KEY_HOME_FEED + e, n + 10, createdPoll.id)
			}
		})

		redis.hset(REDIS_KEY_POLL_TEXTS, createdPoll.id, text)

		return {
			...createdPoll,
			topics: await prisma.pollTopic.findMany({
				where: { pollId: createdPoll.id },
				include: { topic: true },
			}),
		}
	}
}
