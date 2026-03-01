import express from "express";
import { defaultUser, userList } from "../../mockup/user";
import { defaultGroup } from "../../mockup/group";

const router = express.Router();

router.post("/", async (req, res) => {
  res.send({ message: `그룹 생성` });
});

router.delete("/:id", async (req, res) => {
  res.send({ message: `${req.params.id} 그룹 삭제` });
});

router.get("/:id", async (req, res) => {
  res.send({ data: defaultGroup });
});

export default router;
