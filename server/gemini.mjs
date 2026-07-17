// Gemini integration. The API key lives in server-side env only and is never
// sent to or requested from the browser. The hero Business Health Score and the
// deterministic audit are computed server-side; the model supplies the
// qualitative analysis and is told to ground it in the measured audit evidence.

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

const str = { type: "STRING" };
const int = { type: "INTEGER" };
const num = { type: "NUMBER" };
const bool = { type: "BOOLEAN" };

const evidencedList = {
  type: "ARRAY",
  description: "2-4 items, each tracing back to a concrete audit finding or provided detail",
  items: {
    type: "OBJECT",
    properties: {
      point: str,
      evidence: { ...str, description: "The specific finding/signal this is based on" },
    },
    required: ["point", "evidence"],
  },
};

export const REPORT_SCHEMA = {
  type: "OBJECT",
  properties: {
    businessName: str,
    industry: str,
    stage: { ...str, description: "Echo the DETECTED STAGE provided in the prompt" },
    stageRationale: str,
    summary: { ...str, description: "2-3 sentence plain-language understanding of the business today" },
    snapshot: {
      type: "ARRAY",
      description: "Exactly 6 dimensions: brand, digital, product, distribution, operations, ai. Scores must be consistent with the audit evidence.",
      items: {
        type: "OBJECT",
        properties: {
          key: { ...str, enum: ["brand", "digital", "product", "distribution", "operations", "ai"] },
          label: str,
          score: { ...int, description: "0-100" },
          insight: { ...str, description: "One sentence; reference the evidence where possible" },
        },
        required: ["key", "label", "score", "insight"],
      },
    },
    growthOpportunities: {
      type: "ARRAY",
      description: "4-6 prioritized opportunities, highest impact first",
      items: {
        type: "OBJECT",
        properties: {
          title: str,
          description: str,
          impact: { ...str, enum: ["High", "Medium", "Low"] },
          effort: { ...str, enum: ["Low", "Medium", "High"] },
          expectedOutcome: str,
          timeframe: str,
        },
        required: ["title", "description", "impact", "effort", "expectedOutcome", "timeframe"],
      },
    },
    aiOpportunities: {
      type: "ARRAY",
      description: "3-5 AI automation opportunities, each with realistic quantified savings for a business of this size",
      items: {
        type: "OBJECT",
        properties: {
          title: str,
          area: { ...str, description: "Marketing, Operations, Sales, Support, or Product" },
          description: str,
          impact: { ...str, enum: ["High", "Medium", "Low"] },
          hoursSavedPerWeek: { ...int, description: "Estimated hours saved per week" },
          monthlySavingsInr: { ...int, description: "Estimated monthly saving/gain in INR (rupees)" },
        },
        required: ["title", "area", "description", "impact", "hoursSavedPerWeek", "monthlySavingsInr"],
      },
    },
    swot: {
      type: "OBJECT",
      description: "Each point must cite a concrete audit finding or provided detail as evidence",
      properties: {
        strengths: evidencedList,
        weaknesses: evidencedList,
        opportunities: evidencedList,
        threats: evidencedList,
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"],
    },
    expansionStrategies: {
      type: "ARRAY",
      description: "4-6 strategic decisions. MUST include building a brand, expanding distribution, manufacturing in-house, and launching new products.",
      items: {
        type: "OBJECT",
        properties: {
          title: str,
          question: str,
          recommendation: { ...str, enum: ["Recommended", "Worth exploring", "Not yet"] },
          rationale: str,
        },
        required: ["title", "question", "recommendation", "rationale"],
      },
    },
    competitorBenchmark: {
      type: "OBJECT",
      description: "Lightweight benchmark: category averages + 2-3 realistic named local/category competitors with plausible public signals (0-100 for seo/speed/social).",
      properties: {
        summary: str,
        category: {
          type: "OBJECT",
          properties: { googleRating: num, reviews: int, seo: int, speed: int, social: int },
          required: ["googleRating", "reviews", "seo", "speed", "social"],
        },
        competitors: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: str,
              googleRating: num,
              reviews: int,
              seo: int,
              speed: int,
              social: int,
              note: str,
            },
            required: ["name", "googleRating", "reviews", "seo", "speed", "social", "note"],
          },
        },
      },
      required: ["summary", "category", "competitors"],
    },
    personas: {
      type: "ARRAY",
      description: "2-3 target customer personas",
      items: {
        type: "OBJECT",
        properties: {
          name: { ...str, description: "A short persona label, e.g. 'Busy Urban Pet Parent'" },
          description: str,
          needs: str,
          channels: { ...str, description: "Where to reach them" },
        },
        required: ["name", "description", "needs", "channels"],
      },
    },
    journey: {
      type: "ARRAY",
      description: "Customer journey — exactly 4 stages: Awareness, Consideration, Purchase, Retention",
      items: {
        type: "OBJECT",
        properties: {
          stage: { ...str, enum: ["Awareness", "Consideration", "Purchase", "Retention"] },
          touchpoint: str,
          opportunity: str,
        },
        required: ["stage", "touchpoint", "opportunity"],
      },
    },
    roadmap: {
      type: "ARRAY",
      description: "Exactly 3 phases: 30 Days, 60 Days, 90 Days. Front-load quick wins in the 30-day phase.",
      items: {
        type: "OBJECT",
        properties: {
          phase: { ...str, enum: ["30 Days", "60 Days", "90 Days"] },
          focus: str,
          tasks: {
            type: "ARRAY",
            description: "3-5 tasks",
            items: {
              type: "OBJECT",
              properties: {
                title: str,
                detail: str,
                impact: { ...str, enum: ["High", "Medium", "Low"] },
                effort: { ...str, enum: ["Low", "Medium", "High"] },
                quickWin: { ...bool, description: "True if high-impact and low-effort" },
              },
              required: ["title", "detail", "impact", "effort", "quickWin"],
            },
          },
        },
        required: ["phase", "focus", "tasks"],
      },
    },
    recommendedServices: {
      type: "ARRAY",
      description: "Exactly 4 — one per Soulful Labs program (Incubation, Acceleration, AI Tools, Projects & Consulting), ranked by fit, exactly one 'Best fit'.",
      items: {
        type: "OBJECT",
        properties: {
          service: { ...str, enum: ["Incubation", "Acceleration", "AI Tools", "Projects & Consulting"] },
          fit: { ...str, enum: ["Best fit", "Strong fit", "Consider"] },
          matchScore: { ...int, description: "0-100" },
          why: str,
          whatYouGet: str,
        },
        required: ["service", "fit", "matchScore", "why", "whatYouGet"],
      },
    },
    consultationPitch: { ...str, description: "One warm, specific sentence inviting a Soulful Labs consultation" },
  },
  required: [
    "businessName", "industry", "stage", "stageRationale", "summary", "snapshot",
    "growthOpportunities", "aiOpportunities", "swot", "expansionStrategies",
    "competitorBenchmark", "personas", "journey", "roadmap", "recommendedServices",
    "consultationPitch",
  ],
};

const SERVICE_BRIEF = `SOULFUL LABS PROGRAMS:
- Incubation (0 -> 1): idea-stage / pre-launch founders. Validate, brand, and build a foundation.
- Acceleration (1 -> 10): businesses with traction — growth, distribution, go-to-market.
- AI Tools (automate): ready-to-use AI automations that remove manual work.
- Projects & Consulting (custom): bespoke builds or a focused strategy engagement.`;

function auditEvidenceText(audit) {
  if (!audit?.available) return "No website/GBP audit available — rely on the owner's description.";
  const lines = [`Measured digital audit score: ${audit.score}/100 (source: ${audit.source}).`];
  for (const cat of audit.categories) {
    if (cat.score == null) continue;
    lines.push(`- ${cat.label} (${cat.score}/100): ` + cat.checks.map((c) => `${c.label}=${c.status} [${c.evidence}]`).join("; "));
  }
  return lines.join("\n");
}

function buildPrompt(context, audit, stage) {
  const { input, website, businessName } = context;
  const lines = [
    "You are a senior business growth advisor at Soulful Labs, an AI-first venture studio.",
    "Produce a personalized Business Possibilities report. CRITICAL: ground every score, SWOT point, and insight in the MEASURED AUDIT EVIDENCE below — do not assert numbers the evidence can't support. Where evidence is missing, say so rather than inventing it.",
    "",
    SERVICE_BRIEF,
    "",
    `BUSINESS NAME (best guess): ${businessName}`,
    `INDUSTRY: ${input.industry || "infer from the site/details"}`,
    `DETECTED STAGE (use this): ${stage.label} — ${stage.rationale}`,
    `PRIMARY GOAL: ${input.goal || "not specified"}`,
    `CURRENT CHALLENGES: ${input.challenges?.length ? input.challenges.join("; ") : "not specified"}`,
    input.revenueBand ? `REVENUE: ${input.revenueBand}` : "",
    input.teamSize ? `TEAM SIZE: ${input.teamSize}` : "",
    input.locations ? `LOCATIONS: ${input.locations}` : "",
    input.channels?.length ? `SALES CHANNELS: ${input.channels.join(", ")}` : "",
  ];

  if (input.businessDetails) lines.push("", "BUSINESS DETAILS (owner's words):", input.businessDetails);

  lines.push("", "MEASURED AUDIT EVIDENCE:", auditEvidenceText(audit));

  if (website?.textSample) lines.push("", "WEBSITE TEXT SAMPLE:", website.textSample);

  lines.push(
    "",
    "Return the report as JSON per the schema.",
    "Quantify each AI opportunity with realistic hoursSavedPerWeek and monthlySavingsInr for a business of this size/stage.",
    "recommendedServices MUST include all four programs ranked by fit with exactly one 'Best fit'.",
    "expansionStrategies MUST cover building a brand, expanding distribution, manufacturing in-house, and launching new products.",
    "Every SWOT point must cite a concrete finding in its evidence field. Keep all text crisp and confident."
  );

  return lines.filter((l) => l !== "").join("\n");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DEFAULT_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite-001",
];

function modelChain() {
  const preferred = process.env.GEMINI_MODEL?.trim();
  const chain = preferred ? [preferred, ...DEFAULT_MODELS] : [...DEFAULT_MODELS];
  return [...new Set(chain)];
}

const isRetryable = (status) => status === 429 || status >= 500;

async function callModel(model, apiKey, prompt) {
  const res = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
      },
    }),
    signal: AbortSignal.timeout(55_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`Gemini API error ${res.status} on ${model}: ${detail.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  if (!text) throw new Error(`Gemini returned an empty response on ${model}`);

  let report;
  try {
    report = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini response was not valid JSON");
    report = JSON.parse(match[0]);
  }

  if (!Array.isArray(report.snapshot) || !Array.isArray(report.recommendedServices)) {
    throw new Error("Gemini response did not match the report shape");
  }
  return report;
}

export async function generateReport(context, audit, stage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  const prompt = buildPrompt(context, audit, stage);
  const models = modelChain();
  let lastErr;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await callModel(model, apiKey, prompt);
      } catch (err) {
        lastErr = err;
        const status = err.status;
        if (status && !isRetryable(status)) throw err;
        if (attempt === 0 && isRetryable(status)) {
          await sleep(1200);
          continue;
        }
        break;
      }
    }
  }
  throw lastErr ?? new Error("All Gemini models failed");
}
