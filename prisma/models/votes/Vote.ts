import { Field, ObjectType } from "type-graphql"
import { Option } from "../polls/Option"
import { Poll } from "../polls/Poll"
import { User } from "../users/User"

@ObjectType()
export class Vote {
	@Field()
	optionId: string
	@Field()
	pollId: string
	@Field()
	voterId: string
	@Field(() => Option)
	option?: Option
	@Field(() => Poll)
	poll?: Poll
	@Field(() => User)
	voter?: User
}
