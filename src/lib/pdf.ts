import type { Report } from "./types";

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
  doc.text(`Growth Readiness: ${report.overallScore}/100`, M, y);
  y += 18;

  text(report.summary, { size: 10, color: MUTED, gap: 2 });
  text(report.stageRationale, { size: 9, color: FAINT, gap: 10 });
  rule();

  // ---- Business Snapshot ----
  sectionTitle("Business Snapshot", "Where you stand today");
  for (const d of report.snapshot) {
    ensure(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    setColor(INK);
    doc.text(d.label, M, y);
    setColor(scoreRGB(d.score));
    doc.text(`${d.score}/100`, PAGE_W - M, y, { align: "right" });
    y += 14;
    text(d.insight, { size: 9, color: MUTED, gap: 7 });
  }
  rule();

  // ---- Growth Opportunities ----
  sectionTitle("Growth Opportunities", "Your biggest levers");
  report.growthOpportunities.forEach((o, i) => {
    ensure(46);
    text(`${String(i + 1).padStart(2, "0")}  ${o.title}`, { size: 11, style: "bold", gap: 2 });
    text(o.description, { size: 9, color: MUTED, gap: 2 });
    text(`Impact: ${o.impact}   ·   Effort: ${o.effort}   ·   ${o.timeframe}`, { size: 9, style: "bold", color: SAGE, gap: 2 });
    text(`Expected outcome: ${o.expectedOutcome}`, { size: 9, color: MUTED, gap: 9 });
  });
  rule();

  // ---- AI Opportunities ----
  sectionTitle("AI Opportunities", "What AI can do for you");
  for (const a of report.aiOpportunities) {
    ensure(30);
    text(`${a.title}  (${a.area})`, { size: 11, style: "bold", gap: 2 });
    text(a.description, { size: 9, color: MUTED, gap: 1 });
    text(`Impact: ${a.impact}`, { size: 9, style: "bold", color: SAGE, gap: 8 });
  }
  rule();

  // ---- Expansion Strategies ----
  sectionTitle("Expansion Strategies", "Should you make these moves?");
  for (const e of report.expansionStrategies) {
    ensure(28);
    text(`${e.question}   →   ${e.recommendation}`, { size: 10.5, style: "bold", gap: 2 });
    text(e.rationale, { size: 9, color: MUTED, gap: 8 });
  }
  rule();

  // ---- Recommended Services ----
  sectionTitle("Recommended Soulful Labs Services", "Which program fits you");
  [...report.recommendedServices]
    .sort((a, b) => b.matchScore - a.matchScore)
    .forEach((s) => {
      ensure(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      setColor(INK);
      doc.text(`${s.service}`, M, y);
      setColor(SAGE);
      doc.text(`${s.fit} · ${s.matchScore}% match`, PAGE_W - M, y, { align: "right" });
      y += 14;
      text(s.why, { size: 9, color: MUTED, gap: 1 });
      text(s.whatYouGet, { size: 9, color: FAINT, gap: 9 });
    });
  rule();

  // ---- Next Steps ----
  sectionTitle("Next Steps", "Your next best moves");
  report.nextSteps.forEach((s, i) => {
    text(`${i + 1}. ${s.title}`, { size: 10.5, style: "bold", gap: 1 });
    text(s.detail, { size: 9, color: MUTED, x: M + 16, gap: 6 });
  });
  y += 4;
  text(report.consultationPitch, { size: 10, style: "bold", color: SAGE, gap: 4 });
  text("Book a consultation at soulfullabs.ai", { size: 9, color: MUTED, gap: 4 });

  // ---- Footer on every page ----
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
