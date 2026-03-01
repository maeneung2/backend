import express from "express";
import user from "./user";
import schedule from "./schedule";
import notice from "./notice";
import group from "./group";
import note from "./note";

const router = express.Router();

router.get("/", (req, res) => res.send({ data: "정상작동" }));

router.use("/user", user);
router.use("/schedule", schedule);
router.use("/notice", notice);
router.use("/group", group);
router.use("/note", note);

export default router;
