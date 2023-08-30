import { PollType } from '../tables/PollType'
import { Field, Int, ObjectType } from "type-graphql"
import { Language } from "../tables/Language"
import { MediaType } from "../tables/MediaType"
import { User } from "../users/User"
import { PollTopic } from "./../relations/PollTopic"
import { AnonymousVote } from "./../votes/AnonymousVote"
import { Vote } from "./../votes/Vote"
import { Option } from "./Option"

@ObjectType()
export class Poll {
	@Field()
	id: string
	@Field()
	text: string
	@Field(() => Int)
	numOfVotes: number
	@Field(() => String, { nullable: true })
	mediaUrl?: string | null
	@Field()
	sensitive: boolean
	@Field(() => String, { nullable: true })
	posterId?: string | null
	@Field(() => Int)
	numOfChoices: number
	@Field(() => String, { nullable: true })
	mediaTypeCode?: string | null
	@Field(() => String, { nullable: true })
	pollTypeCode?: string | null
	@Field()
	languageCode: string
	@Field(() => String)
	createdAt: Date
	@Field(() => String)
	updatedAt: Date
	// @Field(() => Language)
	language?: Language
	@Field(() => MediaType, { nullable: true })
	mediaType?: MediaType | null
	@Field(() => PollType, { nullable: true })
	pollType?: PollType | null
	@Field(() => User, { nullable: true })
	poster?: User | null
	@Field(() => [AnonymousVote], { nullable: true })
	anonymousVotes?: AnonymousVote[]
	@Field(() => [Option], { nullable: true })
	options?: Option[]
	@Field(() => [Option], { nullable: true })
	topOptions?: Option[]
	@Field(() => Int, { nullable: true })
	numOfOptions?: number
	@Field(() => [PollTopic])
	topics?: PollTopic[]
	@Field(() => [Vote], { nullable: true })
	votes?: Vote[]
}
