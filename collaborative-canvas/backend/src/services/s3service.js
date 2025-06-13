// awsS3Utils.js

// ESM imports for AWS SDK v3 packages
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/** AWS Region and S3 bucket constants */
const REGION = "ap-southeast-1";
const BUCKET_NAME = "aicollabdesignmedia";
const ROLE_ARN = "arn:aws:iam::339712725212:role/collab-art-user";

/** Reusable STS client for temporary credentials */
const stsClient = new STSClient({ region: REGION });

/**
 * Generate a temporary S3 client with assumed role credentials.
 * @returns {Promise<S3Client>}
 */
export async function getTemporaryCredentials() {
    const command = new AssumeRoleCommand({
        RoleArn: ROLE_ARN,
        RoleSessionName: "CollabArtSession",
        DurationSeconds: 3600,
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

/**
 * Upload an image file to S3 (with unique name).
 * @param {object} file - The file object: { originalname, buffer, mimetype }
 * @returns {Promise<{key: string, url: string} | Error>}
 */
export async function uploadS3Image(file) {
    try {
        const s3 = await getTemporaryCredentials();
        const uniqueFilename = `${Date.now()}-${Math.floor(Math.random() * 10000)}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const params = {
            Bucket: BUCKET_NAME,
            Key: uniqueFilename,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(params));
        return {
            key: uniqueFilename,
            url: `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${uniqueFilename}`
        };
    } catch (error) {
        console.error("Upload error:", error);
        return error;
    }
}

/**
 * Upload an image file to S3 (preserves original name).
 * @param {object} file - The file object: { originalname, buffer, mimetype }
 * @returns {Promise<{key: string, url: string} | Error>}
 */
export async function uploadS3ImageGen(file) {
    try {
        const s3 = await getTemporaryCredentials();
        const params = {
            Bucket: BUCKET_NAME,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(params));
        return {
            key: file.originalname,
            url: `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${file.originalname}`
        };
    } catch (error) {
        console.error("Upload error:", error);
        return error;
    }
}

/**
 * Delete an image from S3 by its full URL.
 * @param {string} imageUrl - The S3 URL to the object to delete
 * @returns {Promise<{message: string}>}
 */
export async function deleteS3Image(imageUrl) {
    try {
        const key = imageUrl.split(`${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`)[1];
        const s3 = await getTemporaryCredentials();
        const params = { Bucket: BUCKET_NAME, Key: key };
        await s3.send(new DeleteObjectCommand(params));
        return { message: "Image deleted successfully" };
    } catch (error) {
        console.error("Delete error:", error);
        return { message: "Image deletion attempted, but it may not have existed" };
    }
}