import { Language } from './../../prisma/models/tables/Language';
import { Arg, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { prisma } from "../prisma"
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

@Resolver()
export class AdminResolver {
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
		return JSON.stringify("test")
	}
}
