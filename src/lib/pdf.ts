import type { Report } from "./types";

// Generates a real, downloadable PDF from the report data using jsPDF's vector
// text API — selectable text, small file, no print dialog. jsPDF is imported
// lazily so it doesn't weigh down the initial page load.

type Doc = import("jspdf").jsPDF;

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
  doc.text("GROWTHLENS — AI GROWTH AUDIT", M, y);
  doc.setFont("helvetica", "normal");
  setColor(FAINT);
  doc.text(new Date().toLocaleDateString(), PAGE_W - M, y, { align: "right" });
  y += 22;

  text(report.businessName, { size: 24, style: "bold", gap: 6 });

  // Overall score chip
  const sc = scoreRGB(report.overallScore);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setColor(sc);
  doc.text(`Overall Growth Score: ${report.overallScore}/100`, M, y);
  y += 20;

  text(report.summary, { size: 10, color: MUTED, gap: 10 });
  rule();

  // ---- Business Health ----
  sectionTitle("Business Health", "Where you stand today");
  for (const h of report.health) {
    ensure(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    setColor(INK);
    doc.text(h.label, M, y);
    const hc = scoreRGB(h.score);
    setColor(hc);
    doc.text(`${h.score}/100`, PAGE_W - M, y, { align: "right" });
    y += 14;
    text(h.insight, { size: 9, color: MUTED, gap: 8 });
  }
  rule();

  // ---- Quick Wins ----
  sectionTitle("Quick Wins", "Top actions for this week");
  report.quickWins.slice(0, 5).forEach((w, i) => {
    text(`${i + 1}. ${w.title}`, { size: 11, style: "bold", gap: 2 });
    text(w.description, { size: 9, color: MUTED, gap: 2 });
    text(`Expected result: ${w.expectedResult}`, { size: 9, color: SAGE, gap: 8 });
  });
  rule();

  // ---- Growth Opportunities ----
  sectionTitle("Growth Opportunities", "Prioritized by impact");
  report.opportunities.forEach((o, i) => {
    ensure(48);
    text(`${String(i + 1).padStart(2, "0")}  ${o.title}`, { size: 11, style: "bold", gap: 2 });
    text(o.description, { size: 9, color: MUTED, gap: 2 });
    text(
      `Impact: ${o.impact}   ·   Difficulty: ${o.difficulty}   ·   Time: ${o.timeRequired}`,
      { size: 9, style: "bold", color: SAGE, gap: 2 }
    );
    text(`Expected result: ${o.expectedResult}`, { size: 9, color: MUTED, gap: 10 });
  });
  rule();

  // ---- Competitor Benchmark ----
  sectionTitle("Competitor Benchmark", "How you compare");
  const metrics: { key: keyof Report["competitors"][number]; label: string }[] = [
    { key: "googleRating", label: "Google Rating" },
    { key: "reviews", label: "Reviews" },
    { key: "seo", label: "SEO" },
    { key: "speed", label: "Speed" },
    { key: "social", label: "Social" },
    { key: "content", label: "Content" },
    { key: "trust", label: "Trust" },
  ];
  const cols = report.competitors;
  const labelW = 110;
  const colW = (CONTENT_W - labelW) / cols.length;
  ensure(20);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  setColor(FAINT);
  doc.text("Metric", M, y);
  cols.forEach((c, i) => {
    setColor(c.isYou ? SAGE : FAINT);
    doc.text(c.name.slice(0, 14), M + labelW + colW * i + colW / 2, y, { align: "center" });
  });
  y += 12;
  for (const m of metrics) {
    ensure(14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(MUTED);
    doc.text(m.label, M, y);
    cols.forEach((c, i) => {
      const raw = c[m.key] as number;
      const val = m.key === "googleRating" ? raw.toFixed(1) : String(raw);
      doc.setFont("helvetica", c.isYou ? "bold" : "normal");
      setColor(c.isYou ? INK : MUTED);
      doc.text(val, M + labelW + colW * i + colW / 2, y, { align: "center" });
    });
    y += 13;
  }
  y += 8;
  rule();

  // ---- Roadmap ----
  sectionTitle("30 / 60 / 90 Day Roadmap", "Your next three months");
  for (const phase of report.roadmap) {
    text(`${phase.phase} — ${phase.focus}`, { size: 11, style: "bold", gap: 3 });
    for (const t of phase.tasks) {
      text(`•  ${t.title}`, { size: 9.5, style: "bold", color: INK, gap: 1 });
      text(t.detail, { size: 9, color: MUTED, x: M + 14, gap: 4 });
    }
    y += 4;
  }
  rule();

  // ---- Recommendations ----
  sectionTitle("AI Recommendations", "Strategic moves worth making");
  for (const rec of report.recommendations) {
    ensure(46);
    text(rec.title, { size: 11, style: "bold", gap: 2 });
    text(`Why: ${rec.why}`, { size: 9, color: MUTED, gap: 1 });
    text(`Expected impact: ${rec.expectedImpact}   ·   Effort: ${rec.estimatedEffort}`, {
      size: 9,
      style: "bold",
      color: SAGE,
      gap: 1,
    });
    text(rec.details, { size: 9, color: MUTED, gap: 8 });
  }
  rule();

  // ---- Revenue ----
  sectionTitle("Revenue Opportunities", "Where the money is");
  for (const r of report.revenueOpportunities) {
    text(r.title, { size: 11, style: "bold", gap: 2 });
    text(r.description, { size: 9, color: MUTED, gap: 1 });
    text(`Potential: ${r.potential}`, { size: 9, style: "bold", color: SAGE, gap: 8 });
  }

  // ---- Footer on every page ----
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(FAINT);
    doc.text("Generated by GrowthLens — AI growth audits for local businesses", M, PAGE_H - 24);
    doc.text(`${p} / ${pages}`, PAGE_W - M, PAGE_H - 24, { align: "right" });
  }

  const safeName = report.businessName.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "business";
  doc.save(`GrowthLens-${safeName}-audit.pdf`);
}
