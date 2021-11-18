import { Field, ObjectType } from "type-graphql"
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm"
import { Option } from "./Option"
import { PollText } from "./PollText"
import { User } from "./User"
import { Vote } from "./Vote"

@ObjectType()
@Entity()
export class Poll extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.polls, { onDelete: "SET NULL", nullable: true })
	@JoinColumn()
	poster: User | null

	@Field()
	@Column({ type: "int", default: 0 })
	numOfVotes!: number

	@Field()
	@Column({ nullable: true })
	mediaTypeId: number | null

	@Field()
	@Column({ nullable: true })
	mediaUrl: string | null

	@Field()
	@Column({ type: "boolean", default: false })
	nsfw!: boolean

	@Field(() => PollText)
	@OneToMany(() => PollText, (text) => text.poll, { cascade: true })
	pollText!: PollText[]

	@Field(() => Option)
	@OneToMany(() => Option, (option) => option.poll, { cascade: true })
	options!: Option[]

	@Field(() => Vote)
	@OneToMany(() => Vote, (vote) => vote.poll, { cascade: true })
	votes!: Vote[]

	// @Field(() => Int, { nullable: true })
	// voteStatus: number | null

	//

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date
}
