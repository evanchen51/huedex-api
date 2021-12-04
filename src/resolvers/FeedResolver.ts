import { Arg, Int, Query, Resolver } from "type-graphql"
import { getConnection } from "typeorm"
import { Poll } from "./../entities/Poll"

@Resolver()
export class FeedResolver {
   // TODO obviously to be finished, probably with dataloader
	@Query(() => String)
	async visitorFeed(@Arg("langId", () => Int) _langId: number) {
		const data = await getConnection()
			.getRepository(Poll)
         .createQueryBuilder("poll")
         .take(10)
         .orderBy({ 'poll."numOfVotes"': "DESC", 'poll."createdAt"': "DESC" })
         .leftJoin("poll.poster","poster")
         .getMany()
      console.log(data)
		return "hi"
	}
}
