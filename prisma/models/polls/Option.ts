import { Field, Int, ObjectType } from "type-graphql";
import { Language } from './../tables/Language';
import { MediaType } from './../tables/MediaType';
import { AnonymousVote } from './../votes/AnonymousVote';
import { Vote } from './../votes/Vote';
import { Poll } from './Poll';

@ObjectType()
export class Option {
	@Field()
	id: string
	@Field()
	text: string
	@Field(() => Int)
	numOfVotes: number
	@Field(() => String, { nullable: true })
	mediaUrl?: string | null
	@Field()
	pollId: string
	@Field(() => String, { nullable: true })
	mediaTypeCode?: string | null
	@Field()
	languageCode: string
	@Field(() => String)
	createdAt: Date
	@Field(() => String)
	updatedAt: Date
	@Field(() => Language, { nullable: true })
	language?: Language
	@Field(() => MediaType, { nullable: true })
	mediaType?: MediaType | null
	@Field(() => Poll, { nullable: true })
	poll?: Poll
	@Field(() => [AnonymousVote], { nullable: true })
	anonymousVotes?: AnonymousVote[]
	@Field(() => [Vote], { nullable: true })
	votes?: Vote[]
}
