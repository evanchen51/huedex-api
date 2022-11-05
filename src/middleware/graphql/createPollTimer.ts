import { MiddlewareFn } from "type-graphql"
import { GraphQLContext } from "../../types/GraphQLContext"
import { REDIS_KEY_CREATE_POLL_TIMER } from "../../constants"

export const createPollTimer: MiddlewareFn<GraphQLContext> = async ({ context }, next) => {
	if (await context.redis.get(REDIS_KEY_CREATE_POLL_TIMER + context.req.session.userId))
		throw new Error("Please wait 5 mins before creating another Poll!")
	return next()
}
