// Deterministic post-processing: business-stage detection from cheap heuristics,
// and the composite Business Health Score wired to the real audit signals + the
// qualitative dimensions. The hero number is computed here, not asserted by the
// LLM, and we return the full breakdown so the UI can show how it's built.

const REVENUE_RANK = {
  "Pre-revenue": 0,
  "Under ₹5L / year": 1,
  "₹5L – ₹50L / year": 2,
  "₹50L – ₹5Cr / year": 3,
  "₹5Cr+ / year": 4,
};
const TEAM_RANK = { "Just me": 0, "2–10": 1, "11–50": 2, "51–200": 3, "200+": 4 };
const LOC_RANK = { "Online only": 1, "1 location": 1, "2–5 locations": 2, "6+ locations": 3 };

const STAGE_LABELS = ["Idea / pre-launch", "Early stage", "Growing", "Established", "Scaling"];

export function detectStage(input) {
  const signals = [];
  const stageSel = input.stage || "";

  // Explicit idea/pre-launch selection short-circuits.
  if (/idea|pre-launch/i.test(stageSel)) {
    if (input.stage) signals.push(`You selected "${input.stage}"`);
    return { label: "Idea / pre-launch", rationale: signalSentence(signals, "Idea / pre-launch"), signals };
  }

  let score = 0;
  let evidence = 0;
  if (input.revenueBand != null && REVENUE_RANK[input.revenueBand] != null) {
    score += REVENUE_RANK[input.revenueBand] * 2;
    evidence++;
    signals.push(`Revenue ${input.revenueBand.toLowerCase()}`);
  }
  if (input.teamSize != null && TEAM_RANK[input.teamSize] != null) {
    score += TEAM_RANK[input.teamSize];
    evidence++;
    signals.push(`Team size ${input.teamSize}`);
  }
  if (input.locations != null && LOC_RANK[input.locations] != null) {
    score += LOC_RANK[input.locations];
    evidence++;
    signals.push(input.locations);
  }
  if (Array.isArray(input.channels) && input.channels.length) {
    score += Math.min(2, input.channels.length - 1);
    evidence++;
    signals.push(`${input.channels.length} sales channel(s)`);
  }

  // Map the self-selected stage into a fallback rank if we have no other signal.
  if (evidence === 0) {
    const idx = mapSelectedStage(stageSel);
    if (idx != null) {
      signals.push(input.stage ? `You selected "${input.stage}"` : "based on the details provided");
      return { label: STAGE_LABELS[idx], rationale: signalSentence(signals, STAGE_LABELS[idx]), signals };
    }
    return { label: "Early stage", rationale: "Estimated from the limited details provided.", signals: [] };
  }

  // score ranges roughly 0..13 -> 5 buckets
  const idx = score <= 1 ? 0 : score <= 3 ? 1 : score <= 6 ? 2 : score <= 9 ? 3 : 4;
  const label = STAGE_LABELS[idx];
  return { label, rationale: signalSentence(signals, label), signals };
}

function mapSelectedStage(sel) {
  if (/idea|pre-launch/i.test(sel)) return 0;
  if (/early/i.test(sel)) return 1;
  if (/growing/i.test(sel)) return 2;
  if (/established/i.test(sel)) return 3;
  if (/scaling|multi/i.test(sel)) return 4;
  return null;
}

function signalSentence(signals, label) {
  if (!signals.length) return `Assessed as ${label.toLowerCase()} from the details provided.`;
  return `Assessed as ${label.toLowerCase()} from ${signals.join(", ")}.`;
}

const WEIGHTS = {
  digital: 35,
  brand: 15,
  product: 15,
  distribution: 15,
  operations: 10,
  ai: 10,
};

const DIM_LABELS = {
  digital: "Website & Digital Presence",
  brand: "Brand & Identity",
  product: "Product & Offering",
  distribution: "Distribution & Reach",
  operations: "Operations & Scale",
  ai: "AI Readiness",
};

/**
 * Composite Business Health Score. Digital comes from the measured audit when
 * available; the rest come from the qualitative snapshot. Returns the score plus
 * the weighted breakdown so the hero number is fully traceable in the UI.
 */
export function computeHealth(audit, snapshot) {
  const dims = {};
  for (const d of snapshot || []) dims[d.key] = d.score;

  // Wire the digital dimension to the measured audit score when we have one.
  const digital = audit?.available && audit.score != null ? audit.score : dims.digital ?? 45;

  const values = {
    digital,
    brand: dims.brand ?? 50,
    product: dims.product ?? 55,
    distribution: dims.distribution ?? 50,
    operations: dims.operations ?? 55,
    ai: dims.ai ?? 35,
  };

  const useDigital = audit?.available && audit.score != null;
  const breakdown = [];
  let weighted = 0;
  let totalWeight = 0;
  for (const key of Object.keys(WEIGHTS)) {
    if (key === "digital" && !useDigital) continue; // fold digital weight away if unmeasured
    const weight = WEIGHTS[key];
    const score = Math.round(values[key]);
    breakdown.push({
      key,
      label: DIM_LABELS[key],
      score,
      weight,
      measured: key === "digital" && useDigital,
    });
    weighted += score * weight;
    totalWeight += weight;
  }

  const overallScore = Math.max(1, Math.min(99, Math.round(weighted / totalWeight)));
  // Normalize weights to percentages for display.
  for (const b of breakdown) b.weightPct = Math.round((b.weight / totalWeight) * 100);

  return { overallScore, breakdown, digitalScore: useDigital ? audit.score : null };
}
