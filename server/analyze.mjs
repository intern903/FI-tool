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

export function parseInput(body) {
  const b = body ?? {};
  return {
    googleMapsUrl: normalizeUrl(b.googleMapsUrl),
    websiteUrl: normalizeUrl(b.websiteUrl),
    socials: {
      instagram: normalizeUrl(b.instagram),
      facebook: normalizeUrl(b.facebook),
      linkedin: normalizeUrl(b.linkedin),
      youtube: normalizeUrl(b.youtube),
      x: normalizeUrl(b.x),
    },
  };
}

/**
 * Runs the full audit for a request body.
 * @returns {Promise<{status:number, body:object}>}
 */
export async function runAnalysis(body) {
  const input = parseInput(body);

  if (!input.googleMapsUrl && !input.websiteUrl) {
    return {
      status: 400,
      body: { error: "Provide a Google Maps business URL, a website URL, or both." },
    };
  }
  for (const url of [input.googleMapsUrl, input.websiteUrl]) {
    if (url) {
      try {
        const parsed = new URL(url);
        if (!/^https?:$/.test(parsed.protocol)) throw new Error("bad protocol");
      } catch {
        return { status: 400, body: { error: `"${url}" is not a valid URL.` } };
      }
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
