import { Field, ObjectType } from "type-graphql"
import { Topic } from "../misc/Topic"
import { Poll } from "../polls/Poll"

@ObjectType()
export class PollTopic {
	@Field()
	pollId: string
	@Field()
	topicId: string
	@Field(() => Poll, { nullable: true })
	poll?: Poll
	@Field(() => Topic, { nullable: true })
	topic?: Topic
}
