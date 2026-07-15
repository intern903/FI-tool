// Vercel serverless function → served at /api/analyze in production.
// Vercel maps files in this /api directory to endpoints automatically; the
// GEMINI_API_KEY environment variable configured in the Vercel dashboard is
// read here via process.env and never reaches the browser.

import { runAnalysis } from "../server/analyze.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const result = await runAnalysis(body ?? {});
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Analysis failed:", err);
    return res.status(500).json({ error: "Analysis failed. Please try again." });
  }
}

// The Gemini call can take 20-40s; raise the function timeout above the
// default 10s so it isn't killed mid-request.
export const config = { maxDuration: 60 };
