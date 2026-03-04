import express from "express";
import prisma from "../../prisma";
import { validate } from "../../middleware/validate";
import { updateUserSchema } from "../../schemas/user.schema";
import registry, { auth, body } from "../../docs/registry";
import { z } from "zod";

const router = express.Router();

const idParam = z.object({ id: z.string().uuid() });

registry.registerPath({ method: "get", path: "/api/v1/user/list", tags: ["User"], summary: "유저 목록 조회",
  ...auth, responses: { 200: { description: "유저 목록" } } });
registry.registerPath({ method: "get", path: "/api/v1/user/{id}", tags: ["User"], summary: "유저 단건 조회",
  ...auth, request: { params: idParam }, responses: { 200: { description: "유저 정보" }, 404: { description: "유저 없음" } } });
registry.registerPath({ method: "patch", path: "/api/v1/user/{id}", tags: ["User"], summary: "유저 수정",
  ...auth, request: { params: idParam, ...body(updateUserSchema) }, responses: { 200: { description: "수정 성공" }, 404: { description: "유저 없음" } } });
registry.registerPath({ method: "delete", path: "/api/v1/user/{id}", tags: ["User"], summary: "유저 탈퇴",
  ...auth, request: { params: idParam }, responses: { 200: { description: "탈퇴 성공" }, 404: { description: "유저 없음" } } });

router.get("/list", async (req, res, next) => {
  try {
    const data = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        userId: true,
        userName: true,
        groupId: true,
        phone: true,
        admin: true,
        createdAt: true,
      },
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
    const data = await prisma.user.findFirst({
      where: { userId: id, deletedAt: null },
      select: { userId: true, userName: true, groupId: true, admin: true },
    });
    if (!data)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", validate(updateUserSchema), async (req, res, next) => {
  const { id } = req.params;
  const { userName, groupId, phone, admin } = req.body;
  try {
    const existing = await prisma.user.findFirst({
      where: { userId: id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

    const data = await prisma.user.update({
      where: { userId: id },
      data: {
        userName: userName ?? undefined,
        groupId: groupId ?? undefined,
        phone: phone ?? undefined,
        admin: admin ?? undefined,
      },
      select: {
        userId: true,
        userName: true,
        groupId: true,
        phone: true,
        admin: true,
      },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await prisma.user.updateMany({
      where: { userId: id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0)
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    res.json({ message: "탈퇴 처리되었습니다." });
  } catch (err) {
    next(err);
  }
});

export default router;