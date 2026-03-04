import "dotenv/config";
import express from "express";
import api from "./routes";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const port = 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://mn.s3.find-bibun.dev.s3-website.ap-northeast-2.amazonaws.com",
  "http://mn.s3.find-bibun.prod.s3-website.ap-northeast-2.amazonaws.com",
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.send("find bibun DEV server is running");
});

app.use("/api", api);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`포트 : ${port}`);
});
