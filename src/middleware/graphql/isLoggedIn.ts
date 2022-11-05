import { MiddlewareFn } from "type-graphql"
import { GraphQLContext } from "../../types/GraphQLContext"

export const isLoggedIn: MiddlewareFn<GraphQLContext> = ({ context }, next) => {
	if (!context.req.session.userId) throw new Error("Not Logged in")
	return next()
}
