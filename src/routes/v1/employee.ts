import express from "express";
import prisma from "../../prisma";

const router = express.Router();

router.post("/", async (req, res) => {
  const body = req.body;
  const { name, workCount, isNew, scheduleId } = body;

  if (!name || !workCount) {
    console.error("필수 데이터 누락");
    res.send({
      message: "유저 생성에 실패했습니다.",
      error: "필수 데이터 누락",
    });
    return;
  }

  try {
    const emp = await prisma.employee.create({
      data: {
        name: name,
        workCount: workCount,
        isNew: isNew,
        plan: [],
        scheduleId: scheduleId,
      },
    });
    console.log("생성된 유저:", emp);
    res.send({ data: emp });
  } catch (err) {
    console.error(err);
    res.send({ message: "유저 생성에 실패했습니다.", error: err });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);
    const emp = await prisma.employee.delete({
      where: { id: id },
    });
    console.log("생성된 유저:", emp);
    res.send({ data: emp });
  } catch (err) {
    console.error(err);
    res.send({ message: "유저 삭제에 실패했습니다.", error: err });
  }
});

router.get("/list", async (req, res) => {
  try {
    const employee = await prisma.employee.findMany();
    res.send({ data: employee });
  } catch (err) {
    res.send({
      message: "유저 호출에 실패하였거나, 없는 유저입니다.",
      error: err,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);
    const employee = await prisma.employee.findUnique({ where: { id: id } });
    res.send({ data: employee });
  } catch (err) {
    res.send({
      message: "유저 호출에 실패하였거나, 없는 유저입니다.",
      error: err,
    });
  }
});

export default router;
