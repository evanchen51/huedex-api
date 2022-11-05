import { Field, ObjectType } from "type-graphql"
import { User } from "../users/User"

@ObjectType()
export class FollowUser {
	@Field()
	followerId: string
	@Field()
	userIdS: string
	@Field(() => User)
	follower?: User
	@Field(() => User)
	user?: User
}
