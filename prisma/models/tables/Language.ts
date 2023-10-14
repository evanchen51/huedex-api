import { Field, ObjectType } from "type-graphql"

@ObjectType()
export class Language {
	@Field()
	code: string
	@Field()
	nativeName: string
	@Field()
	englishName: string
}
