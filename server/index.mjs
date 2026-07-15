import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectContext } from "./collect.mjs";
import { generateReport } from "./gemini.mjs";
import { fallbackReport } from "./fallback.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal .env loader so the server has zero extra runtime deps.
const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const app = express();
app.use(express.json({ limit: "100kb" }));

const URL_RE = /^https?:\/\/\S+$/i;

function normalizeUrl(value) {
  if (!value) return undefined;
  const v = String(value).trim();
  if (!v) return undefined;
  return URL_RE.test(v) ? v : `https://${v}`;
}

app.post("/api/analyze", async (req, res) => {
  const body = req.body ?? {};
  const input = {
    googleMapsUrl: normalizeUrl(body.googleMapsUrl),
    websiteUrl: normalizeUrl(body.websiteUrl),
    socials: {
      instagram: normalizeUrl(body.instagram),
      facebook: normalizeUrl(body.facebook),
      linkedin: normalizeUrl(body.linkedin),
      youtube: normalizeUrl(body.youtube),
      x: normalizeUrl(body.x),
    },
  };

  if (!input.googleMapsUrl && !input.websiteUrl) {
    return res.status(400).json({
      error: "Provide a Google Maps business URL, a website URL, or both.",
    });
  }
  for (const url of [input.googleMapsUrl, input.websiteUrl]) {
    if (url) {
      try {
        const parsed = new URL(url);
        if (!/^https?:$/.test(parsed.protocol)) throw new Error("bad protocol");
      } catch {
        return res.status(400).json({ error: `"${url}" is not a valid URL.` });
      }
    }
  }

  try {
    const context = await collectContext(input);
    let report;
    let source = "gemini";
    try {
      report = await generateReport(context);
    } catch (err) {
      console.error("Gemini generation failed, using heuristic fallback:", err.message);
      report = fallbackReport(context);
      source = "heuristic";
    }
    res.json({ report, source, context: context.summaryForClient });
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
