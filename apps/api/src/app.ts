import express from "express";
import cors from "cors";
import { releasesRouter } from "./routes/releases.js";
import { trackByIdRouter, tracksRouter } from "./routes/tracks.js";
import { contributorsRouter } from "./routes/contributors.js";
import { trackContributorsRouter } from "./routes/trackContributors.js";

export const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/releases', releasesRouter);
app.use('/api/releases/:releaseId/tracks', tracksRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/tracks/:trackId/contributors', trackContributorsRouter);
app.use("/api/tracks", trackByIdRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});