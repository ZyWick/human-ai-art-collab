const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const REGION = "ap-southeast-1";
const BUCKET_NAME = "aicollabdesignmedia";
const ROLE_ARN = "arn:aws:iam::339712725212:role/collab-art-user";

const stsClient = new STSClient({ region: REGION });

async function getTemporaryCredentials() {
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

async function uploadS3Image(file) {
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
        // throw new Error("Failed to upload image");
        return error;
    }
}

async function deleteS3Image(imageUrl) {
    try {
        const key = imageUrl.split(`${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`)[1];
        const s3 = await getTemporaryCredentials();
        const params = { Bucket: BUCKET_NAME, Key: key };
        await s3.send(new DeleteObjectCommand(params));
        return { message: "Image deleted successfully"  };
    } catch (error) {
        console.error("Delete error:", error);
        return { message: "Image deletion attempted, but it may not have existed" };
    }
}

module.exports = { uploadS3Image, deleteS3Image };
