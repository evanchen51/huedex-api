import { Ctx, Query, Resolver } from "type-graphql";
import { Language } from './../../prisma/models/tables/Language';
import { REDIS_KEY_LANGUAGE_CODES } from "./../constants";
import { prisma } from "./../prisma";
import { GraphQLContext } from "./../types/graphqlContext";
import { redisCacheCheck } from './../utils/redisCacheCheck';

@Resolver()
export class UtilResolver {
	@Query(() => [Language], { nullable: true })
	async getAllLanguages(@Ctx() { redis }: GraphQLContext) {
		return await redisCacheCheck({
			key: REDIS_KEY_LANGUAGE_CODES,
			args: [],
			type: "hgetall",
			hit: async (cache) => Object.entries(cache).map((e) => ({ code: e[0], nativeName: e[1] })),
			miss: async () => {
				const data = await prisma.language.findMany({ skip: 1 })
				redis.hset(
					REDIS_KEY_LANGUAGE_CODES,
					...data.flatMap((e) => [e.code, e.nativeName])
				)
				return data
			}
		})
	}
}
