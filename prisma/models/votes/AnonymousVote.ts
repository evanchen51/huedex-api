import { Field, ObjectType } from "type-graphql"
import { Poll } from "../polls/Poll"
import { Option } from "../polls/Option"

@ObjectType()
export class AnonymousVote {
	@Field()
	optionId: string
	@Field()
	pollId: string
	@Field(() => Option)
	option?: Option
	@Field(() => Poll)
	poll?: Poll
}
