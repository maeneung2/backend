import express from "express";
import api from "./routes";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("찐찐찐찐찐찐찐찐막테스트");
});

app.use("/api", api);

app.listen(port, () => {
  console.log(`서버 실행중 http://localhost:${port}`);
});
