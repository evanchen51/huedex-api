import { Text } from "./../types/graphqlTypes"

interface TextObject {
	text: string
	langId: number
	createdAt: Date
}

export const processText = (data: TextObject[], langId: number): Text => {
	return {
		text: data.find((e) => e.langId === langId)?.text || null,
		langId,
		originalText: data.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]
			.text,
		originalLangId: data[0].langId,
	}
}
