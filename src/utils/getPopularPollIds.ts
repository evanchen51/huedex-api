import { EN, UNKNOWN } from "../constants"
import { prisma } from "../prisma"
import { REDIS_HASH_KEY_LANGUAGE_CODES } from "./../constants"
import { redis } from "./../redis"
import { redisCacheCheck } from "./redisCacheCheck"
import { orderedShuffle } from "./shuffle"

export const getPopularPollIds = async ({
	languageCodes,
	req,
	en,
	any,
}: {
	languageCodes: string[]
	req: number
	en: number
	any: number
}) => {
	const languages = await redisCacheCheck({
		key: REDIS_HASH_KEY_LANGUAGE_CODES,
		args: [],
		type: "hgetall",
		hit: async (cache) => Object.entries(cache).map((e) => e[0]),
		miss: async () => {
			const data = (await prisma.language.findMany())?.filter((e) => e.code !== UNKNOWN)
			redis.hset(REDIS_HASH_KEY_LANGUAGE_CODES, ...data.flatMap((e) => [e.code, e.nativeName]))
			return data.map((e) => e.code)
		},
	})
	const filteredLanguageCodes = languageCodes
		? [...new Set(languageCodes.filter((e) => languages.includes(e)))]
		: []
	const reqData =
		req > 0 && filteredLanguageCodes.length > 0
			? await prisma.poll.findMany({
					where: { languageCode: { in: filteredLanguageCodes } },
					select: { id: true },
					orderBy: [{ numOfVotes: "desc" }, { createdAt: "desc" }],
					take: filteredLanguageCodes.includes(EN) ? req + en : req,
			  })
			: []
	const enData =
		en > 0 && !filteredLanguageCodes.includes(EN)
			? await prisma.poll.findMany({
					where: { languageCode: EN },
					select: { id: true },
					orderBy: [{ numOfVotes: "desc" }, { createdAt: "desc" }],
					take: filteredLanguageCodes.includes(EN) ? req + en : req,
			  })
			: []
	const anyData =
		any > 0
			? await prisma.poll.findMany({
					where: { id: { notIn: [...reqData, ...enData].map((e) => e.id) } },
					select: { id: true },
					orderBy: [{ numOfVotes: "desc" }, { createdAt: "desc" }],
					take: filteredLanguageCodes.includes(EN) ? req + en : req,
			  })
			: []
	return orderedShuffle([reqData, enData, anyData])
}
