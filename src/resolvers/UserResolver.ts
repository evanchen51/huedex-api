import { UserPersonalSettings } from "./../../prisma/models/users/UserPersonalSettings"
import { User } from "./../../prisma/models/users/User"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { COOKIE_NAME, REDIS_KEY_USER_DISPLAY_NAMES, REDIS_KEY_USER } from "../constants"
import { isLoggedIn } from "../middleware/graphql/isLoggedIn"
import { GraphQLContext } from "../types/GraphQLContext"
import { redisCacheToObject } from "../utils/redisCacheToObject"
import { prisma } from "./../prisma"
import { redisCacheCheck } from "./../utils/redisCacheCheck"

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async getCurrentUser(@Ctx() { req, redis }: GraphQLContext): Promise<User | null> {
		const id = req.session.userId
		if (!id) return null // null for not logged in
		return await redisCacheCheck({
			key: REDIS_KEY_USER + id,
			args: [],
			type: "hgetall",
			hit: async (cache) => redisCacheToObject(cache),
			miss: async () => {
				const data = await prisma.user.findUnique({ where: { id } })
				if (data) redis.hset(REDIS_KEY_USER + id, Object.entries(data).flat(1))
				return data || null
			},
		})
	}

	@Query(() => UserPersonalSettings, { nullable: true })
	@UseMiddleware(isLoggedIn)
	async getCurrentUserPersonalSettings(
		@Ctx() { req }: GraphQLContext
	): Promise<UserPersonalSettings | null> {
		const userId = req.session.userId!
		return (
			(await prisma.userPersonalSettings.findUnique({
				where: { userId },
			})) || null
		)
	}

	@Mutation(() => UserPersonalSettings)
	@UseMiddleware(isLoggedIn)
	async setUserDisplayLanguage(
		@Arg("displayLanguageCode", () => String) displayLanguageCode: string,
		@Ctx() { req }: GraphQLContext
	): Promise<UserPersonalSettings> {
		const userId = req.session.userId!
		return await prisma.userPersonalSettings.update({
			where: { userId },
			data: { displayLanguageCode },
		})
	}

	@Mutation(() => User)
	@UseMiddleware(isLoggedIn)
	async setUserDisplayName(
		@Arg("displayName", () => String) displayName: string,
		@Ctx() { req, redis }: GraphQLContext
	): Promise<User> {
		const id = req.session.userId
		redis.sadd(REDIS_KEY_USER_DISPLAY_NAMES, displayName)
		const user = await prisma.user.update({ where: { id }, data: { displayName } })
		redis.hset(REDIS_KEY_USER + id, Object.entries(user).flat(1))
		return user
	}

	// @Query(() => [String])
	// async getAllDisplayNames(@Ctx() { redis }: GraphQLContext): Promise<string[]> {
	// 	const cachedDisplayNames = await redis.smembers(REDIS_KEY_USER_DISPLAY_NAMES)
	// 	if (cachedDisplayNames.length > 0) return cachedDisplayNames
	// 	const displayNames = (await prisma.user.findMany({ select: { displayName: true } }))
	// 		.map((e) => e.displayName)
	// 		.filter((e) => e)
	// 	if (displayNames.length === 0) return []
	// 	redis.sadd(REDIS_KEY_USER_DISPLAY_NAMES, displayNames)
	// 	return displayNames as string[]
	// }

	@Mutation(() => Boolean)
	@UseMiddleware(isLoggedIn)
	logout(@Ctx() { req, res }: GraphQLContext) {
		return new Promise((result) =>
			req.session.destroy((err) => {
				res.clearCookie(COOKIE_NAME)
				if (err) {
					console.log(err)
					result(false)
					return
				}
				result(true)
			})
		)
	}
}
