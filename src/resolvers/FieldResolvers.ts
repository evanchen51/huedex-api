import { Ctx, FieldResolver, Resolver, Root } from "type-graphql"
import { prisma } from "../prisma"
import { redisCacheCheck } from "../utils/redisCacheCheck"
import { Topic } from "./../../prisma/models/misc/Topic"
import { Poll } from "./../../prisma/models/polls/Poll"
import { PollTopic } from "./../../prisma/models/relations/PollTopic"
import { User } from "./../../prisma/models/users/User"
import {
	NO_VALUE_PLACEHOLDER,
	REDIS_HASH_KEY_POLL,
	REDIS_HASH_KEY_TOPIC,
	REDIS_HASH_KEY_USER,
	REDIS_SET_KEY_POLL_OPTIONS,
	REDIS_SET_KEY_POLL_TOPICS,
} from "./../constants"
import { graphqlContext } from "./../types/graphqlContext"
import { redisCacheToObject } from "./../utils/redisCacheToObject"
import { FeedItem } from "./FeedResolver"

@Resolver(Poll)
export class PollFieldResolver {
	@FieldResolver(() => User, { nullable: true })
	async poster(@Root() { posterId }: Poll, @Ctx() { userLoader }: graphqlContext) {
		if (!posterId) return null
		return await redisCacheCheck({
			key: REDIS_HASH_KEY_USER + posterId,
			args: [],
			type: "hgetall",
			hit: async (cache) => redisCacheToObject(cache),
			miss: async () => userLoader.load(posterId),
		})
	}

	@FieldResolver(() => [Option])
	async options(@Root() poll: Poll, @Ctx() { redis, optionLoader }: graphqlContext) {
		return optionLoader.load(
			await redisCacheCheck({
				key: REDIS_SET_KEY_POLL_OPTIONS + poll.id,
				args: [],
				type: "smembers",
				hit: async (cache) => cache,
				miss: async () => {
					const rawData = (
						await prisma.poll.findUnique({ where: { id: poll.id } }).options({
							select: { id: true },
							orderBy: [{ numOfVotes: "desc" }, { createdAt: "desc" }],
						})
					)
					if (!rawData || rawData.length === 0) return []
					const data = rawData.map((e) => e.id)
					redis.sadd(REDIS_SET_KEY_POLL_OPTIONS + poll.id, data)
					return data
				},
			})
		)
	}

	@FieldResolver(() => [Option])
	async topOptions(@Root() poll: Poll, @Ctx() { redis, topOptionLoader }: graphqlContext) {
		return topOptionLoader.load(
			await redisCacheCheck({
				key: REDIS_SET_KEY_POLL_OPTIONS + poll.id,
				args: [],
				type: "smembers",
				hit: async (cache) => cache,
				miss: async () => {
					const rawData = (
						await prisma.poll
							.findUnique({ where: { id: poll.id } })
							.options({ select: { id: true } })
					)
					if (!rawData || rawData.length === 0) return []
					const data = rawData.map((e) => e.id)
					redis.sadd(REDIS_SET_KEY_POLL_OPTIONS + poll.id, data)
					return data
				},
			})
		)
	}

	@FieldResolver(() => Number)
	async numOfOptions(@Root() poll: Poll, @Ctx() { redis }: graphqlContext) {
		return await redisCacheCheck({
			key: REDIS_SET_KEY_POLL_OPTIONS + poll.id,
			args: [],
			type: "scard",
			hit: async (cache) => cache,
			miss: async () => {
				const data = await prisma.poll.findUnique({
					where: { id: poll.id },
					select: {
						_count: {
							select: { options: true },
						},
						options: { select: { id: true } },
					},
				})

				if (!data) return 0
				redis.sadd(REDIS_SET_KEY_POLL_OPTIONS + poll.id, data.options)
				return data._count
			},
		})
	}

	@FieldResolver(() => [PollTopic])
	async topics(@Root() poll: Poll, @Ctx() { redis }: graphqlContext) {
		return await redisCacheCheck({
			key: REDIS_SET_KEY_POLL_TOPICS + poll.id,
			args: [],
			type: "smembers",
			hit: async (cache) => {
				if (cache.length === 1 && cache[0] === NO_VALUE_PLACEHOLDER) return []
				return cache.map((e: string) => ({ pollId: poll.id, topicId: e }))
			},
			miss: async () => {
				const rawData = (
					await prisma.poll
						.findUnique({ where: { id: poll.id } })
						.topics({ select: { topicId: true } })
				)
				if (!rawData || rawData.length === 0) {
					// NOTE remember to consider REDIS_VALUE_POLL_NO_TOPIC when mini-poll adds topics
					redis.sadd(REDIS_SET_KEY_POLL_TOPICS + poll.id, NO_VALUE_PLACEHOLDER)
					return []
				}
				const data = rawData.map((e) => e.topicId)
				redis.sadd(REDIS_SET_KEY_POLL_TOPICS + poll.id, data)
				return data.map((e) => ({ pollId: poll.id, topicId: e }))
			},
		})
	}
}

@Resolver(PollTopic)
export class PollTopicFieldResolver {
	@FieldResolver(() => Topic)
	async topic(@Root() pollTopic: PollTopic, @Ctx() { topicLoader }: graphqlContext) {
		return await redisCacheCheck({
			key: REDIS_HASH_KEY_TOPIC + pollTopic.topicId,
			args: [],
			type: "hgetall",
			hit: async (cache) => redisCacheToObject(cache),
			miss: async () => topicLoader.load(pollTopic.topicId),
		})
	}
}

@Resolver(FeedItem)
export class FeedFieldResolver {
	@FieldResolver(() => Poll)
	async item(@Root() { id }: FeedItem, @Ctx() { pollLoader }: graphqlContext) {
		return await redisCacheCheck({
			key: REDIS_HASH_KEY_POLL + id,
			args: [],
			type: "hgetall",
			hit: async (cache) => redisCacheToObject(cache),
			miss: async () => pollLoader.load(id),
		})
	}
}
