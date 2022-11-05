import { prisma } from "../../prisma"

let GoogleStrategy = require("passport-google-oauth").OAuth2Strategy
const passportStrategy = new GoogleStrategy(
	{
		clientID: "127060738971-hd7lfh52mv0f0s4b3ck62mnfu92ttefu.apps.googleusercontent.com",
		clientSecret: "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",
		callbackURL: "http://localhost:4000/auth/google/callback",
	},
	async (_: any, __: any, data: any, done: any) => {
		const googleId: string = data.id
		const email: string = data.emails[0].value
		let user =
			(await prisma.userPersonalSettings.findUnique({ where: { email } }).user()) ||
			(await prisma.userPersonalSettings.upsert({
				create: { googleId, email, user: { create: {} } },
				update: { googleId },
				where: { email },
			}))
		return done(null, { id: user?.id })
	}
)
export default passportStrategy

