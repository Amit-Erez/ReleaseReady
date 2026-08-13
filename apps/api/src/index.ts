import express from "express";
import { config } from "./config.js";
import { releasesRouter } from "./routes/releases.js";
import { tracksRouter } from "./routes/tracks.js";
import { contributorsRouter } from "./routes/contributors.js";
import { trackContributorsRouter } from "./routes/trackContributors.js";

const app = express();
app.use(express.json());

const port = config.PORT;
app.use('/api/releases', releasesRouter);
app.use('/api/releases/:releaseId/tracks', tracksRouter);
app.use('/api/contributors', contributorsRouter);
app.use('/api/tracks/:trackId/contributors', trackContributorsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
