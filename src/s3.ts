import aws from "aws-sdk"
import "dotenv-safe/config"

export const bucketName = process.env.S3_BUCKETNAME
const region = process.env.S3_REGION
const accessKeyId = process.env.S3_ACCESSKEYID
const secretAccessKey = process.env.S3_SECRETACCESSKEY

export const s3 = new aws.S3({
	region,
	accessKeyId,
	secretAccessKey,
	signatureVersion: "v4",
})