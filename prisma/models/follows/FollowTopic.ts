import { Field, ObjectType } from "type-graphql"
import { Topic } from "../misc/Topic"
import { User } from "../users/User"

@ObjectType()
export class FollowTopic {
	@Field()
	followerId: string
	@Field()
	topicId: string
	@Field(() => User)
	follower?: User
	@Field(() => Topic)
	topic?: Topic
}
