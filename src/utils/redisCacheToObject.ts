import {
	REDIS_CACHE_CONVERT_BOOLEAN,
	REDIS_CACHE_CONVERT_DATE,
	REDIS_CACHE_CONVERT_INT,
} from "../constants"
import { toInt } from "./toInt"
export const redisCacheToObject = (redisCache: Record<string, string>): any => {
	return Object.keys(redisCache).reduce((res: any, e: string) => {
		if (redisCache[e] === "") return { ...res, [e]: null }
		if (REDIS_CACHE_CONVERT_BOOLEAN.includes(e)) return { ...res, [e]: redisCache[e] === "true" }
		if (REDIS_CACHE_CONVERT_INT.includes(e)) return { ...res, [e]: toInt(redisCache[e]) }
		if (REDIS_CACHE_CONVERT_DATE.includes(e))
			return { ...res, [e]: new Date(JSON.parse(`"${redisCache[e]}"`)) }
		return { ...res, [e]: redisCache[e] }
	}, {})
}
