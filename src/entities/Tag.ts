import { Field, ObjectType } from "type-graphql"
import {
   BaseEntity,
   CreateDateColumn,
   Entity,
   OneToMany,
   PrimaryGeneratedColumn,
   UpdateDateColumn
} from "typeorm"
import { PollTag } from "./PollTag"
import { TagText } from "./TagText"

@ObjectType()
@Entity()
export class Tag extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@Field(() => [TagText])
	@OneToMany(() => TagText, (text) => text.tag, { cascade: true })
	tagText!: TagText[]

	@Field(() => [PollTag])
	@OneToMany(() => PollTag, (poll) => poll.tag, { cascade: true })
	polls!: PollTag[]

	//

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date
}
