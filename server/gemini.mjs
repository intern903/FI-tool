// Gemini integration. The API key lives in server-side env only and is never
// sent to or requested from the browser.

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

const str = { type: "STRING" };
const int = { type: "INTEGER" };
const num = { type: "NUMBER" };

export const REPORT_SCHEMA = {
  type: "OBJECT",
  properties: {
    businessName: str,
    summary: { ...str, description: "2-3 sentence executive summary of the audit" },
    overallScore: { ...int, description: "Overall growth health score, 0-100" },
    health: {
      type: "ARRAY",
      description: "Exactly 6 items, keys: seo, maps, website, social, brand, trust",
      items: {
        type: "OBJECT",
        properties: {
          key: { ...str, enum: ["seo", "maps", "website", "social", "brand", "trust"] },
          label: str,
          score: { ...int, description: "0-100" },
          insight: { ...str, description: "One concise sentence on the current state" },
        },
        required: ["key", "label", "score", "insight"],
      },
    },
    opportunities: {
      type: "ARRAY",
      description: "6-9 prioritized growth opportunities",
      items: {
        type: "OBJECT",
        properties: {
          title: str,
          description: str,
          impact: { ...str, enum: ["High", "Medium", "Low"] },
          difficulty: { ...str, enum: ["Easy", "Moderate", "Hard"] },
          expectedResult: str,
          timeRequired: { ...str, description: "e.g. '2-3 hours' or '1 week'" },
        },
        required: ["title", "description", "impact", "difficulty", "expectedResult", "timeRequired"],
      },
    },
    competitors: {
      type: "ARRAY",
      description:
        "Exactly 4 rows: first the audited business (isYou=true, name='You'), then 3 realistic local competitor archetypes named 'Competitor A/B/C'",
      items: {
        type: "OBJECT",
        properties: {
          name: str,
          isYou: { type: "BOOLEAN" },
          googleRating: { ...num, description: "0.0-5.0" },
          reviews: int,
          seo: { ...int, description: "0-100" },
          speed: { ...int, description: "0-100" },
          social: { ...int, description: "0-100" },
          content: { ...int, description: "0-100" },
          trust: { ...int, description: "0-100" },
        },
        required: ["name", "isYou", "googleRating", "reviews", "seo", "speed", "social", "content", "trust"],
      },
    },
    roadmap: {
      type: "ARRAY",
      description: "Exactly 3 phases: 30 Days, 60 Days, 90 Days",
      items: {
        type: "OBJECT",
        properties: {
          phase: { ...str, enum: ["30 Days", "60 Days", "90 Days"] },
          focus: { ...str, description: "One-line theme of the phase" },
          tasks: {
            type: "ARRAY",
            description: "3-5 tasks",
            items: {
              type: "OBJECT",
              properties: { title: str, detail: str },
              required: ["title", "detail"],
            },
          },
        },
        required: ["phase", "focus", "tasks"],
      },
    },
    recommendations: {
      type: "ARRAY",
      description: "4-6 strategic AI recommendations",
      items: {
        type: "OBJECT",
        properties: {
          title: str,
          why: str,
          expectedImpact: str,
          estimatedEffort: str,
          details: { ...str, description: "2-3 sentences shown when the user expands 'Learn More'" },
        },
        required: ["title", "why", "expectedImpact", "estimatedEffort", "details"],
      },
    },
    quickWins: {
      type: "ARRAY",
      description: "Exactly 5 highest-leverage quick actions",
      items: {
        type: "OBJECT",
        properties: { title: str, description: str, expectedResult: str },
        required: ["title", "description", "expectedResult"],
      },
    },
    revenueOpportunities: {
      type: "ARRAY",
      description: "4-6 concrete revenue opportunities",
      items: {
        type: "OBJECT",
        properties: {
          title: str,
          description: str,
          potential: { ...str, description: "Plain-language upside, e.g. '+15-20% inbound calls'" },
        },
        required: ["title", "description", "potential"],
      },
    },
  },
  required: [
    "businessName",
    "summary",
    "overallScore",
    "health",
    "opportunities",
    "competitors",
    "roadmap",
    "recommendations",
    "quickWins",
    "revenueOpportunities",
  ],
};

function buildPrompt(context) {
  const { input, website, maps, socials, businessName } = context;
  const lines = [
    "You are a senior growth consultant at a top-tier business growth agency.",
    "Audit the local business below using ONLY the collected public signals, and produce a personalized, specific, actionable growth strategy.",
    "Be concrete: reference the business's actual situation (missing metadata, review counts, absent channels) rather than generic advice.",
    "Scores must be honest and internally consistent with the signals. Do not invent facts that contradict the data; where data is missing, treat it as a gap to fix.",
    "",
    `BUSINESS NAME (best guess): ${businessName}`,
    "",
    "PROVIDED INPUTS:",
    `- Google Maps URL: ${input.googleMapsUrl || "not provided"}`,
    `- Website URL: ${input.websiteUrl || "not provided"}`,
    `- Social profiles provided: ${Object.keys(socials).length ? Object.entries(socials).map(([k, v]) => `${k}: ${v}`).join(", ") : "none"}`,
  ];

  if (website) {
    lines.push(
      "",
      "WEBSITE SIGNALS:",
      JSON.stringify(
        {
          reachable: website.reachable,
          https: website.https,
          title: website.title,
          metaDescription: website.metaDescription,
          ogTitle: website.ogTitle,
          ogDescription: website.ogDescription,
          h1: website.h1,
          h2: website.h2,
          hasViewportMeta: website.hasViewportMeta,
          hasStructuredData: website.hasStructuredData,
          hasWhatsApp: website.hasWhatsApp,
          hasPhoneLink: website.hasPhoneLink,
          hasEmailLink: website.hasEmailLink,
          hasBookingHints: website.hasBookingHints,
          imageCount: website.imageCount,
          imagesMissingAlt: website.imagesMissingAlt,
          socialLinksFoundOnSite: website.socialLinksOnSite,
          approxWordCount: website.approxWordCount,
          error: website.error,
        },
        null,
        1
      ),
      "",
      website.textSample ? `WEBSITE TEXT SAMPLE:\n${website.textSample}` : ""
    );
  }
  if (maps) {
    lines.push(
      "",
      "GOOGLE MAPS SIGNALS (best effort, may be partial):",
      JSON.stringify(
        {
          reachable: maps.reachable,
          nameFromUrl: maps.nameFromUrl,
          nameFromPage: maps.nameFromPage,
          description: maps.description,
          rating: maps.rating,
          reviewCount: maps.reviewCount,
          category: maps.category,
          error: maps.error,
        },
        null,
        1
      )
    );
  }

  lines.push(
    "",
    "Return the full audit as JSON matching the response schema.",
    "The competitor benchmark should model 3 realistic local competitor archetypes (label them Competitor A, Competitor B, Competitor C) for this business category and locale.",
    "Order opportunities from highest to lowest impact. Keep every text field crisp — this renders in a premium dashboard."
  );

  return lines.filter((l) => l !== "").join("\n");
}

export async function generateReport(context) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

  const res = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildPrompt(context) }] }],
      generationConfig: {
        temperature: 0.6,
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
      },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  if (!text) throw new Error("Gemini returned an empty response");

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
    !Array.isArray(report.health) ||
    !Array.isArray(report.opportunities)
  ) {
    throw new Error("Gemini response did not match the report shape");
  }
  return report;
}
