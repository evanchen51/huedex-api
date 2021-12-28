import { Query, Resolver } from "type-graphql";
import { LangTable } from './../entities/LangTable';

@Resolver()
export class UtilResolver {
	@Query(() => [LangTable], { nullable: true })
	async getLangTable() {
		return await LangTable.find()
	}
}
