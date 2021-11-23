import { User } from "../entities/User"

let GoogleStrategy = require("passport-google-oauth").OAuth2Strategy
const passportStrategy = new GoogleStrategy(
	{
		clientID:
			"127060738971-hd7lfh52mv0f0s4b3ck62mnfu92ttefu.apps.googleusercontent.com",
		clientSecret: "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",
		callbackURL: "http://localhost:4000/auth/google/callback",
	},
	async (_: any, __: any, data: any, done: any) => {
		const googleId: string = data.id
		const email: string = data.emails[0].value
		let user = await User.findOne({ where: { email } })
		if (!user) {
			user = await User.create({
				googleId,
				email,
			}).save()
		} else if (!user.googleId) {
			user.googleId = googleId
			await user.save()
		} else {
		}
		return done(null, { id: user?.id })
	}
)
export default passportStrategy
