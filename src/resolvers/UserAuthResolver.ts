import { User } from './../entities/User';
// import { FieldError } from '../types/graphqlTypes';
import { Ctx, Mutation, Query, Resolver } from "type-graphql"
import { COOKIE_NAME } from './../constants';
import { Context } from '../types/Context';

@Resolver()
export class UserAuthResolver {
	// @Query(() => [FieldError])
	// hello() {
	// 	return [
	// 		{
	// 			field: "field",
	// 			message: "message",
	// 		},
	// 	]
	// }

	@Query(() => User, { nullable: true })
	getCurrentUser(@Ctx() { req }: Context) {
		if (!req.session.userId) return null // not logged in
		return User.findOne(req.session.userId)
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: Context) {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
				res.clearCookie(COOKIE_NAME)
				if (err) {
					console.log(err)
					resolve(false)
					return
				}
				resolve(true)
			})
		)
	}
}
