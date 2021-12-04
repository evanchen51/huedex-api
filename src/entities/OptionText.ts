import { Length } from "class-validator"
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

@ObjectType()
@Entity()
@Unique("OptionTextLang", ["optionId", "langId"])
export class OptionText extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number

	@ManyToOne(() => Option, (option) => option.optionText, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	option!: Option

	@Field()
	@Column()
	optionId!: number

	@Field()
	@Length(1, 500)
	@Column()
	text!: string

	@Field()
	@Column()
	langId!: number

	//

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date
}
