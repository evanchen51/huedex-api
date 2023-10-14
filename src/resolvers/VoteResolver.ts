import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import {
	NO_VALUE_PLACEHOLDER,
	REDIS_SORTEDSET_KEY_HOME_FEED,
	REDIS_HASH_KEY_OPTION,
	REDIS_HASH_KEY_POLL,
	REDIS_SET_KEY_POLL_TOPICS,
	REDIS_SET_KEY_TOPIC_FOLLOWERS,
	REDIS_SET_KEY_USER_FOLLOWERS,
	REDIS_HASH_KEY_USER_VOTE_HISTORY,
} from "../constants"
import { isLoggedIn } from "../middleware/graphql/isLoggedIn"
import { prisma } from "../prisma"
import { graphqlContext } from "../types/graphqlContext"
import { Vote } from "./../../prisma/models/votes/Vote"
import { transactionExecute, transactionForm } from "./../utils/prismaTransaction"
import { redisCacheCheck } from "./../utils/redisCacheCheck"

@InputType()
export class VoteState {
	@Field()
	optionId!: string
	@Field()
	state!: "voted" | "unvoted"
}

@InputType()
export class VoteReq {
	@Field()
	pollId!: string
	@Field()
	numOfChoices!: number
	@Field(() => [VoteState])
	voteState!: VoteState[]
}

@Resolver()
export class VoteResolver {
	@Query(() => [Vote])
	@UseMiddleware(isLoggedIn)
	async getVoteHistory(
		// @Arg("path", () => String) path: string,
		@Ctx() { req, redis }: graphqlContext
	): Promise<Vote[]> {
		const voterId = req.session.userId!
		return await redisCacheCheck({
			key: REDIS_HASH_KEY_USER_VOTE_HISTORY + voterId,
			args: [],
			type: "hgetall",
			hit: async (cache) =>
				Object.keys(cache).map((e) => ({
					optionId: e,
					pollId: cache[e],
					voterId,
				})),
			miss: async () => {
				const data = await prisma.vote.findMany({ where: { voterId } })
				if (data.length === 0) return []
				redis.hmset(
					REDIS_HASH_KEY_USER_VOTE_HISTORY + voterId,
					data.reduce((res, e) => ({ ...res, [e.optionId]: e.pollId }), {})
				)
				return data
			},
		})
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isLoggedIn)
	async sendVoteReq(
		@Arg("voteReq", () => VoteReq) { pollId, numOfChoices, voteState }: VoteReq,
		@Ctx() { req, redis }: graphqlContext
	): Promise<Boolean> {
		if (voteState.reduce((res, e) => (e.state === "voted" ? (res += 1) : res), 0) > numOfChoices)
			return false
		const voterId = req.session.userId!
		const prevRecord =
			(
				await prisma.user.findUnique({
					where: { id: voterId },
					select: { votes: { where: { pollId } } },
				})
			)?.votes.map((e) => e.optionId) || []
		function isValue<T>(a: T | false): a is T {
			return a !== false
		}
		const toUpdate = voteState
			.map((e) => {
				if (prevRecord.includes(e.optionId) && e.state === "unvoted")
					return { ...e, action: "unvote" }
				if (!prevRecord.includes(e.optionId) && e.state === "voted")
					return { ...e, action: "vote" }
				return false
			})
			.filter(isValue)

		if (toUpdate.length === 0) return false

		// Update Followers' Feeds
		const userFollowers = await redisCacheCheck({
			key: REDIS_SET_KEY_USER_FOLLOWERS + voterId,
			args: [],
			type: "smembers",
			hit: async (cache) => cache,
			miss: async () => {
				const rawData = (
					await prisma.user
						.findUnique({ where: { id: voterId } })
						.followers({ select: { followerId: true } })
				)
				if (!rawData || rawData.length === 0) return []
				const data = rawData.map((e) => e.followerId)
				redis.sadd(REDIS_SET_KEY_USER_FOLLOWERS + voterId, data)
				return data
			},
		})
		userFollowers.forEach(async (e: string) => {
			const p = await redis.zscore(REDIS_SORTEDSET_KEY_HOME_FEED + e, pollId)
			if (p) redis.zincrby(REDIS_SORTEDSET_KEY_HOME_FEED + e, 3, pollId)
			else {
				const n = await redis.zcard(REDIS_SORTEDSET_KEY_HOME_FEED + e)
				redis.zincrby(REDIS_SORTEDSET_KEY_HOME_FEED + e, n + 3, pollId)
			}
		})
		const topicIds = await redisCacheCheck({
			key: REDIS_SET_KEY_POLL_TOPICS + pollId,
			args: [],
			type: "smembers",
			hit: async (cache) => {
				if (cache.length === 1 && cache[0] === NO_VALUE_PLACEHOLDER) return []
				return cache
			},
			miss: async () => {
				const rawData = (
					await prisma.poll
						.findUnique({ where: { id: pollId } })
						.topics({ select: { topicId: true } })
				)
				if (!rawData || rawData.length === 0) {
					// NOTE remember to consider REDIS_VALUE_POLL_NO_TOPIC when mini-poll adds topics
					redis.sadd(REDIS_SET_KEY_POLL_TOPICS + pollId, NO_VALUE_PLACEHOLDER)
					return []
				}
				const data = rawData.map((e) => e.topicId)
				redis.sadd(REDIS_SET_KEY_POLL_TOPICS + pollId, topicIds)
				return data
			},
		})
		// NOTE might want to consider pulling instead of pushing?
		topicIds.forEach(async (e: string) => {
			const topicFollowers = await redisCacheCheck({
				key: REDIS_SET_KEY_TOPIC_FOLLOWERS + e,
				args: [],
				type: "smembers",
				hit: async (cache) => cache,
				miss: async () => {
					const rawData = (
						await prisma.topic
							.findUnique({ where: { id: e } })
							.followers({ select: { followerId: true } })
					)
					if (!rawData || rawData.length === 0) return []
					const data = rawData.map((e) => e.followerId)
					redis.sadd(REDIS_SET_KEY_TOPIC_FOLLOWERS + e, data)
					return data
				},
			})
			topicFollowers.forEach(async (e: string) => {
				const p = await redis.zscore(REDIS_SORTEDSET_KEY_HOME_FEED + e, pollId)
				if (p) redis.zincrby(REDIS_SORTEDSET_KEY_HOME_FEED + e, 1, pollId)
				else {
					const n = await redis.zcard(REDIS_SORTEDSET_KEY_HOME_FEED + e)
					redis.zincrby(REDIS_SORTEDSET_KEY_HOME_FEED + e, n + 1, pollId)
				}
			})
		})

		let transaction: transactionForm[] = []

		while (toUpdate.length > 0) {
			console.log(toUpdate)
			const current = Object.entries(toUpdate.at(-1)!).reduce(
				(res, e) => ({ ...res, [e[0]]: e[1] }),
				{} as {
					action: string
					optionId: string
					state: "voted" | "unvoted"
				}
			)
			toUpdate.pop()

			if (current.action === "vote") {
				if (toUpdate.length > 0) {
					const toUnvoteIndex = toUpdate.findIndex((e) => e.action === "unvote")
					if (toUnvoteIndex) {
						// Change Option
						const toUnvote = Object.entries(toUpdate.at(toUnvoteIndex)!).reduce(
							(res, e) => ({ ...res, [e[0]]: e[1] }),
							{} as {
								action: string
								optionId: string
								state: "voted" | "unvoted"
							}
						)
						toUpdate.splice(toUnvoteIndex, 1)

						// Option +1
						transaction = [
							...transaction,
							{
								table: "option",
								action: "update",
								args: {
									where: { id: current.optionId },
									data: { numOfVotes: { increment: 1 } },
								},
							},
						]
						redis.hincrby(REDIS_HASH_KEY_OPTION + current.optionId, "numOfVotes", 1)
						// Add Vote of Option
						redis.hset(REDIS_HASH_KEY_USER_VOTE_HISTORY + voterId, current.optionId, pollId)
						// Option -1
						transaction = [
							...transaction,
							{
								table: "option",
								action: "update",
								args: {
									where: { id: toUnvote.optionId },
									data: { numOfVotes: { decrement: 1 } },
								},
							},
						]
						redis.hincrby(REDIS_HASH_KEY_OPTION + toUnvote.optionId, "numOfVotes", -1)
						// if (numOfChoices = 1) Delete Vote of Option in redis
						redis.hdel(REDIS_HASH_KEY_USER_VOTE_HISTORY + voterId, toUnvote.optionId)
						// if (numOfChoices = 1) Change Vote Option in db
						transaction = [
							...transaction,
							{
								table: "vote",
								action: "update",
								args: {
									where: { joint: { optionId: toUnvote.optionId, pollId, voterId } },
									data: { optionId: current.optionId },
								},
							},
						]
						continue
					}
				}
				// Just Vote
				transaction = [
					...transaction,
					{
						table: "poll",
						action: "update",
						args: {
							where: { id: pollId },
							data: { numOfVotes: { increment: 1 } },
						},
					},
				]
				transaction = [
					...transaction,
					{
						table: "option",
						action: "update",
						args: {
							where: { id: current.optionId },
							data: { numOfVotes: { increment: 1 } },
						},
					},
				]
				redis.hincrby(REDIS_HASH_KEY_POLL + pollId, "numOfVotes", 1)
				redis.hincrby(REDIS_HASH_KEY_OPTION + current.optionId, "numOfVotes", 1)
				// Add New Vote
				redis.hset(REDIS_HASH_KEY_USER_VOTE_HISTORY + voterId, current.optionId, pollId)
				transaction = [
					...transaction,
					{
						table: "vote",
						action: "upsert",
						args: {
							create: { optionId: current.optionId, pollId, voterId },
							update: {},
							where: { joint: { optionId: current.optionId, pollId, voterId } },
						},
					},
				]
				continue
			}
			if (current.action === "unvote") {
				if (toUpdate.length > 0) {
					const toVoteIndex = toUpdate.findIndex((e) => e.action === "vote")
					if (toVoteIndex) {
						// Change Option
						const toVote = Object.entries(toUpdate.at(toVoteIndex)!).reduce(
							(res, e) => ({ ...res, [e[0]]: e[1] }),
							{} as {
								action: string
								optionId: string
								state: "voted" | "unvoted"
							}
						)
						toUpdate.splice(toVoteIndex, 1)

						// Option -1
						transaction = [
							...transaction,
							{
								table: "option",
								action: "update",
								args: {
									where: { id: current.optionId },
									data: { numOfVotes: { decrement: 1 } },
								},
							},
						]
						redis.hincrby(REDIS_HASH_KEY_OPTION + current.optionId, "numOfVotes", -1)
						// Add Vote of Option
						redis.hset(REDIS_HASH_KEY_USER_VOTE_HISTORY + voterId, toVote.optionId, pollId)
						// Option +1
						transaction = [
							...transaction,
							{
								table: "option",
								action: "update",
								args: {
									where: { id: toVote.optionId },
									data: { numOfVotes: { increment: 1 } },
								},
							},
						]
						redis.hincrby(REDIS_HASH_KEY_OPTION + toVote.optionId, "numOfVotes", 1)
						// if (numOfChoices = 1) Delete Vote of Option in redis
						redis.hdel(REDIS_HASH_KEY_USER_VOTE_HISTORY + voterId, current.optionId)
						// if (numOfChoices = 1) Change Vote Option in db
						transaction = [
							...transaction,
							{
								table: "vote",
								action: "update",
								args: {
									where: { joint: { optionId: current.optionId, pollId, voterId } },
									data: { optionId: toVote.optionId },
								},
							},
						]
						continue
					}
				}
				// Just Unvote
				transaction = [
					...transaction,
					{
						table: "poll",
						action: "update",
						args: {
							where: { id: pollId },
							data: { numOfVotes: { decrement: 1 } },
						},
					},
				]
				transaction = [
					...transaction,
					{
						table: "option",
						action: "update",
						args: {
							where: { id: current.optionId },
							data: { numOfVotes: { decrement: 1 } },
						},
					},
				]
				redis.hincrby(REDIS_HASH_KEY_OPTION + current.optionId, "numOfVotes", -1)
				redis.hincrby(REDIS_HASH_KEY_POLL + pollId, "numOfVotes", -1)
				// Delete Vote
				redis.hdel(REDIS_HASH_KEY_USER_VOTE_HISTORY + req.session.userId, current.optionId)
				transaction = [
					...transaction,
					{
						table: "vote",
						action: "delete",
						args: {
							where: { joint: { optionId: current.optionId, pollId, voterId } },
						},
					},
				]
				continue
			}
		}
		await transactionExecute(transaction)
		return true
	}
}
