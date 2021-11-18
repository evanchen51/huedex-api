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

	@Field()
	@Column({ unique: true })
	email!: string

	@Column({ nullable: true })
	password: string | null

	@Column({ nullable: true })
	googleId: string | null

	@Field(() => Poll)
	@OneToMany(() => Poll, (poll) => poll.poster)
	polls!: Poll[]

	@Field(() => Poll)
	@Column()
	anonymousPolls!: Poll[]

	@Field(() => Vote)
	@OneToMany(() => Vote, (vote) => vote.user)
	votes!: Vote[]

	@Field(() => Poll)
	@Column()
	anonymousVotes!: Vote[]

	@Field(() => UserLangPref)
	@OneToMany(() => UserLangPref, (pref) => pref.user, { cascade: true })
	userLangPref!: UserLangPref[]

	//

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date
}
