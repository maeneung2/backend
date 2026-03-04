import "dotenv/config";
import express from "express";
import api from "./routes";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import { generateOpenApiSpec } from "./docs/openapi";

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

app.get("/", (_req, res) => {
  res.send("find bibun DEV server is running");
});

app.get("/api-spec.json", (_req, res) => {
  res.json(generateOpenApiSpec());
});

app.get("/docs", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Find Bibun API</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/api-spec.json"
      src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`);
});

app.use("/api", api);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`포트 : ${port}`);
});
