import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME!;
const EXPIRES_IN = 300; // 5분

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function generateS3Key(folder: string, contentType: string): string {
  const ext = contentType.split("/")[1];
  const id = crypto.randomUUID();
  return `${folder}/${id}.${ext}`;
}

export async function createPresignedUrl(
  key: string,
  contentType: string
): Promise<string> {
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new Error("허용되지 않는 파일 형식입니다.");
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, { expiresIn: EXPIRES_IN });
}

export function getPublicUrl(key: string): string {
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}