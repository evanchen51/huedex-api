import { Field, ObjectType } from "type-graphql"
import { Language } from "../tables/Language"
import { User } from "./User"

@ObjectType()
export class UserPersonalSettings {
	@Field()
	userId: string
	@Field()
	displayLanguageCode: string
	@Field(() => Language)
	displaylanguage?: Language
	@Field(() => User)
	user?: User
}
