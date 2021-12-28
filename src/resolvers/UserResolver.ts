import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { COOKIE_NAME } from "../constants"
import { User } from "../entities/User"
import { isLoggedIn } from "../middleware/isLoggedIn"
import { Context } from "../types/Context"
import { UserLangPref } from "./../entities/UserLangPref"
import { LangPref } from "./../types/graphqlTypes"

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async getCurrentUser(@Ctx() { req }: Context) {
		if (!req.session.userId) return null // null for not logged in
		return await User.findOne(req.session.userId)
	}

	@Query(() => LangPref)
	@UseMiddleware(isLoggedIn)
	async getCurrentUserAllLangPrefs(@Ctx() { req }: Context) {
		const res = (
			await UserLangPref.find({
				where: { userId: req.session.userId },
				select: ["langId"],
			})
		).map((e) => e.langId)
		return { langId: res }
	}

	@Mutation(() => LangPref)
	@UseMiddleware(isLoggedIn)
	async setUserLangPref(
		@Arg("newLangPref", () => [Int]) newLangPref: number[],
		@Ctx() { req }: Context
	) {
		await User.update({ id: req.session.userId }, { primaryLangPref: newLangPref[0] })
		const oldLangPref = await UserLangPref.find({
			where: { userId: req.session.userId },
		})
		const toRemove = oldLangPref.filter((e) => !newLangPref.includes(e.langId))
		if (toRemove.length > 0) await UserLangPref.remove(toRemove)
		const toInsert = newLangPref
			.filter((e) => !oldLangPref.map((e) => e.langId).includes(e))
			.map((e) => {
				return { userId: req.session.userId, langId: e }
			})
		if (toInsert.length > 0) await UserLangPref.insert(toInsert)
		return { langId: newLangPref }
	}

	@Mutation(() => User)
	@UseMiddleware(isLoggedIn)
	async setUserDisplayName(
		@Arg("displayName", () => String) displayName: string,
		@Ctx() { req }: Context
	) {
		await User.update({ id: req.session.userId }, { displayName })
		return await User.findOne(req.session.userId)
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isLoggedIn)
	logout(@Ctx() { req, res }: Context) {
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
