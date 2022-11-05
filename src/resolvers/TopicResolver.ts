import { Ctx, Query, Resolver } from "type-graphql"
import { REDIS_KEY_TOPICS } from "../constants"
import { prisma } from "../prisma"
import { GraphQLContext } from "../types/GraphQLContext"
import { redisCacheCheck } from "../utils/redisCacheCheck"
import { Topic } from "./../../prisma/models/misc/Topic"

@Resolver()
export class TopicResolver {
	@Query(() => [Topic])
	async getAllTopics(@Ctx() { redis }: GraphQLContext) {
		return await redisCacheCheck({
			key: REDIS_KEY_TOPICS,
			args: [],
			type: "hgetall",
			hit: async (cache) => Object.entries(cache).map((e) => ({ name: e[0], id: e[1] })),
			miss: async () => {
				const data = await prisma.topic.findMany({ select: { id: true, name: true } })
				if (data.length === 0) return []
				redis.hset(
					REDIS_KEY_TOPICS,
					data.flatMap((e) => [e.name, e.id])
				)
				return data
			},
		})
	}
}
