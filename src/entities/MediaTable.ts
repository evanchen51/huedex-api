import { Field, ObjectType } from "type-graphql"
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@ObjectType()
@Entity()
export class MediaTable extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@Field()
	@Column()
	class!: string

	@Field()
	@Column()
	info!: string

	//

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
