// Shared analysis pipeline used by both the local Express server and the Vercel
// serverless function. Deterministic pieces (audit, stage, composite health
// score) are computed here and merged over whatever qualitative analysis the AI
// (or heuristic fallback) produced, so the report's hard numbers are traceable.

import { collectContext } from "./collect.mjs";
import { runPsi } from "./psi.mjs";
import { runAudit } from "./audit.mjs";
import { detectStage, computeHealth } from "./compose.mjs";
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

const cleanList = (v, max = 12) =>
  Array.isArray(v)
    ? v.filter((c) => typeof c === "string").slice(0, max).map((c) => c.slice(0, 120))
    : [];

export function parseInput(body) {
  const b = body ?? {};
  const socials = {};
  return {
    websiteUrl: normalizeUrl(b.websiteUrl),
    gbpUrl: normalizeUrl(b.gbpUrl),
    businessDetails: clean(b.businessDetails),
    industry: clean(b.industry),
    stage: clean(b.stage),
    goal: clean(b.goal),
    revenueBand: clean(b.revenueBand),
    teamSize: clean(b.teamSize),
    locations: clean(b.locations),
    channels: cleanList(b.channels, 8),
    challenges: cleanList(b.challenges),
    socials,
  };
}

function auditCat(audit, key) {
  const c = audit?.categories?.find((x) => x.key === key);
  return c?.score ?? null;
}

/** Merge deterministic pieces over the AI/heuristic report. */
function composeReport(ai, context, audit, stage, health) {
  const dim = (k) => ai.snapshot?.find((d) => d.key === k)?.score ?? 50;

  // Wire the digital snapshot dimension to the measured audit score.
  const snapshot = (ai.snapshot || []).map((d) =>
    d.key === "digital" && audit?.available && audit.score != null
      ? { ...d, score: audit.score }
      : d
  );

  const you = {
    name: "You",
    googleRating: context.gbp?.rating ?? null,
    reviews: context.gbp?.reviewCount ?? null,
    seo: auditCat(audit, "seo") ?? dim("digital"),
    speed: auditCat(audit, "performance") ?? 50,
    social: auditCat(audit, "social") ?? dim("brand"),
  };

  return {
    ...ai,
    stage: stage.label,
    stageRationale: stage.rationale,
    snapshot,
    overallScore: health.overallScore,
    healthBreakdown: health.breakdown,
    audit,
    competitorBenchmark: ai.competitorBenchmark
      ? { ...ai.competitorBenchmark, you }
      : undefined,
  };
}

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

  // Kick off PageSpeed Insights in parallel; it's best-effort and never blocks.
  const psiPromise = input.websiteUrl ? runPsi(input.websiteUrl) : Promise.resolve(null);

  const stage = detectStage(input);
  const context = await collectContext(input, psiPromise);
  const audit = runAudit(context);

  let ai;
  let source = "gemini";
  try {
    ai = await generateReport(context, audit, stage);
  } catch (err) {
    console.error("Gemini generation failed, using heuristic fallback:", err.message);
    ai = fallbackReport(context, audit, stage);
    source = "heuristic";
  }

  const health = computeHealth(audit, ai.snapshot);
  const report = composeReport(ai, context, audit, stage, health);

  return {
    status: 200,
    body: { report, source, context: context.summaryForClient },
  };
}
