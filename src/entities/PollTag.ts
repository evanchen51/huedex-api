import { Field, ObjectType } from "type-graphql"
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm"
import { Poll } from "./Poll"
import { Tag } from "./Tag"

@ObjectType()
@Entity()
export class PollTag extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@Field(() => Poll)
	@ManyToOne(() => Poll, (poll) => poll.tags, { onDelete: "CASCADE" })
	@JoinColumn()
	poll!: Poll

	@Field()
	@Column()
	pollId!: number

	@Field(() => Tag)
	@ManyToOne(() => Tag, (tag) => tag.polls, { onDelete: "CASCADE" })
	@JoinColumn()
	tag!: Tag

	@Field()
	@Column()
	tagId!: number

	//

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date
}
