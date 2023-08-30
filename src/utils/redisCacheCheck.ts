import { redis } from "./../redis"

export async function redisCacheCheck<T>({
	key,
	args,
	type,
	hit,
	miss,
}: {
	key: string
	args: (string | number)[]
	type: "hgetall" | "zrevrange" | "smembers" | "hkeys" | "scard"
	hit: (cache: any) => Promise<T>
	miss: () => Promise<T>
}): Promise<T> {
	let cache
	switch (type) {
		case "hgetall":
			cache = await redis.hgetall(key)
			if (Object.keys(cache).length > 0) return await hit(cache)
			break
		case "zrevrange":
			cache = await redis.zrevrange(key, args[0] as number, args[1] as number)
			if (cache.length > 0) return await hit(cache)
			break
		case "smembers":
			cache = await redis.smembers(key)
			if (cache.length > 0) return await hit(cache)
			break
		case "hkeys":
			cache = await redis.hkeys(key)
			if (cache.length > 0) return await hit(cache)
			break
		case "scard":
			cache = await redis.scard(key)
			if (cache >= 0) return await hit(cache)
			break
	}
	return miss()
}
