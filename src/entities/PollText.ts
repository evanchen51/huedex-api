import { Length } from "class-validator"
import { Field, ObjectType } from "type-graphql"
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
	UpdateDateColumn,
} from "typeorm"
import { Poll } from "./Poll"

@ObjectType()
@Entity()
@Unique("PollTextLang", ["pollId", "langId"])
export class PollText extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number

	@ManyToOne(() => Poll, (poll) => poll.pollText, { onDelete: "CASCADE" })
	@JoinColumn()
	poll!: Poll

	@Field()
	@Column()
	pollId!: number

	@Field()
	@Length(1, 500)
	@Column()
	text!: string

	@Field()
	@Column()
	langId!: number

	//

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date
}
