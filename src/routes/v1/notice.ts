import express from "express";
import { defaultNotice, noticeList } from "../../mockup/notice";

const router = express.Router();

router.post("/", async (req, res) => {
  res.send({ message: `공지사항 생성` });
});

router.delete("/:groupId/:id", async (req, res) => {
  res.send({ message: `${req.params.id} 공지사항 삭제` });
});

router.get("/:groupId/list", async (req, res) => {
  res.send({ page: 0, data: noticeList, total: noticeList.length });
});

router.get("/:groupId/:id", async (req, res) => {
  res.send({ data: defaultNotice });
});

export default router;
