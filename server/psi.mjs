// Best-effort Google PageSpeed Insights (Lighthouse) lookup for real Core Web
// Vitals. The unkeyed endpoint is rate-limited and can be slow, so this is
// strictly optional: it runs in parallel with the rest of collection under a
// tight timeout and, if it doesn't return in time, the audit falls back to the
// deterministic signals we measure ourselves. It never blocks the report.

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const PSI_TIMEOUT_MS = 14_000;

export async function runPsi(url) {
  if (!url) return null;
  const params = new URLSearchParams({ url, category: "PERFORMANCE", strategy: "MOBILE" });
  // A PSI/Google API key is optional; reuse one if present, otherwise go unkeyed.
  const key = process.env.PSI_API_KEY || "";
  if (key) params.set("key", key);

  try {
    const res = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
      signal: AbortSignal.timeout(PSI_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const lh = data?.lighthouseResult;
    const audits = lh?.audits || {};
    const perf = lh?.categories?.performance?.score;
    const num = (a) => (typeof a?.numericValue === "number" ? a.numericValue : undefined);
    return {
      performanceScore: typeof perf === "number" ? Math.round(perf * 100) : undefined,
      lcpMs: num(audits["largest-contentful-paint"]),
      cls: num(audits["cumulative-layout-shift"]),
      tbtMs: num(audits["total-blocking-time"]),
      fcpMs: num(audits["first-contentful-paint"]),
    };
  } catch {
    return null; // timeout, rate-limit, or network error — degrade gracefully
  }
}
