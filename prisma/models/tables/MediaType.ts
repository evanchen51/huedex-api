import { Field, ObjectType } from "type-graphql"

@ObjectType()
export class MediaType {
	@Field()
	code: string
	@Field()
	description: string
}
