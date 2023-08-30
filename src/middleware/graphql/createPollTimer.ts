import { MiddlewareFn } from "type-graphql"
import { graphqlContext } from "../../types/graphqlContext"
import { REDIS_KEY_CREATE_POLL_TIMER } from "../../constants"

export const createPollTimer: MiddlewareFn<graphqlContext> = async ({ context }, next) => {
	if (await context.redis.get(REDIS_KEY_CREATE_POLL_TIMER + context.req.session.userId))
		throw new Error("Please wait 5 mins before creating another Poll!")
	return next()
}
