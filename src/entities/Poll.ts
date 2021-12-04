import { Min } from "class-validator"
import { Field, Int, ObjectType } from "type-graphql"
import {
	BaseEntity,
	Check,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from "typeorm"
import { Option } from "./Option"
import { PollTag } from "./PollTag"
import { PollText } from "./PollText"
import { User } from "./User"
import { Vote } from "./Vote"

@ObjectType()
@Entity()
@Check('NOT ("posterId" IS NOT NULL AND "anonymousPosterId" IS NOT NULL)')
export class Poll extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, (user) => user.polls, { onDelete: "SET NULL", nullable: true })
	@JoinColumn()
	poster: User | null

	@Field(() => Int, { nullable: true })
	@Column({ nullable: true })
	posterId: number | null

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, (user) => user.anonymousPolls, {
		onDelete: "SET NULL",
		nullable: true,
	})
	@JoinColumn()
	anonymousPoster: User | null

	@Field(() => Int, { nullable: true })
	@Column({ nullable: true, select: false })
	anonymousPosterId: number | null

	@Field()
	@Min(0)
	@Column({ type: "int", default: 0 })
	numOfVotes!: number

	@Field(() => Int, { nullable: true })
	@Column({ type: "int", nullable: true })
	mediaTypeId: number | null

	@Field(() => String, { nullable: true })
	@Column({ type: "varchar", nullable: true })
	mediaUrl: string | null

	@Field()
	@Column({ type: "boolean", default: false })
	nsfw!: boolean

	@Field(() => [PollText])
	@OneToMany(() => PollText, (text) => text.poll, { cascade: true })
	pollText!: PollText[]

	@Field(() => [Option])
	@OneToMany(() => Option, (option) => option.poll, { cascade: true })
	options!: Option[]

	@Field(() => [PollTag])
	@OneToMany(() => PollTag, (tag) => tag.poll, { cascade: true })
	tags!: PollTag[]

	@Field(() => [Vote])
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
