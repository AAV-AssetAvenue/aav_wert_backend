import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedS3Url(key: string): Promise<string> {

// const listCommand = new ListObjectsV2Command({
//   Bucket: process.env.AWS_S3_BUCKET!,
//   Prefix: "uploads/",
// });

// const response = await s3.send(listCommand);
// console.log("response",response)

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ResponseContentDisposition: "inline", 
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 minutes
  return url;
}
