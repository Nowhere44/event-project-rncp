import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function uploadToS3(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            ContentType: file.type,
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        const response = await fetch(signedUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        if (response.ok) {
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
            return fileUrl;
        } else {
            throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error in uploadToS3:", error);
        throw error;
    }
}
