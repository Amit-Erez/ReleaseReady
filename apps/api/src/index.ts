import express from "express";
import { config } from "./config.js";

const app = express();
const port = config.PORT;

app.get("/health", (_req, res) => { 
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
