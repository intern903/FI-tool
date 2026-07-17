// Deterministic Website & Digital Presence Audit. Turns the scraped/measured
// signals into objective, traceable checks and category scores. Nothing here is
// asserted by an LLM — every check states the actual measured evidence, and the
// composite Business Health Score is built on top of these numbers.

// status: pass | warn | fail | na. Each check contributes weight * factor.
const FACTOR = { pass: 1, warn: 0.5, fail: 0, na: null };

function scoreChecks(checks) {
  let total = 0;
  let earned = 0;
  for (const c of checks) {
    const f = FACTOR[c.status];
    if (f === null) continue; // n/a checks don't count
    total += c.weight;
    earned += c.weight * f;
  }
  if (total === 0) return { score: null, checks };
  return { score: Math.round((earned / total) * 100), checks };
}

const chk = (id, label, status, evidence, weight = 1) => ({ id, label, status, evidence, weight });

function performanceCategory(website, psi) {
  const checks = [];

  if (psi?.performanceScore != null) {
    const s = psi.performanceScore;
    checks.push(
      chk("lighthouse", "Lighthouse performance", s >= 90 ? "pass" : s >= 50 ? "warn" : "fail",
        `Google Lighthouse score ${s}/100 (lab data)`, 3)
    );
    if (psi.lcpMs != null)
      checks.push(chk("lcp", "Largest Contentful Paint", psi.lcpMs <= 2500 ? "pass" : psi.lcpMs <= 4000 ? "warn" : "fail",
        `LCP ${(psi.lcpMs / 1000).toFixed(1)}s`, 2));
    if (psi.cls != null)
      checks.push(chk("cls", "Cumulative Layout Shift", psi.cls <= 0.1 ? "pass" : psi.cls <= 0.25 ? "warn" : "fail",
        `CLS ${psi.cls.toFixed(2)}`, 1));
    if (psi.tbtMs != null)
      checks.push(chk("tbt", "Total Blocking Time", psi.tbtMs <= 200 ? "pass" : psi.tbtMs <= 600 ? "warn" : "fail",
        `TBT ${psi.tbtMs}ms`, 1));
  }

  if (website?.ttfbMs != null)
    checks.push(chk("ttfb", "Server response time", website.ttfbMs <= 600 ? "pass" : website.ttfbMs <= 1500 ? "warn" : "fail",
      `Measured ${website.ttfbMs}ms to first byte`, 2));
  if (website?.compressed != null)
    checks.push(chk("compression", "Text compression", website.compressed ? "pass" : "fail",
      website.compressed ? `Enabled (${website.contentEncoding})` : "No gzip/brotli compression detected", 1));
  if (website?.htmlBytes != null) {
    const kb = Math.round(website.htmlBytes / 1024);
    checks.push(chk("weight", "HTML document weight", kb <= 100 ? "pass" : kb <= 300 ? "warn" : "fail",
      `${kb} KB of HTML`, 1));
  }
  if (website?.blockingScripts != null)
    checks.push(chk("blocking", "Render-blocking scripts", website.blockingScripts <= 2 ? "pass" : website.blockingScripts <= 6 ? "warn" : "fail",
      `${website.blockingScripts} blocking <script> tag(s) in <head>`, 1));
  if (website?.imageCount)
    checks.push(chk("imgdims", "Image dimensions set", website.imagesMissingDims === 0 ? "pass" : website.imagesMissingDims <= website.imageCount / 2 ? "warn" : "fail",
      `${website.imagesMissingDims}/${website.imageCount} images missing width/height (layout-shift risk)`, 1));

  return { key: "performance", label: "Performance", ...scoreChecks(checks) };
}

function securityCategory(website) {
  const checks = [
    chk("https", "HTTPS / SSL", website?.https ? "pass" : "fail",
      website?.https ? "Served securely over HTTPS" : "Site is not served over HTTPS", 3),
    chk("hsts", "HSTS header", website?.hsts ? "pass" : "warn",
      website?.hsts ? "Strict-Transport-Security present" : "No HSTS header", 1),
    chk("reachable", "Site availability", website?.reachable ? "pass" : "fail",
      website?.reachable ? `Responded ${website.status}` : `Unreachable${website?.error ? ` (${website.error})` : ""}`, 2),
  ];
  return { key: "security", label: "Security", ...scoreChecks(checks) };
}

function seoCategory(website) {
  const titleLen = website?.title?.length || 0;
  const descLen = website?.metaDescription?.length || 0;
  const checks = [
    chk("title", "Title tag", titleLen === 0 ? "fail" : titleLen >= 20 && titleLen <= 65 ? "pass" : "warn",
      titleLen ? `"${website.title.slice(0, 60)}" (${titleLen} chars)` : "Missing <title>", 2),
    chk("desc", "Meta description", descLen === 0 ? "fail" : descLen >= 70 && descLen <= 165 ? "pass" : "warn",
      descLen ? `${descLen} characters` : "Missing meta description", 2),
    chk("h1", "Single H1 heading", website?.h1Count === 1 ? "pass" : website?.h1Count ? "warn" : "fail",
      website?.h1Count != null ? `${website.h1Count} H1 tag(s) found` : "No H1 found", 1),
    chk("canonical", "Canonical URL", website?.canonical ? "pass" : "warn",
      website?.canonical ? "Canonical link present" : "No canonical link", 1),
    chk("og", "Open Graph / share preview", website?.ogTitle || website?.ogImage ? "pass" : "warn",
      website?.ogTitle || website?.ogImage ? "Open Graph tags present" : "No Open Graph tags", 1),
    chk("alt", "Image alt text", !website?.imageCount ? "na" : website.imagesMissingAlt === 0 ? "pass" : website.imagesMissingAlt <= website.imageCount / 2 ? "warn" : "fail",
      website?.imageCount ? `${website.imagesMissingAlt}/${website.imageCount} images missing alt text` : "No images", 1),
    chk("content", "Content depth", (website?.approxWordCount || 0) >= 300 ? "pass" : website?.approxWordCount ? "warn" : "fail",
      website?.approxWordCount != null ? `~${website.approxWordCount} words on the homepage` : "No readable content", 1),
  ];
  return { key: "seo", label: "SEO", ...scoreChecks(checks) };
}

function mobileCategory(website) {
  const checks = [
    chk("viewport", "Mobile viewport", website?.hasViewportMeta ? "pass" : "fail",
      website?.hasViewportMeta ? "Responsive viewport meta present" : "No viewport meta — not mobile-optimized", 2),
    chk("lazy", "Lazy-loaded images", !website?.imageCount ? "na" : website.lazyImages > 0 ? "pass" : "warn",
      website?.imageCount ? `${website.lazyImages}/${website.imageCount} images lazy-loaded` : "No images", 1),
    chk("favicon", "Favicon", website?.hasFavicon ? "pass" : "warn",
      website?.hasFavicon ? "Favicon present" : "No favicon", 0.5),
  ];
  return { key: "mobile", label: "Mobile", ...scoreChecks(checks) };
}

function structuredCategory(website) {
  const checks = [
    chk("jsonld", "Structured data (JSON-LD)", website?.hasStructuredData ? "pass" : "fail",
      website?.hasStructuredData ? `${website.structuredDataCount} JSON-LD block(s) found` : "No structured data — misses rich results", 2),
  ];
  return { key: "structured", label: "Structured Data", ...scoreChecks(checks) };
}

function socialCategory(website, input) {
  const onSite = Object.keys(website?.socialLinksOnSite || {});
  const provided = input?.socials ? Object.keys(input.socials) : [];
  const all = new Set([...onSite, ...provided]);
  const n = all.size;
  const checks = [
    chk("presence", "Social profiles linked", n >= 3 ? "pass" : n >= 1 ? "warn" : "fail",
      n ? `${n} channel(s): ${[...all].join(", ")}` : "No social profiles detected on the site", 2),
    chk("contact", "Low-friction contact", website?.hasWhatsApp || website?.hasPhoneLink ? "pass" : "warn",
      website?.hasWhatsApp ? "WhatsApp CTA present" : website?.hasPhoneLink ? "Click-to-call present" : "No instant contact (WhatsApp/call)", 1),
  ];
  return { key: "social", label: "Social Presence", ...scoreChecks(checks) };
}

function gbpCategory(gbp) {
  if (!gbp) {
    return {
      key: "gbp",
      label: "Google Business Profile",
      score: null,
      checks: [chk("gbp-none", "Google Business Profile", "na", "Not connected — add a GBP link to audit it", 1)],
    };
  }
  const checks = [
    chk("gbp-reach", "Profile reachable", gbp.reachable ? "pass" : "warn",
      gbp.reachable ? "Profile page loaded" : "Could not load profile", 1),
    chk("gbp-rating", "Rating", gbp.rating != null ? (gbp.rating >= 4.3 ? "pass" : gbp.rating >= 3.8 ? "warn" : "fail") : "warn",
      gbp.rating != null ? `${gbp.rating.toFixed(1)} / 5` : "Rating not detected", 2),
    chk("gbp-reviews", "Review volume", gbp.reviewCount != null ? (gbp.reviewCount >= 100 ? "pass" : gbp.reviewCount >= 25 ? "warn" : "fail") : "warn",
      gbp.reviewCount != null ? `${gbp.reviewCount} reviews` : "Review count not detected", 2),
    chk("gbp-cat", "Category set", gbp.category ? "pass" : "warn",
      gbp.category ? gbp.category : "Category not detected", 1),
  ];
  return { key: "gbp", label: "Google Business Profile", ...scoreChecks(checks) };
}

export function runAudit(context) {
  const { website, gbp, psi, input } = context;

  if (!website && !gbp) {
    // No website and no GBP — nothing objective to measure.
    return {
      available: false,
      score: null,
      source: "none",
      categories: [],
      measured: {},
      note: "No website or Google Business Profile provided, so this report is based on your description alone.",
    };
  }

  const categories = [];
  if (website) {
    categories.push(performanceCategory(website, psi));
    categories.push(seoCategory(website));
    categories.push(securityCategory(website));
    categories.push(mobileCategory(website));
    categories.push(structuredCategory(website));
    categories.push(socialCategory(website, input));
  }
  categories.push(gbpCategory(gbp));

  const scored = categories.filter((c) => c.score != null);
  const digitalScore = scored.length
    ? Math.round(scored.reduce((s, c) => s + c.score, 0) / scored.length)
    : null;

  const measured = {
    httpsValid: Boolean(website?.https),
    responseMs: website?.ttfbMs,
    pageWeightKb: website?.htmlBytes ? Math.round(website.htmlBytes / 1024) : undefined,
    lighthousePerf: psi?.performanceScore,
    lcpMs: psi?.lcpMs,
    cls: psi?.cls,
    gbpRating: gbp?.rating,
    gbpReviews: gbp?.reviewCount,
  };

  return {
    available: true,
    score: digitalScore,
    source: psi?.performanceScore != null ? "measured+lighthouse" : "measured",
    categories,
    measured,
  };
}
