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
import { Tag } from "./Tag"

@ObjectType()
@Entity()
@Unique("TagTextLang", ["tagId", "langId"])
export class TagText extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number

	@ManyToOne(() => Tag, (tag) => tag.tagText, { onDelete: "CASCADE" })
	@JoinColumn()
	tag!: Tag

	@Field()
	@Column()
	tagId!: number

	@Field()
	@Length(1, 20)
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
