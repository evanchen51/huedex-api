import { Field, InputType, Int, ObjectType } from "type-graphql"

@InputType()
export class CreatePollInput {
	@Field()
	langId!: number
	@Field()
	text!: string
	@Field(() => [String])
	optionTexts!: string[]
	@Field(() => [Number])
	tagIds: number[]
	@Field(() => [String])
	newTags: string[]
	@Field({ defaultValue: false })
	anonymous!: boolean
}

@ObjectType()
export class LangPref {
	@Field(() => [Int])
	langId!: number[]
}

@ObjectType()
export class Text {
	@Field(() => String, { nullable: true })
	text: string | null
	@Field()
	langId!: number
	@Field()
	originalText!: string
	@Field()
	originalLangId!: number
}

@ObjectType()
export class PollClientFullView {
	@Field()
	pollId!: number
	@Field(() => Text)
	text!: Text
	@Field(() => [OptionClientFullView])
	options!: OptionClientFullView[]
	@Field(() => Int, { nullable: true })
	posterId: number | null
	@Field(() => String, { nullable: true })
	posterDisplayName: string | null
	@Field()
	numOfVotes!: number
	@Field()
	createdAt!: Date
}

@ObjectType()
export class OptionClientFullView {
	@Field()
	optionId!: number
	@Field()
	pollId!: number
	@Field(() => Text)
	text!: Text
	@Field()
	numOfVotes!: number
}
