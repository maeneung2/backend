import express from "express";

const router = express.Router();

router.get("/:id", async (req, res) => {
  // try {
  //   const id = parseInt(req.params.id);
  //   const schedule = await prisma.schedule.findUnique({ where: { id: id } });
  //   res.send({ data: schedule });
  // } catch (err) {
  //   res.send({
  //     message: "없는 스케줄이거나 스케줄을 불러오는데 실패했습니다.",
  //     error: err,
  //   });
  // }
});

router.post("/", async (req, res) => {
});

export default router;
