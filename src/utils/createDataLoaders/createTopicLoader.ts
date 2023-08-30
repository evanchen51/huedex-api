import DataLoader from "dataloader"
import { Topic } from "../../../prisma/models/misc/Topic"
import { prisma } from "../../prisma"
import { redis } from "../../redis"
import { REDIS_HASH_KEY_TOPIC } from "./../../constants"

export const createTopicLoader = () =>
	new DataLoader<string, Topic>(async (ids) => {
		const data = await prisma.topic.findMany({ where: { id: { in: ids as string[] } } })
		const idsToEntity: Record<string, Topic> = {}
		data.forEach((e) => {
			redis.hset(REDIS_HASH_KEY_TOPIC + e.id, Object.entries(e).flat(1))
			idsToEntity[e.id] = e
		})
		return ids.map((e) => idsToEntity[e])
	})
