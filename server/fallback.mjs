// Heuristic report generator used when the Gemini API is unreachable, so the
// product still returns a useful (clearly signal-driven) audit instead of an error.

const clamp = (n, lo = 5, hi = 98) => Math.max(lo, Math.min(hi, Math.round(n)));

export function fallbackReport(context) {
  const { website, maps, socials, businessName, input } = context;

  const seo = clamp(
    30 +
      (website?.title ? 12 : 0) +
      (website?.metaDescription ? 14 : 0) +
      (website?.h1?.length ? 8 : 0) +
      (website?.hasStructuredData ? 12 : 0) +
      (website?.https ? 8 : 0) -
      (website ? Math.min(15, (website.imagesMissingAlt || 0) * 2) : 10)
  );
  const mapsScore = clamp(
    (input.googleMapsUrl ? 45 : 15) +
      (maps?.reachable ? 10 : 0) +
      (maps?.rating ? Number(maps.rating) * 6 : 8) +
      (maps?.reviewCount ? Math.min(15, String(maps.reviewCount).length * 4) : 0)
  );
  const websiteScore = clamp(
    (input.websiteUrl ? 35 : 10) +
      (website?.reachable ? 15 : 0) +
      (website?.hasViewportMeta ? 12 : 0) +
      (website?.https ? 10 : 0) +
      ((website?.approxWordCount || 0) > 300 ? 10 : 3) +
      (website?.hasBookingHints || website?.hasWhatsApp ? 8 : 0)
  );
  const socialCount =
    Object.keys(socials).length + Object.keys(website?.socialLinksOnSite || {}).length;
  const socialScore = clamp(18 + Math.min(5, socialCount) * 13);
  const brandScore = clamp(
    35 + (website?.ogTitle ? 12 : 0) + (website?.ogDescription ? 10 : 0) + (maps?.category ? 8 : 0) + (website?.h1?.length ? 8 : 0)
  );
  const trustScore = clamp(
    28 +
      (website?.https ? 14 : 0) +
      (maps?.rating ? Number(maps.rating) * 7 : 6) +
      (website?.hasPhoneLink ? 8 : 0) +
      (website?.hasEmailLink ? 6 : 0) +
      (website?.hasStructuredData ? 6 : 0)
  );

  const health = [
    { key: "seo", label: "SEO", score: seo, insight: website?.metaDescription ? "Core metadata is present; depth and structure can still improve." : "Key on-page metadata is missing, limiting search visibility." },
    { key: "maps", label: "Google Maps", score: mapsScore, insight: input.googleMapsUrl ? "Profile exists — review velocity and photo freshness decide local rank." : "No Google Business Profile was provided; this is the top local growth lever." },
    { key: "website", label: "Website", score: websiteScore, insight: input.websiteUrl ? (website?.hasViewportMeta ? "Site is mobile-ready; conversion paths can be sharpened." : "Site lacks mobile viewport configuration — mobile visitors likely bounce.") : "No website provided; a fast landing page would capture search demand." },
    { key: "social", label: "Social", score: socialScore, insight: socialCount ? "Some social presence detected; consistency and posting cadence matter next." : "No social profiles detected — an untapped discovery channel." },
    { key: "brand", label: "Brand", score: brandScore, insight: website?.ogTitle ? "Brand metadata renders well when shared; keep messaging consistent." : "Brand story and share previews are underdeveloped." },
    { key: "trust", label: "Trust", score: trustScore, insight: website?.https ? "Secure site helps; more reviews and proof points would lift conversion." : "Trust signals (HTTPS, reviews, contact options) need reinforcement." },
  ];

  const overallScore = clamp(
    health.reduce((s, h) => s + h.score, 0) / health.length,
    10,
    96
  );

  const opp = (title, description, impact, difficulty, expectedResult, timeRequired) => ({
    title, description, impact, difficulty, expectedResult, timeRequired,
  });

  const opportunities = [
    !input.googleMapsUrl &&
      opp("Claim and complete your Google Business Profile", "You appear to have no active Google Business Profile. Claiming it puts you on the local map pack where most 'near me' purchases start.", "High", "Easy", "Visibility in local search within 1-2 weeks", "2-3 hours"),
    maps &&
      opp("Build a steady review engine", "Systematically ask happy customers for Google reviews (QR code at checkout, follow-up message). Rating and recency are the strongest local ranking signals.", "High", "Easy", "+0.2-0.4 rating and 2-3x review velocity in 60 days", "1-2 hours setup"),
    website && !website.metaDescription &&
      opp("Fix missing SEO metadata", "Your homepage is missing a meta description. Titles and descriptions are your ad copy in search results.", "High", "Easy", "Higher click-through from existing rankings", "1-2 hours"),
    website && !website.hasWhatsApp &&
      opp("Add a WhatsApp / instant-contact CTA", "No low-friction contact channel was detected. A WhatsApp button converts mobile visitors who won't fill out forms.", "High", "Easy", "+10-20% more inbound conversations", "1 hour"),
    website && !website.hasViewportMeta &&
      opp("Make the site mobile-first", "The site lacks responsive configuration. Most local searches happen on phones.", "High", "Moderate", "Lower bounce rate, better mobile rankings", "1 week"),
    opp("Publish location + service landing pages", "Dedicated pages for each core service capture long-tail searches your homepage can't.", "Medium", "Moderate", "New organic entrances within 6-8 weeks", "2-3 weeks"),
    socialCount < 2 &&
      opp("Activate one social channel properly", "Rather than being thin everywhere, pick the channel your customers actually use and post consistently.", "Medium", "Moderate", "Steady discovery traffic and social proof", "2 hours/week"),
    website && (website.imagesMissingAlt || 0) > 3 &&
      opp("Add alt text to images", `${website.imagesMissingAlt} images are missing alt text — an easy accessibility and image-SEO win.`, "Low", "Easy", "Improved image search visibility", "1-2 hours"),
    opp("Set up conversion tracking", "Without analytics on calls, forms and direction requests you can't tell which channel pays.", "Low", "Moderate", "Clear ROI picture for every next step", "Half a day"),
  ].filter(Boolean);

  const baseRating = maps?.rating ? Number(maps.rating) : 4.2;
  const baseReviews = maps?.reviewCount ? parseInt(String(maps.reviewCount).replace(/\D/g, ""), 10) || 40 : 38;
  const competitors = [
    { name: "You", isYou: true, googleRating: baseRating, reviews: baseReviews, seo, speed: websiteScore, social: socialScore, content: clamp(seo - 8), trust: trustScore },
    { name: "Competitor A", isYou: false, googleRating: 4.6, reviews: Math.round(baseReviews * 2.4) + 40, seo: clamp(seo + 18), speed: 74, social: clamp(socialScore + 24), content: 70, trust: clamp(trustScore + 12) },
    { name: "Competitor B", isYou: false, googleRating: 4.3, reviews: Math.round(baseReviews * 1.5) + 15, seo: clamp(seo + 8), speed: 66, social: clamp(socialScore + 10), content: 58, trust: clamp(trustScore + 5) },
    { name: "Competitor C", isYou: false, googleRating: 3.9, reviews: Math.max(12, Math.round(baseReviews * 0.7)), seo: clamp(seo - 6), speed: 58, social: clamp(socialScore - 5), content: 44, trust: clamp(trustScore - 8) },
  ];

  const roadmap = [
    {
      phase: "30 Days",
      focus: "Foundation: get found and get contactable",
      tasks: [
        { title: "Complete Google Business Profile", detail: "Categories, hours, services, 15+ quality photos, and a keyword-aware description." },
        { title: "Fix on-page SEO basics", detail: "Unique titles and meta descriptions, one clear H1 per page, image alt text." },
        { title: "Add instant contact CTAs", detail: "WhatsApp/call buttons visible on every page, especially on mobile." },
        { title: "Launch the review ask", detail: "QR code in-store plus a post-purchase message with a direct review link." },
      ],
    },
    {
      phase: "60 Days",
      focus: "Momentum: content and conversion",
      tasks: [
        { title: "Ship 3-4 service landing pages", detail: "One page per core service with local keywords, proof and a single CTA." },
        { title: "Weekly GBP posts and photos", detail: "Keep the profile visibly alive — freshness feeds the local algorithm." },
        { title: "Activate the primary social channel", detail: "2-3 posts weekly: work showcases, reviews, behind-the-scenes." },
        { title: "Install analytics and call tracking", detail: "Measure calls, direction requests, and form fills per channel." },
      ],
    },
    {
      phase: "90 Days",
      focus: "Scale: authority and repeatable revenue",
      tasks: [
        { title: "Earn 5-10 local citations/backlinks", detail: "Directories, chamber of commerce, local partners and suppliers." },
        { title: "Launch a referral or repeat offer", detail: "Turn the existing customer base into a predictable revenue channel." },
        { title: "Publish comparison/FAQ content", detail: "Answer the questions customers ask before buying — capture that intent." },
        { title: "Review and reprioritize", detail: "Double down on the two channels showing the best cost per lead." },
      ],
    },
  ];

  const recommendations = [
    { title: "Own the local map pack", why: "Most high-intent local customers choose from the top 3 Google Maps results without scrolling.", expectedImpact: "High — primary demand source", estimatedEffort: "Low, ongoing", details: "Complete every profile field, add photos weekly, answer every review within 48 hours, and keep hours accurate. Consistency over 8-12 weeks moves map rankings more than any one-off change." },
    { title: "Turn reviews into a system, not luck", why: `${baseReviews} reviews is a start, but velocity beats volume: recent reviews signal an active, trusted business.`, expectedImpact: "High — conversion and ranking", estimatedEffort: "Low", details: "Automate the ask at the moment of peak satisfaction. A simple QR card plus a follow-up message doubles review velocity for most local businesses." },
    { title: "Reduce friction to first contact", why: "Every extra step between interest and conversation loses roughly a third of mobile visitors.", expectedImpact: "Medium-High — direct revenue", estimatedEffort: "Low", details: "Add WhatsApp and tap-to-call above the fold, prefill message templates, and respond within business hours with an auto-acknowledgement." },
    { title: "Build service pages before blog posts", why: "Commercial-intent pages convert; blog traffic without intent doesn't pay the bills.", expectedImpact: "Medium — compounding organic growth", estimatedEffort: "Medium", details: "One page per service and per neighborhood you serve. Structure: problem, proof, process, price anchor, single CTA." },
  ];

  const quickWins = [
    { title: "Add a direct review link QR code", description: "Print it at the counter and add it to receipts or follow-ups.", expectedResult: "2-3x review velocity" },
    { title: "Write a compelling meta description", description: "60-155 characters selling the click for your homepage.", expectedResult: "Higher CTR from search" },
    { title: "Upload 10 fresh photos to Google", description: "Real work, real team, real space — phones are fine.", expectedResult: "More profile views and direction requests" },
    { title: "Add WhatsApp click-to-chat", description: "One line of HTML with a prefilled greeting message.", expectedResult: "More mobile inquiries this week" },
    { title: "Answer every existing review", description: "Reply to all reviews, especially critical ones, professionally.", expectedResult: "Visible trust for every future visitor" },
  ];

  const revenueOpportunities = [
    { title: "Improve Google reviews", description: "Ratings above 4.5 with recent activity win the comparison shoppers make between map results.", potential: "+15-25% more calls from Maps" },
    { title: "Add WhatsApp CTA", description: "Capture mobile visitors who will never fill a contact form.", potential: "+10-20% inbound conversations" },
    { title: "Optimize GBP photos", description: "Profiles with 100+ photos get dramatically more direction requests and clicks.", potential: "+35% profile engagement" },
    { title: "Fix technical SEO", description: "Metadata, structured data and mobile performance unlock rankings you already deserve.", potential: "+20-40% organic traffic in a quarter" },
    { title: "Create service landing pages", description: "Capture long-tail, high-intent searches with dedicated pages.", potential: "New qualified leads every month" },
    { title: "Improve conversion paths", description: "Clear CTAs, proof and fast pages turn existing traffic into revenue without more spend.", potential: "+10-15% conversion rate" },
  ];

  return {
    businessName,
    summary: `${businessName} has a workable foundation with clear, addressable gaps. The fastest gains are in local search presence and reducing friction to contact — both achievable within 30 days, before compounding content and authority work in the following two months.`,
    overallScore,
    health,
    opportunities,
    competitors,
    roadmap,
    recommendations,
    quickWins,
    revenueOpportunities,
  };
}
