import { S3Client } from "@aws-sdk/client-s3";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { fromIni } from "@aws-sdk/credential-provider-ini";


import dotenv from "dotenv";
dotenv.config();


dotenv.config(); // Load .env for local development

const REGION = "ap-southeast-2";
const ROLE_ARN = "arn:aws:iam::339712725212:role/collab-art-user";
const isProduction = process.env.NODE_ENV === "production";

let s3Client;

if (isProduction) {
  const stsClient = new STSClient({ region: REGION });

  async function assumeRole() {
    const command = new AssumeRoleCommand({
      RoleArn: ROLE_ARN,
      RoleSessionName: "CollabArtSession",
      DurationSeconds: 3600, // 1 hour
    });

    const { Credentials } = await stsClient.send(command);
    
    return new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: Credentials.AccessKeyId,
        secretAccessKey: Credentials.SecretAccessKey,
        sessionToken: Credentials.SessionToken,
      },
    });
  }

  s3Client = await assumeRole(); // Initialize S3 client with temporary credentials
} else {
  s3Client = new S3Client({
    region: REGION,
    credentials: fromIni({ profile: "default" }), // Uses ~/.aws/credentials
  });
}

export default s3Client;
