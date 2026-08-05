import express from "express";
import { config } from "./config.js";
import { releasesRouter } from "./routes/releases.js";

const app = express();
app.use(express.json());

const port = config.PORT;
app.use("/api/releases", releasesRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
