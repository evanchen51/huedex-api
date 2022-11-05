import { prisma } from "../prisma"

export type transactionForm = {
	table: "poll" | "option" | "vote"
	action: "update" | "upsert" | "delete"
	args: any
}

export const transactionExecute = async (order: transactionForm[]) => {
	return await prisma.$transaction(
		order.map((e) => {
			switch (e.table) {
				case "poll":
					switch (e.action) {
						case "update":
							return prisma.poll.update(e.args)
						case "upsert":
							return prisma.poll.upsert(e.args)
						case "delete":
							return prisma.poll.delete(e.args)
					}
				case "option":
					switch (e.action) {
						case "update":
							return prisma.option.update(e.args)
						case "upsert":
							return prisma.option.upsert(e.args)
						case "delete":
							return prisma.option.delete(e.args)
					}
				case "vote":
					switch (e.action) {
						case "update":
							return prisma.vote.update(e.args)
						case "upsert":
							return prisma.vote.upsert(e.args)
						case "delete":
							return prisma.vote.delete(e.args)
					}
			}
		})
	)
}
