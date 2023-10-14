import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createId } from "@paralleldrive/cuid2"
import { Arg, Int, Mutation, Resolver, UseMiddleware } from "type-graphql"
import { s3 } from "../s3"
import { isLoggedIn } from "./../middleware/graphql/isLoggedIn"

// @InputType()
// export class MediaInput {
// 	@Field()
// 	entity!: "Poll"
// 	@Field()
// 	entityId!: string
// 	@Field()
// 	mediaURL!: string
// 	@Field()
// 	mediaTypeCode!: "img"
// }

@Resolver()
export class MediaResolver {
	@Mutation(() => [String], { nullable: true })
	@UseMiddleware(isLoggedIn)
	async getS3URLs(@Arg("numOfReq", () => Int) numOfReq: number) {
		const URLs = []
		for (let i = 0; i < numOfReq; i++) {
			const command = new GetObjectCommand({
				Bucket: process.env.S3_BUCKETNAME,
				Key: createId(),
			})
			URLs.push(await getSignedUrl(s3, command, { expiresIn: 60 }))
		}
		return URLs
	}

	// @Mutation(() => Boolean)
	// @UseMiddleware(isLoggedIn)
	// async insertMedia(
	// 	@Arg("mediaInput", () => [MediaInput])
	// 	mediaInput: MediaInput[],
	// 	@Ctx() { redis }: graphqlContext
	// ) {
	// 	mediaInput.forEach(async (e) => {
	// 		{
	// 			const { entity, entityId, mediaTypeCode, mediaURL } = e
	// 			if (entity === "Poll") {
	// 				await prisma.poll.update({
	// 					where: { id: entityId },
	// 					data: { mediaTypeCode, mediaURL },
	// 				})
	// 				redis.hset(
	// 					REDIS_HASH_KEY_POLL + entityId,
	// 					Object.entries({ mediaTypeCode, mediaURL }).flat(1)
	// 				)
	// 			}
	// 		}
	// 	})
	// 	return true
	// }
}
