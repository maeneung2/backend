import express from "express";
import user from "./user";
import schedule from "./schedule";
import notice from "./notice";
import group from "./group";
import note from "./note";
import comment from "./comment";
import notification from "./notification";
import authMiddleware from "../../util/auth/auth.middleware";
import auth from "./auth";

const router = express.Router();

router.get("/", (req, res) => res.send({ data: "정상작동" }));

router.use("/auth", auth);
router.use("/user", authMiddleware, user);
router.use("/schedule", authMiddleware, schedule);
router.use("/notice", authMiddleware, notice);
router.use("/group", authMiddleware, group);
router.use("/note", authMiddleware, note);
router.use("/comment", authMiddleware, comment);
router.use("/notification", authMiddleware, notification);

export default router;
