import express from "express";
import { defaultNote, noteList } from "../../mockup/note";

const router = express.Router();

router.post("/", async (req, res) => {
  res.send({ message: `인수인계 생성` });
});

router.delete("/:id", async (req, res) => {
  res.send({ message: `${req.params.id} 인수인계 삭제` });
});

router.get("/list", async (req, res) => {
  res.send({ page: 0, data: noteList, total: noteList.length });
});

router.get("/:id", async (req, res) => {
  res.send({ data: defaultNote });
});

export default router;
