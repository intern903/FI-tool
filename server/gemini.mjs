// Gemini integration. The API key lives in server-side env only and is never
// sent to or requested from the browser.

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

const str = { type: "STRING" };
const int = { type: "INTEGER" };

export const REPORT_SCHEMA = {
  type: "OBJECT",
  properties: {
    businessName: str,
    industry: { ...str, description: "The business's industry, confirmed or inferred" },
    stage: {
      ...str,
      description:
        "Current business stage, one short phrase, e.g. 'Idea / pre-launch', 'Early stage', 'Growing', 'Established', 'Scaling'",
    },
    stageRationale: { ...str, description: "One sentence on why this stage was assigned" },
    summary: {
      ...str,
      description: "2-3 sentence plain-language understanding of the business as it is today",
    },
    overallScore: { ...int, description: "Overall growth-readiness score, 0-100" },
    snapshot: {
      type: "ARRAY",
      description:
        "Exactly 6 dimensions with keys: brand, digital, product, distribution, operations, ai",
      items: {
        type: "OBJECT",
        properties: {
          key: {
            ...str,
            enum: ["brand", "digital", "product", "distribution", "operations", "ai"],
          },
          label: str,
          score: { ...int, description: "0-100" },
          insight: { ...str, description: "One concise sentence on the current state" },
        },
        required: ["key", "label", "score", "insight"],
      },
    },
    growthOpportunities: {
      type: "ARRAY",
      description: "4-6 prioritized growth opportunities, highest impact first",
      items: {
        type: "OBJECT",
        properties: {
          title: str,
          description: str,
          impact: { ...str, enum: ["High", "Medium", "Low"] },
          effort: { ...str, enum: ["Low", "Medium", "High"] },
          expectedOutcome: str,
          timeframe: { ...str, description: "e.g. '2-4 weeks' or '1-3 months'" },
        },
        required: ["title", "description", "impact", "effort", "expectedOutcome", "timeframe"],
      },
    },
    aiOpportunities: {
      type: "ARRAY",
      description: "3-5 concrete ways AI can automate or improve this specific business",
      items: {
        type: "OBJECT",
        properties: {
          title: str,
          area: {
            ...str,
            description: "Business area, e.g. Marketing, Operations, Sales, Support, Product",
          },
          description: { ...str, description: "What it automates and the benefit, one or two sentences" },
          impact: { ...str, enum: ["High", "Medium", "Low"] },
        },
        required: ["title", "area", "description", "impact"],
      },
    },
    expansionStrategies: {
      type: "ARRAY",
      description:
        "4-6 strategic possibilities framed as decisions. MUST include: building a brand, expanding distribution, manufacturing in-house, and launching new products. Add others if relevant.",
      items: {
        type: "OBJECT",
        properties: {
          title: { ...str, description: "e.g. 'Build a brand'" },
          question: { ...str, description: "e.g. 'Should I build a brand?'" },
          recommendation: { ...str, enum: ["Recommended", "Worth exploring", "Not yet"] },
          rationale: { ...str, description: "1-2 sentences justifying the recommendation for THIS business" },
        },
        required: ["title", "question", "recommendation", "rationale"],
      },
    },
    recommendedServices: {
      type: "ARRAY",
      description:
        "Exactly 4 items — one per Soulful Labs program (Incubation, Acceleration, AI Tools, Projects & Consulting) — ranked by fit for this business, best first.",
      items: {
        type: "OBJECT",
        properties: {
          service: {
            ...str,
            enum: ["Incubation", "Acceleration", "AI Tools", "Projects & Consulting"],
          },
          fit: { ...str, enum: ["Best fit", "Strong fit", "Consider"] },
          matchScore: { ...int, description: "How well it fits this business, 0-100" },
          why: { ...str, description: "Why this program fits (or doesn't yet) for this specific business" },
          whatYouGet: { ...str, description: "What the business would get from this program" },
        },
        required: ["service", "fit", "matchScore", "why", "whatYouGet"],
      },
    },
    nextSteps: {
      type: "ARRAY",
      description: "3-5 concrete, sequenced next steps the owner should take",
      items: {
        type: "OBJECT",
        properties: { title: str, detail: str },
        required: ["title", "detail"],
      },
    },
    consultationPitch: {
      ...str,
      description:
        "One warm, specific sentence inviting them to book a consultation with Soulful Labs, referencing their situation",
    },
  },
  required: [
    "businessName",
    "industry",
    "stage",
    "stageRationale",
    "summary",
    "overallScore",
    "snapshot",
    "growthOpportunities",
    "aiOpportunities",
    "expansionStrategies",
    "recommendedServices",
    "nextSteps",
    "consultationPitch",
  ],
};

const SERVICE_BRIEF = `SOULFUL LABS PROGRAMS (recommend the best-fit ones):
- Incubation (0 -> 1): for idea-stage / pre-launch founders. Hands-on help to validate, shape brand & product, and build a real foundation from scratch.
- Acceleration (1 -> 10): for businesses that already have traction and want to scale — growth strategy, distribution, go-to-market.
- AI Tools (automate): ready-to-use AI products and automations that remove manual work across marketing, operations, sales, and support.
- Projects & Consulting (custom): bespoke builds and expert strategy for a specific, defined need — custom software or a focused growth/strategy engagement.`;

function buildPrompt(context) {
  const { input, website, businessName } = context;
  const lines = [
    "You are a senior business growth advisor at Soulful Labs, an AI-first venture studio.",
    "Analyze the business below and produce a personalized 'Business Possibilities' report that helps the owner understand their next best steps, and recommends the most relevant Soulful Labs program(s).",
    "Be specific and grounded in the details provided — reference their industry, stage, and stated challenges. Where information is missing, treat it as a gap or an assumption to make explicit, never invent facts that contradict the inputs.",
    "",
    SERVICE_BRIEF,
    "",
    `BUSINESS NAME (best guess): ${businessName}`,
    `INDUSTRY: ${input.industry || "not specified — infer from the website/details"}`,
    `SELF-REPORTED STAGE: ${input.stage || "not specified — infer it"}`,
    `PRIMARY GOAL: ${input.goal || "not specified"}`,
    `CURRENT CHALLENGES: ${input.challenges?.length ? input.challenges.join("; ") : "not specified"}`,
  ];

  if (input.businessDetails) {
    lines.push("", "BUSINESS DETAILS (owner's own words):", input.businessDetails);
  }

  if (website) {
    lines.push(
      "",
      "WEBSITE SIGNALS:",
      JSON.stringify(
        {
          url: website.url,
          reachable: website.reachable,
          https: website.https,
          title: website.title,
          metaDescription: website.metaDescription,
          ogTitle: website.ogTitle,
          h1: website.h1,
          h2: website.h2,
          hasStructuredData: website.hasStructuredData,
          hasWhatsApp: website.hasWhatsApp,
          hasBookingHints: website.hasBookingHints,
          approxWordCount: website.approxWordCount,
          socialLinksFoundOnSite: website.socialLinksOnSite,
          error: website.error,
        },
        null,
        1
      ),
      website.textSample ? `WEBSITE TEXT SAMPLE:\n${website.textSample}` : ""
    );
  }

  lines.push(
    "",
    "Return the full report as JSON matching the response schema.",
    "The recommendedServices array MUST contain all four programs, ranked by fit for this business with exactly one clear 'Best fit'.",
    "The expansionStrategies MUST address building a brand, expanding distribution, manufacturing in-house, and launching new products, each with an honest recommendation for THIS business.",
    "Keep every text field crisp and confident — this renders in a premium dashboard for a real business owner."
  );

  return lines.filter((l) => l !== "").join("\n");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// These are frequently rate-limited or capacity-constrained on shared keys, so
// we try several in order before giving up. GEMINI_MODEL (if set) goes first.
const DEFAULT_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite-001",
];

function modelChain() {
  const preferred = process.env.GEMINI_MODEL?.trim();
  const chain = preferred ? [preferred, ...DEFAULT_MODELS] : [...DEFAULT_MODELS];
  return [...new Set(chain)]; // de-dupe while preserving order
}

// 429 (rate limit) and 5xx (overload/unavailable) are worth retrying on another
// model; 400/401/403 are configuration problems that won't fix themselves.
const isRetryable = (status) => status === 429 || status >= 500;

async function callModel(model, apiKey, prompt) {
  const res = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
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
    // Occasionally the model wraps JSON in fences despite the mime type.
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini response was not valid JSON");
    report = JSON.parse(match[0]);
  }

  if (
    typeof report.overallScore !== "number" ||
    !Array.isArray(report.snapshot) ||
    !Array.isArray(report.recommendedServices)
  ) {
    throw new Error("Gemini response did not match the report shape");
  }
  return report;
}

export async function generateReport(context) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  const prompt = buildPrompt(context);
  const models = modelChain();
  let lastErr;

  for (const model of models) {
    // One quick retry per model absorbs a brief 503 spike before moving on.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await callModel(model, apiKey, prompt);
      } catch (err) {
        lastErr = err;
        const status = err.status;
        if (status && !isRetryable(status)) {
          // Auth/config error: no other model will behave differently.
          throw err;
        }
        if (attempt === 0 && isRetryable(status)) {
          await sleep(1200);
          continue;
        }
        break; // move to the next model in the chain
      }
    }
  }
  throw lastErr ?? new Error("All Gemini models failed");
}
