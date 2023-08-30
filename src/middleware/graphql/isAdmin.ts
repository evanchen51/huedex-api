import { MiddlewareFn } from "type-graphql"
import { graphqlContext } from "../../types/graphqlContext"

export const isAdmin: MiddlewareFn<graphqlContext> = ({ args }, next) => {
	if (!args.passcode || args.passcode !== "password") throw new Error("Wrong Passcode")
	return next()
}
