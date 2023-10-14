import { Ctx, Query, Resolver } from "type-graphql"
import { Language } from "./../../prisma/models/tables/Language"
import { REDIS_HASH_KEY_LANGUAGE_CODES, UNKNOWN } from "./../constants"
import { prisma } from "./../prisma"
import { graphqlContext } from "./../types/graphqlContext"
import { redisCacheCheck } from "./../utils/redisCacheCheck"

@Resolver()
export class UtilResolver {
	@Query(() => [Language], { nullable: true })
	async getAllLanguages(@Ctx() { redis }: graphqlContext) {
		return await redisCacheCheck({
			key: REDIS_HASH_KEY_LANGUAGE_CODES,
			args: [],
			type: "hgetall",
			hit: async (cache) => Object.entries(cache).map((e) => ({ code: e[0], nativeName: e[1] })),
			miss: async () => {
				const data = (await prisma.language.findMany())?.filter((e) => e.code !== UNKNOWN)
				redis.hset(
					REDIS_HASH_KEY_LANGUAGE_CODES,
					...data.flatMap((e) => [e.code, e.nativeName])
				)
				return data
			},
		})
	}
}
