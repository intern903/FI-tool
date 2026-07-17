// Collects publicly available, objective signals about a business before the AI
// pass: website metadata + performance timing, and (optional) Google Business
// Profile details. Everything here is measured/scraped so the audit that builds
// on it is deterministic and traceable, not asserted.

const FETCH_TIMEOUT_MS = 9_000;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 SoulfulLabsBot/1.0";

async function fetchTimed(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,*/*", "Accept-Encoding": "gzip, br" },
    });
    const ttfbMs = Date.now() - start; // time to response headers
    const type = res.headers.get("content-type") || "";
    const headers = res.headers;
    if (!res.ok || !/text\/html|application\/xhtml/.test(type)) {
      return { ok: res.ok, status: res.status, html: "", ttfbMs, headers, finalUrl: res.url };
    }
    const text = (await res.text()).slice(0, 2_000_000);
    const totalMs = Date.now() - start;
    return { ok: true, status: res.status, html: text, ttfbMs, totalMs, headers, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

const strip = (s) =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function pick(html, re) {
  const m = html.match(re);
  return m ? strip(m[1]) : undefined;
}

function pickAll(html, re, limit = 8) {
  const out = [];
  for (const m of html.matchAll(re)) {
    const v = strip(m[1]);
    if (v) out.push(v);
    if (out.length >= limit) break;
  }
  return out;
}

const count = (html, re) => (html.match(re) || []).length;

export async function analyzeWebsite(url) {
  const result = { url, reachable: false, https: url.startsWith("https://") };
  try {
    const { ok, status, html, ttfbMs, headers, finalUrl } = await fetchTimed(url);
    result.status = status;
    result.reachable = ok;
    result.ttfbMs = ttfbMs;
    result.finalUrl = finalUrl;
    result.https = (finalUrl || url).startsWith("https://");

    if (headers) {
      result.contentEncoding = headers.get("content-encoding") || "none";
      result.compressed = /gzip|br|deflate/i.test(result.contentEncoding);
      result.hsts = Boolean(headers.get("strict-transport-security"));
      result.server = headers.get("server") || undefined;
    }
    if (!html) return result;

    result.htmlBytes = Buffer.byteLength(html, "utf8");

    // --- SEO / metadata ---
    result.title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    result.metaDescription =
      pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      pick(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    result.ogTitle = pick(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    result.ogImage = Boolean(html.match(/<meta[^>]+property=["']og:image["']/i));
    result.canonical = Boolean(html.match(/<link[^>]+rel=["']canonical["']/i));
    result.h1 = pickAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi, 4);
    result.h1Count = count(html, /<h1\b/gi);
    result.h2 = pickAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi, 8);
    result.hasStructuredData = /application\/ld\+json/i.test(html);
    result.structuredDataCount = count(html, /application\/ld\+json/gi);
    result.hasViewportMeta = /<meta[^>]+name=["']viewport["']/i.test(html);
    result.hasFavicon = /<link[^>]+rel=["'][^"']*icon[^"']*["']/i.test(html);

    // --- Performance-relevant markup ---
    const headHtml = (html.match(/<head[\s\S]*?<\/head>/i) || [""])[0];
    result.blockingScripts = count(headHtml, /<script[^>]+src=(?![^>]*(?:async|defer))[^>]*>/gi);
    result.totalScripts = count(html, /<script[^>]+src=/gi);
    result.stylesheets = count(html, /<link[^>]+rel=["']stylesheet["']/gi);
    const imgTags = html.match(/<img\b[^>]*>/gi) || [];
    result.imageCount = imgTags.length;
    result.imagesMissingAlt = imgTags.filter((t) => !/\balt=["'][^"']*["']/i.test(t)).length;
    result.imagesMissingDims = imgTags.filter(
      (t) => !/\bwidth=/i.test(t) || !/\bheight=/i.test(t)
    ).length;
    result.lazyImages = imgTags.filter((t) => /loading=["']lazy["']/i.test(t)).length;

    // --- Conversion / contact ---
    result.hasWhatsApp = /wa\.me\/|api\.whatsapp\.com|whatsapp:\/\//i.test(html);
    result.hasPhoneLink = /href=["']tel:/i.test(html);
    result.hasEmailLink = /href=["']mailto:/i.test(html);
    result.hasBookingHints = /book (now|online)|reserve|appointment|schedule|add to cart|buy now/i.test(html);

    // --- Social presence ---
    const socialLinks = {};
    for (const [key, re] of Object.entries({
      instagram: /https?:\/\/(?:www\.)?instagram\.com\/[\w.\-/%]+/i,
      facebook: /https?:\/\/(?:www\.)?facebook\.com\/[\w.\-/%]+/i,
      linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/[\w.\-/%]+/i,
      youtube: /https?:\/\/(?:www\.)?youtube\.com\/[\w.\-/%@]+/i,
      x: /https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[\w.\-/%]+/i,
    })) {
      const m = html.match(re);
      if (m) socialLinks[key] = m[0];
    }
    result.socialLinksOnSite = socialLinks;

    const bodyText = strip(html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " "));
    result.approxWordCount = bodyText.split(" ").filter(Boolean).length;
    result.textSample = bodyText.slice(0, 1800);
  } catch (err) {
    result.error = err.name === "AbortError" ? "timeout" : err.message;
  }
  return result;
}

export async function analyzeGbp(url) {
  const result = { url, reachable: false };
  const placeMatch = url.match(/\/maps\/place\/([^/@?]+)/);
  if (placeMatch) result.nameFromUrl = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));

  try {
    const { ok, html } = await fetchTimed(url);
    result.reachable = ok;
    if (html) {
      const title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
      if (title) result.nameFromPage = title.replace(/ - Google Maps.*/i, "").trim();
      const metaDesc =
        pick(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) ||
        pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
      if (metaDesc) {
        result.description = metaDesc.slice(0, 400);
        const rating = metaDesc.match(/(\d[.,]\d)\s*(?:stars?|★|\/\s*5)/i);
        if (rating) result.rating = Number(rating[1].replace(",", "."));
        const reviews = metaDesc.match(/([\d.,]+)\s*(?:reviews?|Rezensionen|avis)/i);
        if (reviews) result.reviewCount = parseInt(reviews[1].replace(/\D/g, ""), 10);
        const category = metaDesc.split("·")[1];
        if (category) result.category = category.trim();
      }
    }
  } catch (err) {
    result.error = err.name === "AbortError" ? "timeout" : err.message;
  }
  return result;
}

export async function collectContext(input, psiPromise) {
  const [website, gbp, psi] = await Promise.all([
    input.websiteUrl ? analyzeWebsite(input.websiteUrl) : Promise.resolve(null),
    input.gbpUrl ? analyzeGbp(input.gbpUrl) : Promise.resolve(null),
    psiPromise ?? Promise.resolve(null),
  ]);

  const businessName =
    gbp?.nameFromPage ||
    gbp?.nameFromUrl ||
    website?.ogTitle ||
    website?.h1?.[0] ||
    (website?.title ? website.title.split(/[|\-–]/)[0].trim() : undefined) ||
    (input.websiteUrl
      ? new URL(input.websiteUrl).hostname.replace(/^www\./, "")
      : "Your business");

  return {
    input,
    website,
    gbp,
    psi,
    businessName,
    summaryForClient: {
      businessName,
      industry: input.industry,
      hasWebsite: Boolean(input.websiteUrl),
      websiteReachable: Boolean(website?.reachable),
      hasBusinessDetails: Boolean(input.businessDetails),
      hasGbp: Boolean(input.gbpUrl),
      challenges: input.challenges ?? [],
    },
  };
}
