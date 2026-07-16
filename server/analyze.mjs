// Shared analysis pipeline used by both the local Express server
// (server/index.mjs) and the Vercel serverless function (api/analyze.js),
// so the two never drift apart.

import { collectContext } from "./collect.mjs";
import { generateReport } from "./gemini.mjs";
import { fallbackReport } from "./fallback.mjs";

const URL_RE = /^https?:\/\/\S+$/i;

function normalizeUrl(value) {
  if (!value) return undefined;
  const v = String(value).trim();
  if (!v) return undefined;
  return URL_RE.test(v) ? v : `https://${v}`;
}

const clean = (v) => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t.slice(0, 2000) : undefined;
};

export function parseInput(body) {
  const b = body ?? {};
  const challenges = Array.isArray(b.challenges)
    ? b.challenges.filter((c) => typeof c === "string").slice(0, 12).map((c) => c.slice(0, 120))
    : [];
  return {
    websiteUrl: normalizeUrl(b.websiteUrl),
    businessDetails: clean(b.businessDetails),
    industry: clean(b.industry),
    stage: clean(b.stage),
    goal: clean(b.goal),
    challenges,
  };
}

/**
 * Runs the full audit for a request body.
 * @returns {Promise<{status:number, body:object}>}
 */
export async function runAnalysis(body) {
  const input = parseInput(body);

  if (!input.websiteUrl && !input.businessDetails) {
    return {
      status: 400,
      body: { error: "Add your website URL, or describe your business — either one works." },
    };
  }
  if (input.websiteUrl) {
    try {
      const parsed = new URL(input.websiteUrl);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("bad protocol");
    } catch {
      return { status: 400, body: { error: `"${input.websiteUrl}" is not a valid URL.` } };
    }
  }

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
  return {
    status: 200,
    body: { report, source, context: context.summaryForClient },
  };
}
