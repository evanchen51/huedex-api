import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql"
import { isLoggedIn } from "../middleware/graphql/isLoggedIn"
import { prisma } from "../prisma"
import { graphqlContext } from "../types/graphqlContext"
import {
	REDIS_SET_KEY_TOPIC_FOLLOWERS,
	REDIS_SET_KEY_USER_FOLLOWERS,
	REDIS_SET_KEY_USER_FOLLOWING_LANGUAGES,
	REDIS_SET_KEY_USER_FOLLOWING_TOPICS,
	REDIS_SET_KEY_USER_FOLLOWING_USERS,
} from "./../constants"

@Resolver()
export class UserResolver {
	@Mutation(() => Boolean)
	@UseMiddleware(isLoggedIn)
	async sendFollowLanguageReq(
		@Arg("languageCode", () => String) languageCode: string,
		@Ctx() { req, redis }: graphqlContext
	): Promise<boolean> {
		const followerId = req.session.userId!
		redis.sadd(REDIS_SET_KEY_USER_FOLLOWING_LANGUAGES + followerId, languageCode)
		await prisma.followLanguage.upsert({
			create: { followerId, languageCode },
			update: {},
			where: { joint: { followerId, languageCode } },
		})
		return true
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isLoggedIn)
	async sendUnfollowLanguageReq(
		@Arg("languageCode", () => String) languageCode: string,
		@Ctx() { req, redis }: graphqlContext
	): Promise<boolean> {
		const followerId = req.session.userId!
		redis.srem(REDIS_SET_KEY_USER_FOLLOWING_LANGUAGES + followerId, languageCode)
		await prisma.followLanguage.delete({ where: { joint: { followerId, languageCode } } })
		return true
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isLoggedIn)
	async sendFollowTopicReq(
		@Arg("topicId", () => String) topicId: string,
		@Ctx() { req, redis }: graphqlContext
	): Promise<boolean> {
		const followerId = req.session.userId!
		redis.sadd(REDIS_SET_KEY_USER_FOLLOWING_TOPICS + followerId, topicId)
		redis.sadd(REDIS_SET_KEY_TOPIC_FOLLOWERS + topicId, followerId)
		await prisma.followTopic.upsert({
			create: { followerId, topicId },
			update: {},
			where: { joint: { followerId, topicId } },
		})
		return true
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isLoggedIn)
	async sendUnollowTopicReq(
		@Arg("topicId", () => String) topicId: string,
		@Ctx() { req, redis }: graphqlContext
	): Promise<boolean> {
		const followerId = req.session.userId!
		redis.srem(REDIS_SET_KEY_USER_FOLLOWING_TOPICS + followerId, topicId)
		await prisma.followTopic.delete({ where: { joint: { followerId, topicId } } })
		return true
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isLoggedIn)
	async sendFollowUserReq(
		@Arg("userId", () => String) userId: string,
		@Ctx() { req, redis }: graphqlContext
	): Promise<boolean> {
		const followerId = req.session.userId!
		redis.sadd(REDIS_SET_KEY_USER_FOLLOWING_USERS + followerId, userId)
		redis.sadd(REDIS_SET_KEY_USER_FOLLOWERS + userId, followerId)
		await prisma.followUser.upsert({
			create: { followerId, userId },
			update: {},
			where: { joint: { followerId, userId } },
		})
		return true
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isLoggedIn)
	async sendUnfollowUserReq(
		@Arg("userId", () => String) userId: string,
		@Ctx() { req, redis }: graphqlContext
	): Promise<boolean> {
		const followerId = req.session.userId!
		redis.srem(REDIS_SET_KEY_USER_FOLLOWING_USERS + followerId, userId)
		await prisma.followUser.delete({ where: { joint: { followerId, userId } } })
		return true
	}
}
