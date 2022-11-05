import { Field, ObjectType } from "type-graphql"
import { UserPersonalSettings } from "./UserPersonalSettings"

@ObjectType()
export class User {
	@Field()
	id: string
	@Field(() => String, { nullable: true })
	displayName?: string | null
	@Field()
	private: boolean
	@Field(() => String, { nullable: true })
	createdAt: Date
	@Field(() => UserPersonalSettings, { nullable: true })
	personalSetting?: UserPersonalSettings | null
}
