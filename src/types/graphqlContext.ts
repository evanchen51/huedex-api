import { Request, Response } from "express"
import { Session, SessionData } from "express-session"
import { Redis } from "ioredis"
import { createOptionLoader } from "../utils/createDataLoaders/createOptionLoader"
import { createPollLoader } from "../utils/createDataLoaders/createPollLoader"
import { createTopicLoader } from "../utils/createDataLoaders/createTopicLoader"
import { createTopOptionLoader } from "../utils/createDataLoaders/createTopOptionLoader"
import { createUserLoader } from "../utils/createDataLoaders/createUserLoader"

export type graphqlContext = {
	req: Request & {
		session: Session & Partial<SessionData> & { userId?: string }
	}
	res: Response
	redis: Redis
	optionLoader: ReturnType<typeof createOptionLoader>
	pollLoader: ReturnType<typeof createPollLoader>
	topicLoader: ReturnType<typeof createTopicLoader>
	topOptionLoader: ReturnType<typeof createTopOptionLoader>
	userLoader: ReturnType<typeof createUserLoader>
}
