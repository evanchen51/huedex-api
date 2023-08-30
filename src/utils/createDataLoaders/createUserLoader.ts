import DataLoader from "dataloader"
import { User } from "../../../prisma/models/users/User"
import { REDIS_HASH_KEY_USER } from "../../constants"
import { prisma } from "../../prisma"
import { redis } from "../../redis"

export const createUserLoader = () =>
	new DataLoader<string, User>(async (ids) => {
		const data = await prisma.user.findMany({ where: { id: { in: ids as string[] } } })
		const idsToEntity: Record<string, User> = {}
		data.forEach((e) => {
			redis.hset(REDIS_HASH_KEY_USER + e.id, Object.entries(e).flat(1))
			idsToEntity[e.id] = e
		})
		return ids.map((e) => idsToEntity[e])
	})
