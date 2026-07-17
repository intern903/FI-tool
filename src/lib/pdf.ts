import type { Report } from "./types";
import { formatInr } from "./utils";

// Generates a real, downloadable PDF from the report data using jsPDF's vector
// text API — selectable text, small file, no print dialog. jsPDF is imported
// lazily so it doesn't weigh down the initial page load.

const INK: [number, number, number] = [29, 26, 23];
const MUTED: [number, number, number] = [107, 100, 92];
const FAINT: [number, number, number] = [150, 142, 132];
const SAGE: [number, number, number] = [60, 85, 79];
const LINE: [number, number, number] = [230, 224, 214];

function scoreRGB(score: number): [number, number, number] {
  if (score >= 75) return [15, 138, 112];
  if (score >= 50) return [201, 126, 19];
  return [213, 72, 79];
}

export async function downloadReportPdf(report: Report): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const M = 48;
  const CONTENT_W = PAGE_W - M * 2;
  let y = M;

  const ensure = (space: number) => {
    if (y + space > PAGE_H - M) {
      doc.addPage();
      y = M;
    }
  };
  const setColor = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);

  const text = (
    str: string,
    opts: { size?: number; style?: "normal" | "bold"; color?: [number, number, number]; gap?: number; x?: number } = {}
  ) => {
    const { size = 10, style = "normal", color = INK, gap = 4, x = M } = opts;
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    setColor(color);
    const lines = doc.splitTextToSize(str, CONTENT_W - (x - M));
    for (const line of lines) {
      ensure(size + 2);
      doc.text(line, x, y);
      y += size + 2;
    }
    y += gap;
  };

  const rule = () => {
    ensure(12);
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
    doc.setLineWidth(0.5);
    doc.line(M, y, PAGE_W - M, y);
    y += 12;
  };

  const sectionTitle = (label: string, title: string) => {
    ensure(40);
    y += 6;
    text(label.toUpperCase(), { size: 8, style: "bold", color: FAINT, gap: 2 });
    text(title, { size: 15, style: "bold", color: INK, gap: 8 });
  };

  const scored = (label: string, score: number | null, extra = "") => {
    ensure(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    setColor(INK);
    doc.text(label, M, y);
    if (score != null) {
      setColor(scoreRGB(score));
      doc.text(`${score}/100${extra}`, PAGE_W - M, y, { align: "right" });
    } else {
      setColor(FAINT);
      doc.text(extra || "n/a", PAGE_W - M, y, { align: "right" });
    }
    y += 14;
  };

  // ---- Header ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setColor(SAGE);
  doc.text("SOULFUL LABS — BUSINESS POSSIBILITIES REPORT", M, y);
  doc.setFont("helvetica", "normal");
  setColor(FAINT);
  doc.text(new Date().toLocaleDateString(), PAGE_W - M, y, { align: "right" });
  y += 22;

  text(report.businessName, { size: 24, style: "bold", gap: 4 });
  text(`${report.industry}  ·  ${report.stage}`, { size: 10, style: "bold", color: SAGE, gap: 8 });

  const sc = scoreRGB(report.overallScore);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setColor(sc);
  doc.text(`Business Health Score: ${report.overallScore}/100`, M, y);
  y += 18;
  text(report.summary, { size: 10, color: MUTED, gap: 2 });
  text(report.stageRationale, { size: 9, color: FAINT, gap: 8 });

  // Breakdown
  for (const b of report.healthBreakdown) {
    ensure(13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(MUTED);
    doc.text(`${b.label}${b.measured ? " (measured)" : ""}`, M + 8, y);
    setColor(INK);
    doc.text(`${b.score}/100 · ${b.weightPct}% weight`, PAGE_W - M, y, { align: "right" });
    y += 12;
  }
  y += 4;
  rule();

  // ---- Digital Audit ----
  if (report.audit?.available) {
    sectionTitle("Website & Digital Audit", "Measured evidence");
    const m = report.audit.measured;
    const facts = [
      m.responseMs != null ? `Response ${m.responseMs}ms` : "",
      m.lighthousePerf != null ? `Lighthouse ${m.lighthousePerf}/100` : "",
      m.pageWeightKb != null ? `${m.pageWeightKb}KB` : "",
      m.httpsValid ? "HTTPS secure" : "No HTTPS",
      m.gbpRating != null ? `Google ${m.gbpRating.toFixed(1)}★` : "",
    ].filter(Boolean);
    text(facts.join("   ·   "), { size: 9, style: "bold", color: SAGE, gap: 6 });
    for (const cat of report.audit.categories) {
      scored(cat.label, cat.score);
      const fails = cat.checks.filter((c) => c.status === "fail" || c.status === "warn").slice(0, 3);
      for (const c of fails) text(`• ${c.label}: ${c.evidence}`, { size: 8.5, color: MUTED, x: M + 10, gap: 1 });
      y += 3;
    }
    rule();
  }

  // ---- Snapshot ----
  sectionTitle("Business Snapshot", "Where you stand");
  for (const d of report.snapshot) {
    scored(d.label, d.score);
    text(d.insight, { size: 9, color: MUTED, gap: 6 });
  }
  rule();

  // ---- SWOT ----
  sectionTitle("SWOT & Risk Analysis", "Strengths, gaps, risks");
  const swotBlock = (label: string, items: { point: string; evidence: string }[]) => {
    text(label, { size: 11, style: "bold", color: SAGE, gap: 2 });
    for (const it of items) {
      text(`• ${it.point}`, { size: 9.5, style: "bold", gap: 1 });
      text(`Evidence: ${it.evidence}`, { size: 8.5, color: FAINT, x: M + 12, gap: 3 });
    }
    y += 2;
  };
  swotBlock("Strengths", report.swot.strengths);
  swotBlock("Weaknesses", report.swot.weaknesses);
  swotBlock("Opportunities", report.swot.opportunities);
  swotBlock("Threats", report.swot.threats);
  rule();

  // ---- Growth Opportunities ----
  sectionTitle("Growth Opportunities", "Your biggest levers");
  report.growthOpportunities.forEach((o, i) => {
    ensure(44);
    text(`${String(i + 1).padStart(2, "0")}  ${o.title}`, { size: 11, style: "bold", gap: 2 });
    text(o.description, { size: 9, color: MUTED, gap: 2 });
    text(`Impact: ${o.impact} · Effort: ${o.effort} · ${o.timeframe} — ${o.expectedOutcome}`, { size: 9, style: "bold", color: SAGE, gap: 8 });
  });
  rule();

  // ---- AI Opportunities ----
  const totalHours = report.aiOpportunities.reduce((s, a) => s + (a.hoursSavedPerWeek || 0), 0);
  const totalSave = report.aiOpportunities.reduce((s, a) => s + (a.monthlySavingsInr || 0), 0);
  sectionTitle("AI Opportunity Finder", "What AI can do for you");
  text(`Potential: ~${totalHours} hrs/week saved · ${formatInr(totalSave)}/month · ${formatInr(totalSave * 12)}/year`, { size: 10, style: "bold", color: SAGE, gap: 6 });
  for (const a of report.aiOpportunities) {
    ensure(28);
    text(`${a.title} (${a.area}) — ${a.hoursSavedPerWeek}h/wk, ${formatInr(a.monthlySavingsInr)}/mo`, { size: 10.5, style: "bold", gap: 1 });
    text(a.description, { size: 9, color: MUTED, gap: 6 });
  }
  rule();

  // ---- Competitor Benchmark ----
  if (report.competitorBenchmark) {
    sectionTitle("Competitor Benchmarking", "How you compare");
    text(report.competitorBenchmark.summary, { size: 9, color: MUTED, gap: 6 });
    const you = report.competitorBenchmark.you;
    if (you) text(`You — SEO ${you.seo}, Speed ${you.speed}, Social ${you.social}${you.googleRating != null ? `, Rating ${you.googleRating.toFixed(1)}` : ""}`, { size: 9.5, style: "bold", color: SAGE, gap: 3 });
    const cat = report.competitorBenchmark.category;
    text(`Category avg — SEO ${cat.seo}, Speed ${cat.speed}, Social ${cat.social}, Rating ${cat.googleRating.toFixed(1)}, ${cat.reviews} reviews`, { size: 9, color: MUTED, gap: 3 });
    for (const c of report.competitorBenchmark.competitors) {
      text(`${c.name} — SEO ${c.seo}, Speed ${c.speed}, Social ${c.social}. ${c.note ?? ""}`, { size: 9, color: MUTED, gap: 2 });
    }
    rule();
  }

  // ---- Expansion ----
  sectionTitle("Expansion Strategies", "Should you make these moves?");
  for (const e of report.expansionStrategies) {
    ensure(26);
    text(`${e.question}  →  ${e.recommendation}`, { size: 10.5, style: "bold", gap: 2 });
    text(e.rationale, { size: 9, color: MUTED, gap: 7 });
  }
  rule();

  // ---- Personas & Journey ----
  sectionTitle("Customer Persona & Journey", "Who you serve");
  for (const p of report.personas) {
    text(p.name, { size: 10.5, style: "bold", gap: 1 });
    text(`${p.description} Needs: ${p.needs}. Reach via: ${p.channels}.`, { size: 9, color: MUTED, gap: 5 });
  }
  for (const j of report.journey) text(`${j.stage}: ${j.touchpoint} → ${j.opportunity}`, { size: 9, color: MUTED, gap: 2 });
  rule();

  // ---- Recommended Services ----
  sectionTitle("Recommended Soulful Labs Services", "Which program fits you");
  [...report.recommendedServices]
    .sort((a, b) => b.matchScore - a.matchScore)
    .forEach((s) => {
      ensure(38);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      setColor(INK);
      doc.text(s.service, M, y);
      setColor(SAGE);
      doc.text(`${s.fit} · ${s.matchScore}% match`, PAGE_W - M, y, { align: "right" });
      y += 14;
      text(s.why, { size: 9, color: MUTED, gap: 1 });
      text(s.whatYouGet, { size: 9, color: FAINT, gap: 8 });
    });
  rule();

  // ---- Action Plan ----
  sectionTitle("30 / 60 / 90-Day Action Plan", "Your next three months");
  for (const phase of report.roadmap) {
    text(`${phase.phase} — ${phase.focus}`, { size: 11, style: "bold", color: SAGE, gap: 2 });
    for (const t of phase.tasks) {
      text(`${t.quickWin ? "★ " : "• "}${t.title}  [${t.impact} impact · ${t.effort} effort]`, { size: 9.5, style: "bold", gap: 1 });
      text(t.detail, { size: 9, color: MUTED, x: M + 12, gap: 3 });
    }
    y += 3;
  }
  text(report.consultationPitch, { size: 10, style: "bold", color: SAGE, gap: 3 });
  text("Book a consultation at soulfullabs.ai", { size: 9, color: MUTED, gap: 4 });

  // ---- Footer ----
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(FAINT);
    doc.text("Generated by Soulful Labs — AI business growth advisor", M, PAGE_H - 24);
    doc.text(`${p} / ${pages}`, PAGE_W - M, PAGE_H - 24, { align: "right" });
  }

  const safeName = report.businessName.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "business";
  doc.save(`SoulfulLabs-${safeName}-report.pdf`);
}
