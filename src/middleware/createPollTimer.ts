import { REDIS_PREFIX_CREATEPOLLTIMER } from "./../constants"
import { Context } from "../types/Context"
import { MiddlewareFn } from "type-graphql"

export const createPollTimer: MiddlewareFn<Context> = async ({ context }, next) => {
	if (await context.redis.get(REDIS_PREFIX_CREATEPOLLTIMER + context.req.session.userId))
		throw new Error("Please wait 5 mins before creating another Poll!")
	return next()
}
