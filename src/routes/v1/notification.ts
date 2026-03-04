import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import { createNotificationSchema } from "../../schemas/notification.schema";
import registry, { auth, body } from "../../docs/registry";
import { z } from "zod";

const router = express.Router();

const idParam = z.object({ id: z.string().uuid() });

registry.registerPath({ method: "post", path: "/api/v1/notification", tags: ["Notification"], summary: "알림 생성",
  ...auth, request: body(createNotificationSchema), responses: { 201: { description: "알림 생성 성공" } } });
registry.registerPath({ method: "get", path: "/api/v1/notification/list", tags: ["Notification"], summary: "내 알림 목록 조회",
  ...auth, responses: { 200: { description: "알림 목록" } } });
registry.registerPath({ method: "get", path: "/api/v1/notification/{id}", tags: ["Notification"], summary: "알림 단건 조회",
  ...auth, request: { params: idParam }, responses: { 200: { description: "알림 정보" }, 404: { description: "알림 없음" } } });
registry.registerPath({ method: "patch", path: "/api/v1/notification/{id}/read", tags: ["Notification"], summary: "알림 읽음 처리",
  ...auth, request: { params: idParam }, responses: { 200: { description: "읽음 처리 성공" }, 404: { description: "알림 없음" } } });
registry.registerPath({ method: "delete", path: "/api/v1/notification/{id}", tags: ["Notification"], summary: "알림 삭제",
  ...auth, request: { params: idParam }, responses: { 200: { description: "삭제 성공" } } });

router.post("/", validate(createNotificationSchema), async (req, res, next) => {
  const { userId, type, content, url } = req.body;
  try {
    const data = await prisma.notification.create({
      data: { userId, type, content, url },
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.get("/list", async (req, res, next) => {
  const userId = req.user!.userId;
  try {
    const data = await prisma.notification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    res.json({ page: 0, data, total: data.length });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const data = await prisma.notification.findFirst({
      where: { notificationId: id, deletedAt: null },
    });
    if (!data)
      return res.status(404).json({ error: "알림을 찾을 수 없습니다." });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/read", async (req, res, next) => {
  const { id } = req.params;
  try {
    const existing = await prisma.notification.findFirst({
      where: { notificationId: id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "알림을 찾을 수 없습니다." });

    const data = await prisma.notification.update({
      where: { notificationId: id },
      data: { read: true },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.notification.updateMany({
      where: { notificationId: id },
      data: { deletedAt: new Date() },
    });
    res.json({ message: "알림 삭제 완료" });
  } catch (err) {
    next(err);
  }
});

export default router;