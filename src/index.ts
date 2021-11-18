import { ApolloServer } from "apollo-server-express"
import connectRedis from "connect-redis"
import express from "express"
import session from "express-session"
import redis from "redis"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import { __prod__ } from "./constants"
import { Context } from "./Context"
import { UserAuthResolver } from "./resolvers/UserAuthResolver"

const main = async () => {
	const app = express()

	const RedisStore = connectRedis(session)
	const redisClient = redis.createClient()

	app.use(
		session({
			name: "COOKIE_NAME",
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true,
				sameSite: "lax", // csrf
				secure: __prod__, // to only work in https
			},
			saveUninitialized: false,
			secret: "process.env.SESSION_SECRET",
			resave: false,
		})
	)

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [UserAuthResolver],
			validate: false,
		}),
		context: ({ req, res }): Context => ({
			req,
			res,
			// redis,
			// userLoader: createUserLoader(),
			// pointLoader: createPointLoader(),
		}),
	})

	apolloServer.applyMiddleware({
		app,
	})

	app.listen(4000, () => {
		console.log("——— server running ———")
	})
}

main().catch((err) => {
	console.error(err)
})
