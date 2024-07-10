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
    console.log("Starting S3 upload");
    const fileName = `${Date.now()}-${file.name}`;
    console.log("File name:", fileName);

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            ContentType: file.type,
        });

        console.log("Getting signed URL");
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        console.log("Signed URL obtained");

        console.log("Uploading file to S3");
        const response = await fetch(signedUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        console.log("S3 upload response:", response.status, response.statusText);

        if (response.ok) {
            const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
            console.log("File uploaded successfully:", fileUrl);
            return fileUrl;
        } else {
            throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error in uploadToS3:", error);
        throw error;
    }
}
