import express from "express";
import employee from "./employee";
import schedule from "./schedule";

const router = express.Router();

router.get("/", (req, res) => res.send({ data: "정상작동" }));

router.use("/employee", employee);
router.use("/schedule", schedule);

export default router;
