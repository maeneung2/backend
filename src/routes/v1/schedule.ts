import express from "express";
import { defaultSchedule } from "../../mockup/schedule";

const router = express.Router();

router.post("/", async (req, res) => {
  res.send({ message: `스케줄 생성` });
});

router.delete("/:id", async (req, res) => {
  res.send({ message: `${req.params.id} 스케줄 삭제` });
});

router.get("/:id", async (req, res) => {
  res.send({ data: defaultSchedule });
});

export default router;
