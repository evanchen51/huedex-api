import DataLoader from "dataloader"
import { Option } from "../../../prisma/models/polls/Option"
import { REDIS_HASH_KEY_OPTION } from "../../constants"
import { prisma } from "../../prisma"
import { redis } from "../../redis"
import { redisCacheCheck } from "../redisCacheCheck"
import { redisCacheToObject } from "../redisCacheToObject"

export const createTopOptionLoader = () =>
	new DataLoader<string[], Option[]>(async (ids): Promise<Option[][]> => {
		let cachedOptions: Record<string, Option> = {}
		let cacheMiss: string[] = []
		for (let index = 0; index < ids.flat(1).length; index++) {
			const id = ids.flat(1)[index]
			const cache = await redisCacheCheck({
				key: REDIS_HASH_KEY_OPTION + id,
				args: [],
				type: "hgetall",
				hit: async (cache) => redisCacheToObject(cache),
				miss: async () => {
					cacheMiss = [...cacheMiss, id]
					return null
				},
			})
			if (cache) cachedOptions[id] = cache
		}
		let dbOptions: Record<string, Option> = {}
		if (cacheMiss.length > 0)
			(await prisma.option.findMany({ where: { id: { in: cacheMiss } } }))?.forEach((e) => {
				if (e) {
					redis.hset(REDIS_HASH_KEY_OPTION + e.id, Object.entries(e).flat(1))
					dbOptions[e.id] = e
				}
			})
		const res = ids.map((e) => e.map((e_1) => cachedOptions[e_1] || dbOptions[e_1]))
		return res.map((e) => {
			e.sort((a, b) => b.numOfVotes - a.numOfVotes)
				.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
			return e.slice(0, 3)
		})
	})
