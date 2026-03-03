import express from "express";
import api from "./routes";
import cors from "cors";
import dotenv from "dotenv";


const app = express();
const port = 3000;

dotenv.config();

app.use(cors());

app.get("/", (req, res) => {
  res.send("find bibun DEV server is running");
});

app.use("/api", api);

app.listen(port, () => {
  console.log(`포트 : ${port}`);
});
