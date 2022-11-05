import { MiddlewareFn } from "type-graphql"
import { GraphQLContext } from "../../types/GraphQLContext"

export const isAdmin: MiddlewareFn<GraphQLContext> = ({ args }, next) => {
	if (!args.passcode || args.passcode !== "password") throw new Error("Wrong Passcode")
	return next()
}
