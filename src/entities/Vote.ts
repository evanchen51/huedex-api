import { Field, Int, ObjectType } from "type-graphql"
import {
	BaseEntity,
	Check,
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
@Check('NOT ("voterId" IS NOT NULL AND "anonymousVoterId" IS NOT NULL)')
@Unique("UserToPoll", ["voter", "anonymousVoter", "poll"])
export class Vote extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, (user) => user.votes, { onDelete: "SET NULL", nullable: true })
	@JoinColumn()
	voter: User | null

	@Field(() => Int, { nullable: true })
	@Column({ nullable: true })
	voterId: number | null

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, (user) => user.anonymousVotes, {
		onDelete: "SET NULL",
		nullable: true,
	})
	@JoinColumn()
	anonymousVoter: User | null

	@Field(() => Int, { nullable: true })
	@Column({ nullable: true })
	anonymousVoterId: number | null

	@Field(() => Poll)
	@ManyToOne(() => Poll, (poll) => poll.votes, { onDelete: "CASCADE" })
	@JoinColumn()
	poll!: Poll

	@Field()
	@Column()
	pollId!: number

	@Field(() => Option)
	@ManyToOne(() => Option, (option) => option.votes, { onDelete: "CASCADE" })
	@JoinColumn()
	option!: Option

	@Field()
	@Column()
	optionId!: number

	//

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date
}
