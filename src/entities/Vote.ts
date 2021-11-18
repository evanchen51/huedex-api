import { Field, ObjectType } from "type-graphql"
import {
	BaseEntity,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
	UpdateDateColumn,
} from "typeorm"
import { Option } from "./Option"
import { Poll } from "./Poll"
import { User } from "./User"

@ObjectType()
@Entity()
@Unique("UserToPoll", ["userId", "pollId"])
export class Vote extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@Field()
	@ManyToOne(() => User, (user) => user.votes, { onDelete: "SET NULL" })
	@JoinColumn()
	user!: User

	@Field()
	@ManyToOne(() => Poll, (poll) => poll.votes, { onDelete: "CASCADE" })
	@JoinColumn()
	poll!: Poll

	@Field()
	@ManyToOne(() => Option, (option) => option.votes, { onDelete: "CASCADE" })
	@JoinColumn()
	option!: Option

	//

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date
}
