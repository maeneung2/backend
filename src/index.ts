import express from "express";
import api from "./routes";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("지금 텍스트 노출되면 정상 작동중");
});

app.use("/api", api);

app.listen(port, () => {
  console.log(`서버 실행중 http://localhost:${port}`);
});
