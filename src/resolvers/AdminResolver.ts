import { Arg, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { prisma } from "../prisma"
import { Language } from "./../../prisma/models/tables/Language"
import { MediaType } from "./../../prisma/models/tables/MediaType"
import { isAdmin } from "./../middleware/graphql/isAdmin"

@InputType()
class NewLanguage {
	@Field()
	code: string
	@Field()
	nativeName: string
	@Field()
	englishName: string
}

@InputType()
class NewMediaType {
	@Field()
	code: string
	@Field()
	description: string
}

@Resolver()
export class AdminResolver {
	@Query(() => Boolean)
	@UseMiddleware(isAdmin)
	async checkAdmin(
		@Arg("passcode", () => String)
		{}
	) {
		return true
	}

	@Mutation(() => [Language])
	@UseMiddleware(isAdmin)
	async addLanguage(
		@Arg("passcode", () => String)
		@Arg("input", () => NewLanguage)
		{ code, nativeName, englishName }: NewLanguage
	) {
		await prisma.language.upsert({
			create: { code, nativeName, englishName },
			update: { nativeName, englishName },
			where: { code },
		})
		return await prisma.language.findMany()
	}

	@Mutation(() => [MediaType])
	@UseMiddleware(isAdmin)
	async addMediaType(
		@Arg("passcode", () => String)
		@Arg("input", () => NewMediaType)
		{ code, description }: NewMediaType
	) {
		await prisma.mediaType.upsert({
			create: { code, description },
			update: { description },
			where: { code },
		})
		return await prisma.mediaType.findMany()
	}

	@Query(() => String, { nullable: true })
	async test() {
		/* const t = new v2.Translate({ key: "AIzaSyCqL0CrmWt8t5h30tdi0TKHj1XgLWzkpB0" })
			const data = await t.detect("Which Bang-Bang-Bang's the shit") //[0]//.language
			const res = (await t.getLanguages())[0]
			const data = []
			for (let i = 0; i < res.length; i++) {
				let tt
				try {
					tt = (await t.translate(res[i].name, res[i].code))[0]
				} catch (error) {
					// data.push("* " + res[i].name + ": " + res[i].code)
					continue
				}
				// data.push(JSON.stringify(tt))
				data.push(res[i].name + ": " + tt)
			}*/
		return "r"
	}
}
