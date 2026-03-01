import express from "express";
import user from "./user";
import schedule from "./schedule";

const router = express.Router();

router.get("/", (req, res) => res.send({ data: "정상작동" }));

router.use("/user", user);
router.use("/schedule", schedule);

export default router;
