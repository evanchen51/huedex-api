import { IsEmail } from "class-validator"
import { Field, ObjectType } from "type-graphql"
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm"
import { Poll } from "./Poll"
import { UserLangPref } from "./UserLangPref"
import { Vote } from "./Vote"

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@Field(() => String, { nullable: true })
	@Column({ type: "varchar", nullable: true })
	displayName: string | null

	@IsEmail()
	@Column({ unique: true, select: false })
	email!: string

	@Column({ type: "varchar", nullable: true, select: false })
	googleId: string | null

	@Column({ type: "varchar", nullable: true, select: false })
	password: string | null

	@Field(() => [Poll])
	@OneToMany(() => Poll, (poll) => poll.poster)
	polls!: Poll[]

	@Field(() => [Poll])
	@OneToMany(() => Poll, (poll) => poll.anonymousPoster)
	anonymousPolls!: Poll[]

	@Field(() => [Vote])
	@OneToMany(() => Vote, (vote) => vote.voter)
	votes!: Vote[]

	@Field(() => [Vote])
	@OneToMany(() => Vote, (vote) => vote.anonymousVoter)
	anonymousVotes!: Vote[]

	@Field(() => [UserLangPref])
	@OneToMany(() => UserLangPref, (pref) => pref.user, { cascade: true })
	userLangPref!: UserLangPref[]

	//

	@Field(() => String)
	@CreateDateColumn({ select: false })
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn({ select: false })
	updatedAt: Date
}
