import { MiddlewareFn } from "type-graphql";
import { Context } from '../types/Context';


export const isLoggedIn: MiddlewareFn<Context> = ({ context }, next) => {
	if (!context.req.session.userId) throw new Error("You are Not Logged in Yet!")
	return next()
}
