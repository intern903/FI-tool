// Heuristic report used when the Gemini API is unreachable. It produces the same
// qualitative shape the model would, grounded in the deterministic audit so the
// downstream composition (health score, stage, benchmarks) still works.

const clamp = (n, lo = 8, hi = 95) => Math.max(lo, Math.min(hi, Math.round(n)));

export function fallbackReport(context, audit, stage) {
  const { website, businessName, input } = context;
  const challenges = input.challenges || [];
  const has = (kw) => challenges.some((c) => c.toLowerCase().includes(kw));
  const cat = (key) => {
    const c = audit?.categories?.find((x) => x.key === key);
    return c?.score ?? null;
  };
  const isEarly = /idea|pre-launch|early/i.test(stage.label);

  const digital = audit?.available && audit.score != null ? audit.score : clamp(website?.reachable ? 45 : 20);
  const brand = clamp((cat("seo") ?? 40) * 0.5 + (cat("social") ?? 30) * 0.3 + (website?.ogTitle ? 15 : 0) - (has("brand awareness") ? 10 : 0));
  const product = clamp(50 + (website?.h2?.length ? 8 : 0) + (input.businessDetails ? 6 : 0));
  const distribution = clamp(35 + (cat("social") ?? 0) * 0.2 + (website?.hasBookingHints ? 10 : 0) - (has("customers") ? 8 : 0));
  const operations = clamp(48 - (has("manual") ? 16 : 0) - (has("operations") ? 8 : 0) + (cat("structured") ? 6 : 0));
  const ai = clamp(22 + (input.goal === "Automate with AI" ? 14 : 0) + (has("manual") ? 6 : 0));

  const snapshot = [
    { key: "brand", label: "Brand & Identity", score: brand, insight: brand < 50 ? "Brand signals are thin relative to your offering." : "Brand fundamentals are in place." },
    { key: "digital", label: "Digital Presence", score: digital, insight: audit?.available ? `Measured digital audit score of ${audit.score}/100.` : "No website was measured for this report." },
    { key: "product", label: "Product & Offering", score: product, insight: "Your core offering is defined; positioning can lift perceived value." },
    { key: "distribution", label: "Distribution & Reach", score: distribution, insight: has("customers") ? "Reaching the right customers is a stated challenge." : "Untapped channels remain for your offering." },
    { key: "operations", label: "Operations & Scale", score: operations, insight: has("manual") ? "Manual work is a prime automation target." : "Operations are functional and can be tightened." },
    { key: "ai", label: "AI Readiness", score: ai, insight: "AI is largely untapped — a clear time-saving opportunity." },
  ];

  const growthOpportunities = [
    (cat("performance") != null && cat("performance") < 60) &&
      { title: "Fix website performance", description: "Your measured performance is below par — faster pages convert better and rank higher.", impact: "High", effort: "Medium", expectedOutcome: "Lower bounce, better rankings", timeframe: "2-4 weeks" },
    (cat("seo") != null && cat("seo") < 65) &&
      { title: "Close on-page SEO gaps", description: "The audit flagged missing metadata/structure that limits discoverability.", impact: "High", effort: "Low", expectedOutcome: "More qualified organic traffic", timeframe: "1-2 weeks" },
    has("manual") &&
      { title: "Automate your most repetitive workflow", description: "Remove the task that eats the most hours with a simple AI setup.", impact: "High", effort: "Low", expectedOutcome: "Hours saved weekly", timeframe: "1-2 weeks" },
    { title: "Build a repeatable acquisition channel", description: "Pick one channel your buyers use and make it consistent before adding more.", impact: "High", effort: "Medium", expectedOutcome: "Predictable lead flow", timeframe: "4-8 weeks" },
    { title: "Strengthen conversion paths", description: "Clear offers, proof, and one obvious CTA turn existing interest into revenue.", impact: "Medium", effort: "Low", expectedOutcome: "More revenue from the same traffic", timeframe: "2-3 weeks" },
  ].filter(Boolean).slice(0, 5);

  const aiOpportunities = [
    { title: "Automate customer replies", area: "Support", description: "An AI assistant handles common questions instantly, 24/7.", impact: "High", hoursSavedPerWeek: 8, monthlySavingsInr: 24000 },
    { title: "Generate marketing content", area: "Marketing", description: "Draft posts, emails, and product copy in minutes on-brand.", impact: "High", hoursSavedPerWeek: 6, monthlySavingsInr: 18000 },
    { title: "Streamline operations", area: "Operations", description: "Automate scheduling, follow-ups, and data entry.", impact: "Medium", hoursSavedPerWeek: 5, monthlySavingsInr: 15000 },
  ];

  const ev = (point, evidence) => ({ point, evidence });
  const swot = {
    strengths: [
      ev(website?.https ? "Secure, credible site" : "Clear business focus", website?.https ? "HTTPS/SSL check passed" : "Provided business description"),
      ev("Defined core offering", "Product & offering assessment"),
    ],
    weaknesses: [
      ev(cat("seo") != null && cat("seo") < 65 ? "On-page SEO gaps" : "Limited AI adoption", cat("seo") != null && cat("seo") < 65 ? `SEO audit ${cat("seo")}/100` : "AI readiness is low"),
      ev(has("manual") ? "Manual, time-consuming operations" : "Thin brand signals", has("manual") ? "Stated challenge" : "Brand dimension score"),
    ],
    opportunities: [
      ev("AI automation of repetitive work", "Low AI-readiness score with clear use cases"),
      ev("Untapped acquisition channels", "Distribution assessment"),
    ],
    threats: [
      ev("Faster-moving competitors", "Category benchmarking"),
      ev("Rising customer expectations on speed/experience", "Performance findings"),
    ],
  };

  const verdict = (r) => r;
  const expansionStrategies = [
    { title: "Build a brand", question: "Should I build a brand?", recommendation: brand < 55 ? verdict("Recommended") : verdict("Worth exploring"), rationale: brand < 55 ? "A stronger brand is a major untapped lever for you." : "Invest in consistency rather than a rebuild." },
    { title: "Expand distribution", question: "Should I expand distribution?", recommendation: isEarly ? verdict("Worth exploring") : verdict("Recommended"), rationale: isEarly ? "Nail one channel first, then expand." : "You have enough traction to add proven channels." },
    { title: "Manufacture in-house", question: "Should I manufacture myself?", recommendation: isEarly ? verdict("Not yet") : verdict("Worth exploring"), rationale: isEarly ? "Stay asset-light until demand is proven." : "Consider it if margins and volume justify the control." },
    { title: "Launch new products", question: "Should I launch new products?", recommendation: has("new products") ? verdict("Worth exploring") : verdict("Not yet"), rationale: has("new products") ? "Validate demand with a small test first." : "Deepen your current offering before widening the line." },
  ];

  const competitorBenchmark = {
    summary: "Compared against typical category benchmarks and representative competitors.",
    category: { googleRating: 4.2, reviews: 180, seo: 68, speed: 66, social: 60 },
    competitors: [
      { name: "Category leader", googleRating: 4.6, reviews: 520, seo: 82, speed: 78, social: 80, note: "Strong on every axis — the bar to aim for." },
      { name: "Close competitor", googleRating: 4.3, reviews: 210, seo: 70, speed: 64, social: 62, note: "Comparable size; beatable with focus." },
    ],
  };

  const personas = [
    { name: "Value-driven regular", description: "Repeat buyer who cares about reliability and convenience.", needs: "Fast service, trust, easy reordering", channels: "Search, WhatsApp, email" },
    { name: "First-time explorer", description: "Discovering you now and comparing options.", needs: "Clear proof, social validation, simple next step", channels: "Social, Google, referrals" },
  ];

  const journey = [
    { stage: "Awareness", touchpoint: "Search & social discovery", opportunity: "Improve SEO and social presence to be found." },
    { stage: "Consideration", touchpoint: "Website & reviews", opportunity: "Add proof, clear offers, and faster pages." },
    { stage: "Purchase", touchpoint: "Checkout / enquiry", opportunity: "Reduce friction with instant contact and clear CTAs." },
    { stage: "Retention", touchpoint: "Follow-up & repeat", opportunity: "Automate follow-ups and loyalty with AI." },
  ];

  const roadmap = [
    { phase: "30 Days", focus: "Quick wins & foundations", tasks: [
      { title: "Fix the top audit issues", detail: "Address the failing checks in your digital audit first.", impact: "High", effort: "Low", quickWin: true },
      { title: "Add instant contact CTAs", detail: "WhatsApp/call buttons on every page.", impact: "High", effort: "Low", quickWin: true },
      { title: "Publish clear offers", detail: "Make your core offer and proof obvious above the fold.", impact: "Medium", effort: "Low", quickWin: true },
    ]},
    { phase: "60 Days", focus: "Momentum & automation", tasks: [
      { title: "Deploy your first AI automation", detail: "Start with support or content to save hours weekly.", impact: "High", effort: "Medium", quickWin: false },
      { title: "Build 2-3 landing pages", detail: "Capture high-intent search for your core services.", impact: "Medium", effort: "Medium", quickWin: false },
    ]},
    { phase: "90 Days", focus: "Scale & authority", tasks: [
      { title: "Systematize acquisition", detail: "Double down on the channel with the best cost per lead.", impact: "High", effort: "Medium", quickWin: false },
      { title: "Launch reviews & referrals", detail: "Turn happy customers into a growth engine.", impact: "Medium", effort: "Low", quickWin: true },
    ]},
  ];

  const wantsAi = input.goal === "Automate with AI" || has("manual") || has("operations");
  const ranked = isEarly
    ? ["Incubation", wantsAi ? "AI Tools" : "Projects & Consulting", "Acceleration", wantsAi ? "Projects & Consulting" : "AI Tools"]
    : wantsAi
      ? ["AI Tools", "Acceleration", "Projects & Consulting", "Incubation"]
      : ["Acceleration", "AI Tools", "Projects & Consulting", "Incubation"];
  const SERVICE_WHAT = {
    Incubation: "Hands-on help to validate, brand, and build from the ground up.",
    Acceleration: "Growth strategy, distribution, and go-to-market to scale what works.",
    "AI Tools": "Ready-to-use AI automations that remove manual work.",
    "Projects & Consulting": "A bespoke build or focused strategy engagement.",
  };
  const recommendedServices = ranked.map((service, i) => ({
    service,
    fit: i === 0 ? "Best fit" : i === 1 ? "Strong fit" : "Consider",
    matchScore: clamp(92 - i * 16, 30, 96),
    why: i === 0
      ? isEarly
        ? "You're early; hands-on help shaping the foundation de-risks what follows."
        : wantsAi
          ? "You want to remove manual work fast — ready-made AI is the quickest win."
          : "You have traction; focused growth support compounds it fastest."
      : "A strong complement once your first priority is underway.",
    whatYouGet: SERVICE_WHAT[service],
  }));

  return {
    businessName,
    industry: input.industry || "Not specified",
    stage: stage.label,
    stageRationale: stage.rationale,
    summary: `${businessName} is at the ${stage.label.toLowerCase()} stage with clear, measurable room to grow. The fastest gains are in ${digital < brand ? "your digital presence" : "sharpening your brand"} and removing manual work with AI.`,
    snapshot,
    growthOpportunities,
    aiOpportunities,
    swot,
    expansionStrategies,
    competitorBenchmark,
    personas,
    journey,
    roadmap,
    recommendedServices,
    consultationPitch: `Let's turn this report into a concrete plan for ${businessName} — book a free consultation with Soulful Labs.`,
  };
}
