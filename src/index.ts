import AdminBroExpress from "@admin-bro/express"
import { Database, Resource } from "@admin-bro/typeorm"
import AdminBro from "admin-bro"
import { ApolloServer } from "apollo-server-express"
import { validate } from "class-validator"
import connectRedis from "connect-redis"
import cors from "cors"
import express from "express"
import session from "express-session"
import Redis from "ioredis"
import passport from "passport"
import path from "path"
import "reflect-metadata"
import { buildSchema } from "type-graphql"
import { createConnection } from "typeorm"
import { COOKIE_NAME, __prod__ } from "./constants"
import { User } from "./entities/User"
import { Context } from "./types/Context"
import passportStrategy from "./utils/passportStrategy"

const main = async () => {
	const connection = await createConnection()

	// await connection.runMigrations()

	const app = express()

	// NOTE might wanna consider taking this out in prod
	Resource.validate = validate
	AdminBro.registerAdapter({ Database, Resource })
	const adminBro = new AdminBro({
		databases: [connection],
		resources: [],
		rootPath: "/admin",
	})
	const router = AdminBroExpress.buildAuthenticatedRouter(
		adminBro,
		{
			authenticate: async (email, password) => {
				if (
					email === "process.env.ADMIN_EMAIL" &&
					password === "process.env.ADMIN_PASSWORD"
				) {
					return true
				}
				return false
			},
			cookiePassword: "process.env.AMDIN_SESSION_SECRET",
		},
		undefined,
		{
			saveUninitialized: false,
			secret: "process.env.AMDIN_SESSION_SECRET",
			resave: false,
		}
	)
	app.use(adminBro.options.rootPath, router)
	// NOTE might wanna consider taking this out in prod

	const RedisStore = connectRedis(session)
	const redis = new Redis()

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
				maxAge: 1000 * 60 * 60 * 24 * 365 * 20, // 20 years
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
		context: ({ req, res }): Context => ({
			req,
			res,
			redis,
			// userLoader: createUserLoader(),
			// pointLoader: createPointLoader(),
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
