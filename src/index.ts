import { ApolloServer } from "apollo-server-express"
import connectRedis from "connect-redis"
import cors from "cors"
import express from "express"
import session from "express-session"
import passport from "passport"
import path from "path"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import { User } from "./../prisma/models/users/User"
import { COOKIE_NAME, __prod__ } from "./constants"
import { redis } from "./redis"
import { GraphQLContext } from "./types/GraphQLContext"
import passportStrategy from "./utils/auth/passportStrategy"
import { createOptionLoader } from "./utils/createDataLoaders/createOptionLoader"
import { createPollLoader } from "./utils/createDataLoaders/createPollLoader"
import { createTopicLoader } from "./utils/createDataLoaders/createTopicLoader"
import { createTopOptionLoader } from "./utils/createDataLoaders/createTopOptionLoader"
import { createUserLoader } from "./utils/createDataLoaders/createUserLoader"

const main = async () => {
	// const connection = await createConnection()

	// await connection.runMigrations()

	const app = express()

	const RedisStore = connectRedis(session)

	app.set("trust proxy", 1)

	app.use(
		cors({
			origin: "http://localhost:3000",
			credentials: true,
		})
	)

	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
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
			resolvers: [path.join(__dirname, "./resolvers/*.js")],
			validate: false,
		}),
		context: ({ req, res }): GraphQLContext => ({
			req,
			res,
			redis,
			optionLoader: createOptionLoader(),
			pollLoader: createPollLoader(),
			topicLoader: createTopicLoader(),
			topOptionLoader: createTopOptionLoader(),
			userLoader: createUserLoader(),
		}),
	})

	apolloServer.applyMiddleware({
		app,
		cors: false,
	})

	passport.use(passportStrategy)

	app.use(passport.initialize())

	app.get(
		"/auth/google",
		passport.authenticate("google", {
			scope: ["email"],
		})
	)

	app.get(
		"/auth/google/callback",
		passport.authenticate(
			"google",
			{ session: false }
			// { failureRedirect: "/login", failureFlash: true },
			// TODO google auth failure redirect
		),
		(req, res) => {
			;(req.session as any).userId = (req.user as User).id
			res.redirect("http://localhost:3000/login-success-redirect")
		}
	)

	app.listen(4000, () => {
		console.log("——— server running ———")
	})
}

main().catch((err) => {
	console.error(err)
})
