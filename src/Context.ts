import { Request, Response } from "express"
// import { Session, SessionData } from "express-session"
// import Redis from "ioredis"
// import { createPointLoader } from "./utils/createPointLoader"
// import { createUserLoader } from "./utils/createUserLoader"

export type Context = {
	req: Request & {
		// session: Session & Partial<SessionData> & { userId?: number }
	}
	res: Response
	// redis: Redis.Redis
	// userLoader: ReturnType<typeof createUserLoader>
	// pointLoader: ReturnType<typeof createPointLoader>
}
