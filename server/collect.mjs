// Collects publicly available context about the business before the AI pass:
// website metadata, best-effort Google Maps details, and provided socials.

const FETCH_TIMEOUT_MS = 10_000;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 GrowthLensBot/1.0";

async function fetchHtml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
    });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !/text\/html|application\/xhtml/.test(type)) {
      return { ok: res.ok, status: res.status, html: "" };
    }
    // Cap at ~1.5MB to keep parsing cheap.
    const text = (await res.text()).slice(0, 1_500_000);
    return { ok: true, status: res.status, html: text };
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

function pickAll(html, re, limit = 6) {
  const out = [];
  for (const m of html.matchAll(re)) {
    const v = strip(m[1]);
    if (v) out.push(v);
    if (out.length >= limit) break;
  }
  return out;
}

export async function analyzeWebsite(url) {
  const result = {
    url,
    reachable: false,
    https: url.startsWith("https://"),
  };
  try {
    const { ok, status, html } = await fetchHtml(url);
    result.status = status;
    result.reachable = ok;
    if (!html) return result;

    result.title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    result.metaDescription =
      pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      pick(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    result.ogTitle = pick(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i);
    result.ogDescription = pick(
      html,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i
    );
    result.h1 = pickAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi, 3);
    result.h2 = pickAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi, 8);
    result.hasViewportMeta = /<meta[^>]+name=["']viewport["']/i.test(html);
    result.hasStructuredData = /application\/ld\+json/i.test(html);
    result.hasWhatsApp = /wa\.me\/|api\.whatsapp\.com|whatsapp:\/\//i.test(html);
    result.hasPhoneLink = /href=["']tel:/i.test(html);
    result.hasEmailLink = /href=["']mailto:/i.test(html);
    result.hasBookingHints = /book (now|online)|reserve|appointment|schedule/i.test(html);

    const imgTags = html.match(/<img\b[^>]*>/gi) || [];
    result.imageCount = imgTags.length;
    result.imagesMissingAlt = imgTags.filter((t) => !/\balt=["'][^"']+["']/i.test(t)).length;

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

export async function analyzeMapsUrl(url) {
  const result = { url, reachable: false };

  // Business name is often embedded in the URL path: /maps/place/<Name>/...
  const placeMatch = url.match(/\/maps\/place\/([^/@?]+)/);
  if (placeMatch) {
    result.nameFromUrl = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
  }

  try {
    const { ok, html } = await fetchHtml(url);
    result.reachable = ok;
    if (html) {
      const title = pick(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
      if (title && !/google maps/i.test(title.replace(/ - Google Maps.*/i, ""))) {
        result.nameFromPage = title.replace(/ - Google Maps.*/i, "").trim();
      }
      const metaDesc = pick(
        html,
        /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i
      ) || pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
      if (metaDesc) {
        result.description = metaDesc.slice(0, 400);
        // Meta description often looks like "★★★★☆ · Restaurant · 12 Main St"
        const rating = metaDesc.match(/(\d[.,]\d)\s*(?:stars?|★|\/\s*5)/i);
        if (rating) result.rating = rating[1].replace(",", ".");
        const reviews = metaDesc.match(/([\d.,]+)\s*(?:reviews?|Rezensionen|avis)/i);
        if (reviews) result.reviewCount = reviews[1];
        const category = metaDesc.split("·")[1];
        if (category) result.category = category.trim();
      }
    }
  } catch (err) {
    result.error = err.name === "AbortError" ? "timeout" : err.message;
  }
  return result;
}

export async function collectContext(input) {
  const website = input.websiteUrl ? await analyzeWebsite(input.websiteUrl) : null;

  const businessName =
    website?.ogTitle ||
    website?.h1?.[0] ||
    (website?.title ? website.title.split(/[|\-–]/)[0].trim() : undefined) ||
    (input.websiteUrl
      ? new URL(input.websiteUrl).hostname.replace(/^www\./, "")
      : "Your business");

  return {
    input,
    website,
    businessName,
    summaryForClient: {
      businessName,
      industry: input.industry,
      hasWebsite: Boolean(input.websiteUrl),
      websiteReachable: Boolean(website?.reachable),
      hasBusinessDetails: Boolean(input.businessDetails),
      challenges: input.challenges ?? [],
    },
  };
}
