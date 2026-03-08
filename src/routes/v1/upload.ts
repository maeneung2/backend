import express from "express";
import { z } from "zod";
import { createPresignedUrl, generateS3Key, getPublicUrl } from "../../util/s3";
import registry, { auth } from "../../docs/registry";

const router = express.Router();

const presignedRequestSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  folder: z.enum(["profiles", "notices", "notes"]),
});

registry.registerPath({
  method: "post",
  path: "/api/v1/upload/presigned-url",
  tags: ["Upload"],
  summary: "S3 presigned URL 발급",
  ...auth,
  request: {
    body: {
      content: {
        "application/json": {
          schema: presignedRequestSchema,
        },
      },
    },
  },
  responses: {
    200: { description: "presigned URL 및 최종 이미지 URL 반환" },
    400: { description: "잘못된 파일 형식 또는 폴더" },
  },
});

router.post("/presigned-url", async (req, res, next) => {
  const result = presignedRequestSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "입력값이 올바르지 않습니다.",
      details: result.error.flatten().fieldErrors,
    });
  }

  const { contentType, folder } = result.data;

  try {
    const key = generateS3Key(folder, contentType);
    const uploadUrl = await createPresignedUrl(key, contentType);
    const publicUrl = getPublicUrl(key);

    res.json({
      data: {
        uploadUrl,
        publicUrl,
        key,
        expiresIn: 300,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;