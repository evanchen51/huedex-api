import { Min } from "class-validator"
import { Field, Int, ObjectType } from "type-graphql"
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
import { OptionText } from "./OptionText"
import { Poll } from "./Poll"
import { Vote } from "./Vote"

@ObjectType()
@Entity()
export class Option extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@ManyToOne(() => Poll, (poll) => poll.options, { onDelete: "CASCADE" })
	@JoinColumn()
	poll!: Poll

	@Field()
	@Column()
	pollId!: number

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

	@Field(() => [OptionText])
	@OneToMany(() => OptionText, (text) => text.option, { cascade: true })
	optionText!: OptionText[]

	@Field(() => [Vote])
	@OneToMany(() => Vote, (vote) => vote.option, { cascade: true })
	votes!: Vote[]

	//

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date
}
