import { S3Client } from "@aws-sdk/client-s3"
import "dotenv-safe/config"

const region = process.env.S3_REGION
const accessKeyId = process.env.S3_ACCESSKEYID
const secretAccessKey = process.env.S3_SECRETACCESSKEY

export const s3 = new S3Client({
	region,
	credentials: {
		accessKeyId,
		secretAccessKey,
	}
})