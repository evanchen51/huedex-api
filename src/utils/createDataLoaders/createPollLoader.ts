import DataLoader from "dataloader"
import { prisma } from "../../prisma"
import { redis } from "../../redis"
import { Poll } from "./../../../prisma/models/polls/Poll"
import { REDIS_KEY_POLL } from "./../../constants"

export const createPollLoader = () =>
	new DataLoader<string, Poll>(async (ids) => {
		const data = await prisma.poll.findMany({ where: { id: { in: ids as string[] } } })
		const idsToEntity: Record<string, Poll> = {}
		data.forEach((e) => {
			redis.hset(REDIS_KEY_POLL + e.id, Object.entries(e).flat(1))
			idsToEntity[e.id] = e
		})
		return ids.map((e) => idsToEntity[e])
	})
