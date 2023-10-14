import { prisma } from "../../prisma"
import "dotenv-safe/config"

let GoogleStrategy = require("passport-google-oauth").OAuth2Strategy
const passportStrategy = new GoogleStrategy(
	{
		clientID: process.env.GOOGLE_CLIENTID,
		clientSecret: process.env.GOOGLE_CLIENTSECRET,
		callbackURL: process.env.API_URL + "/auth/google/callback",
	},
	async (_: any, __: any, data: any, done: any) => {
		// console.log(data)
		const googleId: string = data.id
		const email: string = data.emails[0].value
		const displayName: string = data.displayName
		// const language: string = data._json.locale
		let user =
			(await prisma.userPersonalSettings.findUnique({ where: { email } }).user()) ||
			(await prisma.userPersonalSettings
				.create({
					data: {
						googleId,
						email,
						user: { create: { displayName } },
						// displayLanguage: { connect: { code: language } },
					},
					// update: { googleId },
					// where: { email },
					// include: { user: true },
				})
				.user())
		return done(null, { id: user?.id })
	}
)
export default passportStrategy
