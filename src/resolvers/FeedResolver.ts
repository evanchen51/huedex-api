import { Arg, Ctx, Field, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql"
import {
	NO_VALUE_PLACEHOLDER,
	REDIS_SET_KEY_USER_FOLLOWING_LANGUAGES,
	REDIS_SET_KEY_USER_FOLLOWING_TOPICS,
	REDIS_SET_KEY_USER_FOLLOWING_USERS,
	REDIS_SORTEDSET_KEY_HOME_FEED,
} from "../constants"
import { prisma } from "../prisma"
import { graphqlContext } from "../types/graphqlContext"
import { getPopularPollIds } from "../utils/getPopularPollIds"
import { redisCacheCheck } from "../utils/redisCacheCheck"
import { orderedShuffle } from "../utils/shuffle"
import { Poll } from "./../../prisma/models/polls/Poll"
import { isLoggedIn } from "./../middleware/graphql/isLoggedIn"

@ObjectType()
export class FeedItem {
	@Field()
	id: string
	@Field(() => Poll, { nullable: true })
	item: Poll | null
}

@Resolver()
export class FeedResolver {
	@Query(() => [FeedItem])
	async getVisitorFeed(
		@Arg("languageCodes", () => [String]) languageCodes: string[]
	): Promise<FeedItem[]> {
		const data = await getPopularPollIds({ languageCodes, req: 5, en: 3, any: 2 })
		if (!data || data.length === 0) return []
		return data.map((e) => ({
			...e,
			item: null,
		}))
	}

	@Query(() => [FeedItem])
	async getTopicTopPolls(
		@Arg("topicId", () => String) topicId: string,
		// @Arg("seen", () => [String]) seen: string[],
		@Arg("cursorId", () => String, { nullable: true }) cursorId?: string
	): Promise<FeedItem[]> {
		// if (seen.length === 0) seen.push(NO_VALUE_PLACEHOLDER)
		const data = await prisma.topic
			.findUnique({ where: { id: topicId } })
			.polls({ select: { pollId: true } })
		if (!data || data.length === 0) return []
		const pollIds = data.map((e) => e.pollId)
		// .filter((e) => !seen.includes(e))
		return (
			cursorId
				? await prisma.poll.findMany({
						where: { id: { in: pollIds } },
						take: 5,
						skip: 1,
						cursor: {
							id: cursorId,
						},
						orderBy: [{ numOfVotes: "desc" }, { createdAt: "desc" }],
						select: { id: true },
				  })
				: await prisma.poll.findMany({
						where: { id: { in: pollIds } },
						take: 5,
						orderBy: [{ numOfVotes: "desc" }, { createdAt: "desc" }],
						select: { id: true },
				  })
		)?.map((e) => ({
			...e,
			item: null,
		}))
	}

	@Query(() => [FeedItem])
	async getTopicNewPolls(
		@Arg("topicId", () => String) topicId: string,
		@Arg("cursorId", () => String, { nullable: true }) cursorId?: string
	): Promise<FeedItem[]> {
		const data = await prisma.topic
			.findUnique({ where: { id: topicId } })
			.polls({ select: { pollId: true } })
		if (!data || data.length === 0) return []
		const pollIds = data.map((e) => e.pollId)
		return (
			cursorId
				? await prisma.poll.findMany({
						where: { id: { in: pollIds } },
						take: 5,
						skip: 1,
						cursor: {
							id: cursorId,
						},
						orderBy: { createdAt: "desc" },
						select: { id: true },
				  })
				: await prisma.poll.findMany({
						where: { id: { in: pollIds } },
						take: 5,
						orderBy: { createdAt: "desc" },
						select: { id: true },
				  })
		)?.map((e) => ({
			...e,
			item: null,
		}))
	}

	@Query(() => [FeedItem])
	async getUserVotedPolls(
		@Arg("userId", () => String) userId: string,
		@Arg("cursorId", () => String, { nullable: true }) cursorId?: string
	): Promise<FeedItem[]> {
		const data = await prisma.user
			.findUnique({ where: { id: userId } })
			.votes({ select: { pollId: true } })
		if (!data || data.length === 0) return []
		const pollIds = data.map((e) => e.pollId)
		return (
			cursorId
				? await prisma.poll.findMany({
						where: { id: { in: pollIds } },
						take: 5,
						skip: 1,
						cursor: {
							id: cursorId,
						},
						orderBy: { createdAt: "desc" },
						select: { id: true },
				  })
				: await prisma.poll.findMany({
						where: { id: { in: pollIds } },
						take: 5,
						orderBy: { createdAt: "desc" },
						select: { id: true },
				  })
		)?.map((e) => ({
			...e,
			item: null,
		}))
	}

	@Query(() => [FeedItem])
	async getUserPostedPolls(
		@Ctx() { req }: graphqlContext,
		@Arg("userId", () => String) userId: string,
		@Arg("cursorId", () => String, { nullable: true }) cursorId?: string
	): Promise<FeedItem[]> {
		const data = await prisma.user
			.findUnique({ where: { id: userId } })
			.polls({ select: { id: true } })
		if (!data || data.length === 0) return []
		let pollIds = data.map((e) => e.id)
		if (userId === req.session.userId)
			pollIds = [
				...pollIds,
				...(
					await prisma.user
						.findUnique({ where: { id: userId } })
						.anonymousPolls({ select: { id: true } })
				)?.map((e) => e.id),
			]
		return (
			cursorId
				? await prisma.poll.findMany({
						where: { id: { in: pollIds } },
						take: 5,
						skip: 1,
						cursor: {
							id: cursorId,
						},
						orderBy: { createdAt: "desc" },
						select: { id: true },
				  })
				: await prisma.poll.findMany({
						where: { id: { in: pollIds } },
						take: 5,
						orderBy: { createdAt: "desc" },
						select: { id: true },
				  })
		)?.map((e) => ({
			...e,
			item: null,
		}))
	}

	@Query(() => [FeedItem])
	@UseMiddleware(isLoggedIn)
	async getHomeFeed(
		@Arg("seen", () => [String]) seen: string[],
		@Ctx() { req, redis }: graphqlContext
	): Promise<FeedItem[]> {
		const id = req.session.userId
		if (seen.length === 0) seen.push(NO_VALUE_PLACEHOLDER)
		else {
			seen.forEach(async (e) => {
				const p = await redis.zscore(REDIS_SORTEDSET_KEY_HOME_FEED + id, e)
				if (p) redis.zincrby(REDIS_SORTEDSET_KEY_HOME_FEED + id, -1, e)
			})
		}
		const languageCodes = await redisCacheCheck({
			key: REDIS_SET_KEY_USER_FOLLOWING_LANGUAGES + id,
			args: [],
			type: "smembers",
			hit: async (cache) => cache,
			miss: async () => {
				const rawData = (await prisma.user.findUnique({ where: { id } }).followingLanguages())
				if (!rawData || rawData.length === 0) return []
				const data = rawData.map((e) => e.languageCode)
				redis.sadd(REDIS_SET_KEY_USER_FOLLOWING_LANGUAGES + id, data)
				return data
			},
		})
		// NOTE might want to consider pulling following topics here?
		const feed = (
			await redisCacheCheck({
				key: REDIS_SORTEDSET_KEY_HOME_FEED + id,
				args: [0, 20],
				type: "zrevrange",
				hit: async (cache: string[]) =>
					[
						...new Set(
							orderedShuffle([
								cache,
								(
									await getPopularPollIds({ languageCodes, req: 6, en: 2, any: 2 })
								)?.map((e) => e.id),
							])
						),
					].map((e) => ({ id: e, item: null })),
				miss: async () => [],
			})
		)?.filter((e) => !seen.includes(e.id))
		if (feed && feed.length > 25) return feed
		// Not Enough Feed
		const topicIds = await redisCacheCheck({
			key: REDIS_SET_KEY_USER_FOLLOWING_TOPICS + id,
			args: [],
			type: "smembers",
			hit: async (cache) => cache,
			miss: async () => {
				const data = await prisma.user.findUnique({
					where: { id },
					select: { followingTopics: { select: { topicId: true } } },
				})
				if (!data || !data.followingTopics || data.followingTopics.length === 0) return []
				let dataIds = data.followingTopics.map((e) => e.topicId)
				redis.sadd(REDIS_SET_KEY_USER_FOLLOWING_TOPICS + id, dataIds)
				return dataIds
			},
		})
		const userIds = await redisCacheCheck({
			key: REDIS_SET_KEY_USER_FOLLOWING_USERS + id,
			args: [],
			type: "smembers",
			hit: async (cache) => cache,
			miss: async () => {
				const data = await prisma.user.findUnique({
					where: { id },
					select: { followingUsers: { select: { userId: true } } },
				})
				if (!data || !data.followingUsers || data.followingUsers.length === 0) return []
				let dataIds = data.followingUsers.map((e) => e.userId)
				redis.sadd(REDIS_SET_KEY_USER_FOLLOWING_USERS + id, dataIds)
				return dataIds
			},
		})
		const userPollIds = (
			await prisma.user.findUnique({ where: { id } }).polls({ select: { id: true } })
		)
			.map((e) => e.id)
			.filter((e) => !seen.includes(e))
		if (topicIds.length + userIds.length + userPollIds.length === 0) {
			return (
				await getPopularPollIds({
					languageCodes: languageCodes.length > 0 ? languageCodes : ["en"],
					req: 16,
					en: 8,
					any: 6,
				})
			)
				.filter((e) => !seen.includes(e.id))
				.map((e) => ({
					...e,
					item: null,
				}))
		}
		const followingLanguagesPollIds =
			languageCodes.length > 0
				? [
						...(
							await prisma.poll.findMany({
								where: {
									AND: [{ languageCode: { in: languageCodes } }, { id: { notIn: seen } }],
								},
								select: { id: true },
								orderBy: [{ numOfVotes: "desc" }, { createdAt: "desc" }],
								take: 2,
							})
						)?.map((e) => e.id),
						...(
							await prisma.poll.findMany({
								where: {
									AND: [{ languageCode: { in: languageCodes } }, { id: { notIn: seen } }],
								},
								select: { id: true },
								orderBy: [{ createdAt: "desc" }, { numOfVotes: "desc" }],
								take: 3,
							})
						)?.map((e) => e.id),
				  ]
				: []
		const followingTopicsPollIds =
			topicIds.length > 0
				? [
						...(
							await prisma.poll.findMany({
								where: {
									AND: [
										{ topics: { some: { topicId: { in: topicIds } } } },
										{ id: { notIn: seen } },
									],
								},
								select: { id: true },
								orderBy: [{ numOfVotes: "desc" }, { createdAt: "desc" }],
								take: 2,
							})
						)?.map((e) => e.id),
						...(
							await prisma.poll.findMany({
								where: {
									AND: [
										{ topics: { some: { topicId: { in: topicIds } } } },
										{ id: { notIn: seen } },
									],
								},
								select: { id: true },
								orderBy: [{ createdAt: "desc" }, { numOfVotes: "desc" }],
								take: 3,
							})
						)?.map((e) => e.id),
				  ]
				: []
		const followingUsersPollIds =
			userIds.length > 0
				? [
						...(
							await prisma.poll.findMany({
								where: {
									OR: [
										{ posterId: { in: userIds } },
										{ votes: { some: { voterId: { in: userIds } } } },
									],
									AND: { id: { notIn: seen } },
								},
								select: { id: true },
								orderBy: [{ numOfVotes: "desc" }, { createdAt: "desc" }],
								take: 4,
							})
						)?.map((e) => e.id),
						...(
							await prisma.poll.findMany({
								where: {
									OR: [
										{ posterId: { in: userIds } },
										{ votes: { some: { voterId: { in: userIds } } } },
									],
									AND: { id: { notIn: seen } },
								},
								select: { id: true },
								orderBy: [{ createdAt: "desc" }, { numOfVotes: "desc" }],
								take: 6,
							})
						)?.map((e) => e.id),
				  ]
				: []
		return [
			...new Set(
				orderedShuffle([
					feed.length > 0 ? feed.map((e) => e.id) : [],
					followingLanguagesPollIds,
					followingTopicsPollIds,
					followingUsersPollIds,
					userPollIds,
					(
						await getPopularPollIds({
							languageCodes,
							req:
								6 +
								(20 -
									userPollIds.length -
									followingLanguagesPollIds.length -
									followingTopicsPollIds.length -
									followingUsersPollIds.length),
							en: 2,
							any: 2,
						})
					)
						.map((e) => e.id)
						.filter((e) => !seen.includes(e)),
				])
			),
		].map((e) => ({ id: e, item: null }))
	}
}
