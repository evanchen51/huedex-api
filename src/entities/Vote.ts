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
import { Option } from "./Option"
import { Poll } from "./Poll"
import { User } from "./User"

@ObjectType()
@Entity()
@Unique("UserToPoll", ["user", "anonymousId", "poll"])
export class Vote extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, (user) => user.votes, { onDelete: "SET NULL", nullable: true })
	@JoinColumn()
	user: User | null

	@Field(() => String, { nullable: true })
	@Column({ type: "varchar", nullable: true })
	anonymousId: string | null
	// hashed email

	@Field(() => Poll)
	@ManyToOne(() => Poll, (poll) => poll.votes, { onDelete: "CASCADE" })
	@JoinColumn()
	poll!: Poll

	@Field(() => Option)
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
