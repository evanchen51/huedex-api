import { Field, ObjectType } from "type-graphql";
import { PollTopic } from '../relations/PollTopic';
import { FollowTopic } from './../follows/FollowTopic';

@ObjectType()
export class Topic {
	@Field()
	id: string
	@Field()
	name: string
	@Field(() => [FollowTopic], { nullable: true })
	followers?: FollowTopic[]
	@Field(() => [PollTopic], { nullable: true })
	polls?: PollTopic[]
}
