// Best-effort Google PageSpeed Insights (Lighthouse) lookup for real Core Web
// Vitals. The unkeyed endpoint is rate-limited and can be slow, so this is
// strictly optional: it runs in parallel with the rest of collection under a
// tight timeout and, if it doesn't return in time, the audit falls back to the
// deterministic signals we measure ourselves. It never blocks the report.

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const PSI_TIMEOUT_MS = 8_000;

export async function runPsi(url) {
  if (!url) return null;
  // Only run when a key is configured. Unkeyed PSI is slow and rate-limited, and
  // on a time-boxed serverless function that latency risks a gateway timeout;
  // the deterministic audit already stands on our own measured signals.
  const key = process.env.PSI_API_KEY || "";
  if (!key) return null;
  const params = new URLSearchParams({ url, category: "PERFORMANCE", strategy: "MOBILE" });
  params.set("key", key);

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
