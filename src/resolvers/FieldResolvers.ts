import { Ctx, FieldResolver, Resolver, Root } from "type-graphql"
import { prisma } from "../prisma"
import { redisCacheCheck } from "../utils/redisCacheCheck"
import { Topic } from "./../../prisma/models/misc/Topic"
import { Poll } from "./../../prisma/models/polls/Poll"
import { PollTopic } from "./../../prisma/models/relations/PollTopic"
import { User } from "./../../prisma/models/users/User"
import {
	NO_VALUE_PLACEHOLDER,
	REDIS_KEY_POLL,
	REDIS_KEY_POLL_OPTIONS,
	REDIS_KEY_POLL_TOPICS,
	REDIS_KEY_TOPIC,
	REDIS_KEY_USER,
} from "./../constants"
import { GraphQLContext } from "./../types/GraphQLContext"
import { redisCacheToObject } from "./../utils/redisCacheToObject"
import { FeedItem } from "./FeedResolver"

@Resolver(Poll)
export class PollFieldResolver {
	@FieldResolver(() => User, { nullable: true })
	async poster(@Root() { posterId }: Poll, @Ctx() { userLoader }: GraphQLContext) {
		if (!posterId) return null
		return await redisCacheCheck({
			key: REDIS_KEY_USER + posterId,
			args: [],
			type: "hgetall",
			hit: async (cache) => redisCacheToObject(cache),
			miss: async () => userLoader.load(posterId),
		})
	}

	@FieldResolver(() => [Option])
	async options(@Root() poll: Poll, @Ctx() { redis, optionLoader }: GraphQLContext) {
		return optionLoader.load(
			await redisCacheCheck({
				key: REDIS_KEY_POLL_OPTIONS + poll.id,
				args: [],
				type: "smembers",
				hit: async (cache) => cache,
				miss: async () => {
					const data = (
						await prisma.poll.findUnique({ where: { id: poll.id } }).options({
							select: { id: true },
							orderBy: [{ numOfVotes: "desc" }, { createdAt: "desc" }],
						})
					).map((e) => e.id)
					if (!data || data.length === 0) return []
					redis.sadd(REDIS_KEY_POLL_OPTIONS + poll.id, data)
					return data
				},
			})
		)
	}

	@FieldResolver(() => [Option])
	async topOptions(@Root() poll: Poll, @Ctx() { redis, topOptionLoader }: GraphQLContext) {
		return topOptionLoader.load(
			await redisCacheCheck({
				key: REDIS_KEY_POLL_OPTIONS + poll.id,
				args: [],
				type: "smembers",
				hit: async (cache) => cache,
				miss: async () => {
					const data = (
						await prisma.poll
							.findUnique({ where: { id: poll.id } })
							.options({ select: { id: true } })
					).map((e) => e.id)
					if (!data || data.length === 0) return []
					redis.sadd(REDIS_KEY_POLL_OPTIONS + poll.id, data)
					return data
				},
			})
		)
	}

	@FieldResolver(() => [PollTopic])
	async topics(@Root() poll: Poll, @Ctx() { redis }: GraphQLContext) {
		return await redisCacheCheck({
			key: REDIS_KEY_POLL_TOPICS + poll.id,
			args: [],
			type: "smembers",
			hit: async (cache) => {
				if (cache.length === 1 && cache[0] === NO_VALUE_PLACEHOLDER) return []
				return cache.map((e: string) => ({ pollId: poll.id, topicId: e }))
			},
			miss: async () => {
				const data = (
					await prisma.poll
						.findUnique({ where: { id: poll.id } })
						.topics({ select: { topicId: true } })
				).map((e) => e.topicId)
				if (data.length === 0) {
					// NOTE remember to consider REDIS_VALUE_POLL_NO_TOPIC when mini-poll adds topics
					redis.sadd(REDIS_KEY_POLL_TOPICS + poll.id, NO_VALUE_PLACEHOLDER)
					return []
				}
				redis.sadd(REDIS_KEY_POLL_TOPICS + poll.id, data)
				return data.map((e) => ({ pollId: poll.id, topicId: e }))
			},
		})
	}
}

@Resolver(PollTopic)
export class PollTopicFieldResolver {
	@FieldResolver(() => Topic)
	async topic(@Root() pollTopic: PollTopic, @Ctx() { topicLoader }: GraphQLContext) {
		return await redisCacheCheck({
			key: REDIS_KEY_TOPIC + pollTopic.topicId,
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
	async item(@Root() { id }: FeedItem, @Ctx() { pollLoader }: GraphQLContext) {
		return await redisCacheCheck({
			key: REDIS_KEY_POLL + id,
			args: [],
			type: "hgetall",
			hit: async (cache) => redisCacheToObject(cache),
			miss: async () => pollLoader.load(id),
		})
	}
}
