import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runAnalysis } from "./analyze.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal .env loader for local dev so the server has zero extra runtime deps.
// On Vercel, environment variables come from the dashboard via process.env and
// this file isn't used (api/analyze.js runs instead).
const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const app = express();
app.use(express.json({ limit: "100kb" }));

app.post("/api/analyze", async (req, res) => {
  try {
    const result = await runAnalysis(req.body ?? {});
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Analysis failed:", err);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV === "production") {
  const dist = path.join(__dirname, "..", "dist");
  app.use(express.static(dist));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`GrowthLens API listening on :${port}`));
