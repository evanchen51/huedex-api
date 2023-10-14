import { MiddlewareFn } from "type-graphql"
import { graphqlContext } from "../../types/graphqlContext"
import "dotenv-safe/config"

export const isAdmin: MiddlewareFn<graphqlContext> = ({ args }, next) => {
	if (!args.passcode || args.passcode !== process.env.ADMIN_PASSCODE) throw new Error("Wrong Passcode")
	return next()
}
