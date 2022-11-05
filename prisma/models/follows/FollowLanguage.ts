import { Field, ObjectType } from "type-graphql";
import { Language } from '../tables/Language';
import { User } from './../users/User';

@ObjectType()
export class FollowLanguage {
	@Field()
	followerId: string
	@Field()
	languageCode: string
	@Field(() => User)
	follower?: User
	@Field(() => Language)
	language?: Language
}
