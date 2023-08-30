import { MiddlewareFn } from "type-graphql"
import { graphqlContext } from "../../types/graphqlContext"

export const isLoggedIn: MiddlewareFn<graphqlContext> = ({ context }, next) => {
	if (!context.req.session.userId) throw new Error("Not Logged in")
	return next()
}
