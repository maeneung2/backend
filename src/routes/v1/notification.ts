import express from "express";
import {
  commentNotification,
  notificationList,
} from "../../mockup/notification";

const router = express.Router();

router.post("/", async (req, res) => {
  res.send({ message: `알림 생성` });
});

router.delete("/:id", async (req, res) => {
  res.send({ message: `${req.params.id} 알림 삭제` });
});

router.get("/list", async (req, res) => {
  res.send({ page: 0, data: notificationList, total: notificationList.length });
});

router.get("/:id", async (req, res) => {
  res.send({ data: commentNotification });
});

export default router;
