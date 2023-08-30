import { Field, ObjectType } from "type-graphql"

@ObjectType()
export class PollType {
	@Field()
	code: string
	@Field()
	info: string
}
