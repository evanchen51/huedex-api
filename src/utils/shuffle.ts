export function randomShuffle<T>(array: T[]): T[] {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1))
		var temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}
	return array
}

export function orderedShuffle<T>(array: T[][]): T[] {
	const totalLength = array.reduce((res, e) => (res += e.length), 0)
	const indexes = array.reduce(
		(res, e, i) => (e.length > 0 ? [...res, [i, 0]] : res),
		[] as number[][]
	)
	let res: T[] = Array(totalLength)
	for (var i = 0; i < totalLength; i++) {
		var j = Math.floor(Math.random() * indexes.length)
		res[i] = array[indexes[j][0]][indexes[j][1]]
		indexes[j][1]++
		if (indexes[j][1] === array[indexes[j][0]].length) indexes.splice(j, 1)
	}
	return res
}
