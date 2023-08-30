import { Ctx, Query, Resolver } from "type-graphql"
import { REDIS_SET_KEY_TOPICS } from "../constants"
import { prisma } from "../prisma"
import { graphqlContext } from "../types/graphqlContext"
import { redisCacheCheck } from "../utils/redisCacheCheck"
import { Topic } from "./../../prisma/models/misc/Topic"

@Resolver()
export class TopicResolver {
	@Query(() => [Topic])
	async getAllTopics(@Ctx() { redis }: graphqlContext) {
		return await redisCacheCheck({
			key: REDIS_SET_KEY_TOPICS,
			args: [],
			type: "smembers",
			hit: async (cache) => cache,
			// hit: async (cache) => Object.entries(cache).map((e) => ({ name: e[0], id: e[1] })),
			miss: async () => {
				const data = await prisma.topic.findMany({ select: { id: true } })
				if (data.length === 0) return []
				redis.sadd(
					REDIS_SET_KEY_TOPICS,
					data.map((e) => e.id)
				)
				return data
			},
		})
	}
}
