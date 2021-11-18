import { Query, Resolver } from "type-graphql"

@Resolver()
export class UserAuthResolver {
	@Query(() => String)
	hello() {
		return "hello"
	}
}
