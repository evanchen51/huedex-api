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
import { User } from "./User"

@ObjectType()
@Entity()
export class UserLangPref extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number

	@ManyToOne(() => User, (user) => user.allLangPrefs, { onDelete: "CASCADE" })
	@JoinColumn()
	user!: User

	@Field()
	@Column()
	userId!: number

	@Field()
	@Column()
	langId!: number

	//

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
