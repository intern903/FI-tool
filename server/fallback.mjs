// Heuristic report generator used when the Gemini API is unreachable, so the
// product still returns a useful, signal-driven report instead of an error.

const clamp = (n, lo = 8, hi = 96) => Math.max(lo, Math.min(hi, Math.round(n)));

const STAGE_FROM_INPUT = {
  "Just an idea": "Idea / pre-launch",
  "Pre-launch": "Idea / pre-launch",
  "Early stage (0–2 yrs)": "Early stage",
  "Growing (2–5 yrs)": "Growing",
  "Established (5+ yrs)": "Established",
  "Scaling / multi-location": "Scaling",
};

function inferStage(input, website) {
  if (input.stage && STAGE_FROM_INPUT[input.stage]) return STAGE_FROM_INPUT[input.stage];
  if (!input.websiteUrl) return "Idea / pre-launch";
  if (!website?.reachable) return "Early stage";
  if ((website?.approxWordCount || 0) > 600) return "Growing";
  return "Early stage";
}

export function fallbackReport(context) {
  const { website, businessName, input } = context;
  const challenges = input.challenges || [];
  const has = (kw) => challenges.some((c) => c.toLowerCase().includes(kw));

  const stage = inferStage(input, website);
  const isEarly = stage === "Idea / pre-launch" || stage === "Early stage";

  const brand = clamp(
    (input.websiteUrl ? 35 : 18) +
      (website?.ogTitle ? 14 : 0) +
      (website?.metaDescription ? 10 : 0) +
      (website?.h1?.length ? 8 : 0) -
      (has("brand awareness") ? 12 : 0)
  );
  const digital = clamp(
    (input.websiteUrl ? 32 : 8) +
      (website?.reachable ? 16 : 0) +
      (website?.https ? 10 : 0) +
      ((website?.approxWordCount || 0) > 300 ? 12 : 3) -
      (has("online presence") ? 10 : 0)
  );
  const product = clamp(
    40 + (website?.h2?.length ? 10 : 0) + (input.businessDetails ? 8 : 0) - (has("new products") ? 6 : 0)
  );
  const distribution = clamp(
    30 + (website?.hasBookingHints ? 12 : 0) + Object.keys(website?.socialLinksOnSite || {}).length * 6 - (has("customers") ? 8 : 0)
  );
  const operations = clamp(
    42 + (website?.hasStructuredData ? 8 : 0) - (has("manual") ? 16 : 0) - (has("operations") ? 8 : 0)
  );
  const ai = clamp(20 + (has("manual") ? 6 : 0) + (input.goal === "Automate with AI" ? 14 : 0));

  const snapshot = [
    { key: "brand", label: "Brand & Identity", score: brand, insight: brand < 50 ? "Your brand story and identity have room to become sharper and more memorable." : "Brand fundamentals are in place; consistency will compound them." },
    { key: "digital", label: "Digital Presence", score: digital, insight: input.websiteUrl ? (website?.reachable ? "Your site is live; clarity and conversion paths can improve." : "Your site was unreachable during our scan — worth checking.") : "No website yet — a focused online presence is a top early lever." },
    { key: "product", label: "Product & Offering", score: product, insight: "Your core offering is defined; packaging and positioning can lift perceived value." },
    { key: "distribution", label: "Distribution & Reach", score: distribution, insight: has("customers") ? "Reaching more of the right customers is your stated challenge — channel focus matters." : "There are untapped channels to put your offering in front of more buyers." },
    { key: "operations", label: "Operations & Scale", score: operations, insight: has("manual") ? "Manual work is slowing you down — a prime target for automation." : "Operations are functional; tightening them will ease future scale." },
    { key: "ai", label: "AI Readiness", score: ai, insight: "AI is largely untapped here — a clear opportunity to save time and grow." },
  ];

  const overallScore = clamp(
    snapshot.reduce((s, d) => s + d.score, 0) / snapshot.length,
    10,
    92
  );

  const growthOpportunities = [
    !input.websiteUrl &&
      { title: "Establish a focused online presence", description: "A simple, conversion-focused site or landing page gives every other channel somewhere to send people.", impact: "High", effort: "Medium", expectedOutcome: "A credible home base that captures demand", timeframe: "2-4 weeks" },
    has("brand awareness") &&
      { title: "Sharpen your brand and messaging", description: "Clarify who you serve, the promise you make, and why you're different — then apply it everywhere consistently.", impact: "High", effort: "Medium", expectedOutcome: "Higher recall and easier word-of-mouth", timeframe: "3-5 weeks" },
    has("manual") &&
      { title: "Automate your most repetitive workflow", description: "Identify the task that eats the most hours and remove it with a simple AI or automation setup.", impact: "High", effort: "Low", expectedOutcome: "Hours saved each week, fewer errors", timeframe: "1-2 weeks" },
    { title: "Build a repeatable customer-acquisition channel", description: "Pick one channel your buyers actually use and make it consistent before adding more.", impact: "High", effort: "Medium", expectedOutcome: "Predictable, measurable lead flow", timeframe: "4-8 weeks" },
    { title: "Strengthen conversion, not just traffic", description: "Clear offers, proof, and a single obvious call-to-action turn existing interest into revenue.", impact: "Medium", effort: "Low", expectedOutcome: "More revenue from the same audience", timeframe: "2-3 weeks" },
    { title: "Set up simple analytics", description: "Track where leads and sales come from so every next decision is evidence-based.", impact: "Medium", effort: "Low", expectedOutcome: "Clear ROI on every channel", timeframe: "1 week" },
  ].filter(Boolean).slice(0, 6);

  const aiOpportunities = [
    { title: "Automate customer replies", area: "Support", description: "An AI assistant can answer common questions instantly, 24/7, and hand off only the complex ones.", impact: "High" },
    { title: "Generate marketing content", area: "Marketing", description: "Draft posts, emails, and product copy in minutes while keeping your brand voice.", impact: "High" },
    { title: "Streamline operations", area: "Operations", description: "Automate scheduling, follow-ups, and data entry that currently take manual hours.", impact: "Medium" },
    { title: "Personalize outreach", area: "Sales", description: "Use AI to tailor offers and follow-ups to each lead's context and boost conversion.", impact: "Medium" },
  ];

  const verdict = (rec) => rec;
  const expansionStrategies = [
    { title: "Build a brand", question: "Should I build a brand?", recommendation: brand < 55 ? verdict("Recommended") : verdict("Worth exploring"), rationale: brand < 55 ? "A stronger brand is one of your biggest untapped levers — it makes every marketing dollar work harder." : "Your brand base is decent; invest in consistency rather than a full rebuild." },
    { title: "Expand distribution", question: "Should I expand distribution?", recommendation: isEarly ? verdict("Worth exploring") : verdict("Recommended"), rationale: isEarly ? "Nail one channel first; expand once you have a repeatable motion." : "You have enough traction to justify adding proven new channels." },
    { title: "Manufacture in-house", question: "Should I manufacture myself?", recommendation: isEarly ? verdict("Not yet") : verdict("Worth exploring"), rationale: isEarly ? "Stay asset-light until demand is proven — outsource production for now." : "If margins and volume justify it, in-house production could improve control and unit economics." },
    { title: "Launch new products", question: "Should I launch new products?", recommendation: has("new products") ? verdict("Worth exploring") : verdict("Not yet"), rationale: has("new products") ? "Validate demand with a small test before committing to a full launch." : "Deepen and monetize your current offering before widening the line." },
  ];

  // Rank Soulful Labs programs by fit.
  const wantsAi = input.goal === "Automate with AI" || has("manual") || has("operations");
  let ranked;
  if (isEarly) {
    ranked = ["Incubation", wantsAi ? "AI Tools" : "Projects & Consulting", "Acceleration", wantsAi ? "Projects & Consulting" : "AI Tools"];
  } else if (wantsAi) {
    ranked = ["AI Tools", "Acceleration", "Projects & Consulting", "Incubation"];
  } else {
    ranked = ["Acceleration", "AI Tools", "Projects & Consulting", "Incubation"];
  }
  const SERVICE_COPY = {
    Incubation: { what: "Hands-on help to validate, brand, and build your business from the ground up." },
    Acceleration: { what: "Growth strategy, distribution, and go-to-market support to scale what's working." },
    "AI Tools": { what: "Ready-to-use AI automations that remove manual work across your business." },
    "Projects & Consulting": { what: "A bespoke build or focused strategy engagement for your specific need." },
  };
  const recommendedServices = ranked.map((service, i) => ({
    service,
    fit: i === 0 ? "Best fit" : i === 1 ? "Strong fit" : "Consider",
    matchScore: clamp(92 - i * 16, 30, 96),
    why:
      i === 0
        ? isEarly
          ? "You're early, and hands-on help shaping the foundation will de-risk everything that follows."
          : wantsAi
            ? "You want to remove manual work and move faster — ready-made AI is the quickest win."
            : "You have traction; focused growth support is the fastest way to compound it."
        : "A strong complement once your first priority is underway.",
    whatYouGet: SERVICE_COPY[service].what,
  }));

  const nextSteps = [
    { title: "Review this report with your team", detail: "Align on the two or three opportunities with the best impact-to-effort ratio." },
    { title: "Pick one quick win to start this week", detail: "Momentum matters more than a perfect plan — ship one improvement now." },
    { title: `Explore the ${recommendedServices[0].service} program`, detail: "It maps most closely to where your business is today." },
    { title: "Book a consultation with Soulful Labs", detail: "Get a tailored roadmap and honest guidance on your next best move." },
  ];

  return {
    businessName,
    industry: input.industry || "Not specified",
    stage,
    stageRationale: input.stage
      ? "Based on the stage you selected and the signals we could gather."
      : "Inferred from your website and the details provided.",
    summary: `${businessName} is at the ${stage.toLowerCase()} stage with clear, addressable room to grow. The fastest gains are in ${brand < digital ? "sharpening your brand" : "strengthening your digital presence"} and removing manual work with AI — foundations that make every later move easier.`,
    overallScore,
    snapshot,
    growthOpportunities,
    aiOpportunities,
    expansionStrategies,
    recommendedServices,
    nextSteps,
    consultationPitch: `Let's map out the fastest path forward for ${businessName} — book a free consultation and we'll turn this report into a concrete plan.`,
  };
}
