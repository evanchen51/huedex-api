import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { getConnection } from "typeorm"
import { REDIS_PREFIX_CREATEPOLLTIMER } from "./../constants"
import { Option } from "./../entities/Option"
import { OptionText } from "./../entities/OptionText"
import { Poll } from "./../entities/Poll"
import { PollTag } from "./../entities/PollTag"
import { PollText } from "./../entities/PollText"
import { Tag } from "./../entities/Tag"
import { TagText } from "./../entities/TagText"
import { User } from "./../entities/User"
import { createPollTimer } from "./../middleware/createPollTimer"
import { isLoggedIn } from "./../middleware/isLoggedIn"
import { Context } from "./../types/Context"
import {
	CreatePollInput,
	OptionClientFullView,
	PollClientFullView,
	Text,
} from "./../types/graphqlTypes"
import { processText } from "./../utils/processText"

@Resolver(User)
export class PollResolver {
	@Query(() => PollClientFullView, { nullable: true })
	async getSinglePoll(
		@Arg("id", () => Int) id: number,
		@Arg("langId", () => Int) langId: number
	): Promise<PollClientFullView | null> {
		const data = await getConnection()
			.getRepository(Poll)
			.createQueryBuilder("poll")
			.where("poll.id = :id", { id })
			.leftJoinAndSelect("poll.poster", "poster")
			.leftJoinAndSelect("poll.pollText", "pollText")
			.leftJoinAndSelect("poll.options", "option")
			.leftJoinAndSelect("option.optionText", "optionText")
			.getOne()

		if (!data) return null

		const text: Text = processText(
			data.pollText.map(({ text, langId, createdAt }) => {
				return { text, langId, createdAt }
			}),
			langId
		)

		const options: OptionClientFullView[] = data.options.map((e) => {
			return {
				optionId: e.id,
				pollId: data.id,
				text: processText(
					e.optionText.map(({ text, langId, createdAt }) => {
						return { text, langId, createdAt }
					}),
					langId
				),
				numOfVotes: e.numOfVotes,
			}
		})

		const res: PollClientFullView = {
			pollId: data.id,
			text,
			options,
			posterId: data.poster ? data.poster.id : null,
			posterDisplayName: data.poster ? data.poster.displayName : null,
			numOfVotes: data.numOfVotes,
			createdAt: data.createdAt,
		}

		return res
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isLoggedIn, createPollTimer)
	async createPoll(
		@Arg("createPollInput") createPollInput: CreatePollInput,
		@Ctx() { req, redis }: Context
	): Promise<Boolean> {
		const { langId, text, optionTexts, newTags, anonymous } = createPollInput
		let { tagIds } = createPollInput

		// Early Exit with invalid langId
		// if (!(await LangTable.findOne(langId))) return true

		// timer
		await redis.set(
			REDIS_PREFIX_CREATEPOLLTIMER + req.session.userId,
			"WAITING",
			"ex", // sec
			60 * 5 // 5 min
		)

		// Insert New Poll
		const createdPoll = await getConnection()
			.createQueryBuilder()
			.insert()
			.into(Poll)
			.values({
				posterId: !anonymous ? req.session.userId : null,
				anonymousPosterId: anonymous ? req.session.userId : null,
			})
			.returning("id")
			.execute()

		const pollId = createdPoll.raw[0].id

		// Insert Poll's Text
		await getConnection()
			.createQueryBuilder()
			.insert()
			.into(PollText)
			.values({
				pollId,
				text,
				langId,
			})
			.execute()

		// Insert Poll's Options
		const createdPollOptions = await getConnection()
			.createQueryBuilder()
			.insert()
			.into(Option)
			.values(
				optionTexts.map(() => {
					return {
						pollId,
					}
				})
			)
			.returning("id")
			.execute()

		// Insert Poll's Options' Texts
		await getConnection()
			.createQueryBuilder()
			.insert()
			.into(OptionText)
			.values(
				createdPollOptions.raw.map((option: Option, i: number) => {
					return {
						optionId: option.id,
						text: optionTexts[i],
						langId,
					}
				})
			)
			.execute()

		if (newTags.length > 0) {
			// Insert New Tags if needed
			const createdNewTags = await getConnection()
				.createQueryBuilder()
				.insert()
				.into(Tag)
				.values(
					newTags.map(() => {
						return {}
					})
				)
				.returning("id")
				.execute()
			// Insert New Tags' Texts if needed
			await getConnection()
				.createQueryBuilder()
				.insert()
				.into(TagText)
				.values(
					createdNewTags.raw.map((tag: Tag, i: number) => {
						return {
							tagId: tag.id,
							text: newTags[i],
							langId,
						}
					})
				)
				.execute()
			// Include New Tags' Ids
			tagIds = tagIds.concat(
				createdNewTags.raw.map((tag: Tag) => {
					return tag.id
				})
			)
		}

		// Insert Poll Tag Relationships
		if (tagIds.length > 0) {
			await getConnection()
				.createQueryBuilder()
				.insert()
				.into(PollTag)
				.values(
					tagIds.map((tagId: number) => {
						return { pollId, tagId }
					})
				)
				.execute()
		}

		/* // const redisPollKey =
		// 	REDIS_PREFIX_POLL_OBJECT +
		// 	createdPoll.raw[0].id.toString() +
		// 	":" +
		// 	langId.toString()
		// let redisPollObject = {
		// 	text: text,
		// 	posterId: anonymous ? "anonymous" : req.session.userId!.toString(),
		// 	numOfVotes: "0",
		// }
		// createdPollOptions.raw.map((e: Option, i: number) => {
		// 	redisPollObject = {
		// 		...redisPollObject,
		// 		["option:" + e.id]: optionTexts[i],
		// 		["option:" + e.id + ":numOfVotes"]: "0",
		// 	}
		// })
		// tagIds.map((e: number, i: number) => {
		// 	redisPollObject = {
		// 		...redisPollObject,
		// 		["tag:" + e]: existingTags.concat(newTags)[i],
		// 	}
		// })
		// redis.hset(redisPollKey, redisPollObject) */

		// TODO media, nsfw

		// const posterDisplayName = !!createdPoll.raw[0].posterId
		// 	? await User.findOne({
		// 			where: { id: createdPoll.raw[0].posterId },
		// 			select: ["displayName"],
		// 	  }).then((res) => res?.displayName)
		// 	: null

		return true

		// return {
		// 	pollId: createdPoll.raw[0].id,
		// 	langId: createdPollText.raw[0].langId,
		// 	text: createdPollText.raw[0].text,
		// 	optionTexts: createdPollOptionTexts.raw.map((o: OptionText) => o.text),
		// 	optionIds: createdPollOptions.raw.map((o: Option) => o.id),
		// 	anonymous: !createdPoll.raw[0].posterId,
		// 	posterId: createdPoll.raw[0].posterId,
		// 	posterDisplayName,
		// 	numOfVotes: createdPoll.raw[0].numOfVotes,
		// }
	}
}
