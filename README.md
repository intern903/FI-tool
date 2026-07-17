# Soulful Labs — Business Possibilities Report

An AI business growth advisor. A visitor shares their website (or a short
description), industry, stage, goals, and current challenges; the AI analyzes
the business and generates a personalized report that explains where they stand,
where they can grow, what AI can automate, which strategic moves make sense, and
which **Soulful Labs** program fits them best — ending in a consultation booking.

## What the report contains

- **Website & Digital Audit** — the deterministic, scrapeable backbone: measured
  server response, HTTPS, compression, render-blocking resources, SEO metadata,
  structured data, mobile, social, and (optional) Google Business Profile — every
  check states its actual measured evidence. Real Core Web Vitals are pulled from
  Google Lighthouse when PageSpeed Insights responds in time.
- **Business Health Score** — a composite hero number **wired to the audit
  signals**, shown with its weighted category breakdown so it's defensible, not
  asserted.
- **Business snapshot** — 6 dimensions (Brand, Digital, Product, Distribution,
  Operations, AI Readiness) as a radar; the Digital dimension is the measured
  audit score.
- **SWOT & risk analysis** — every point cites a concrete audit finding.
- **Growth opportunities** — prioritized by impact, with effort, outcome, timeframe.
- **AI Opportunity Finder** — automations quantified with estimated **hours saved
  per week and ₹/month**, plus a totals banner.
- **ROI calculator** — three inputs project extra revenue + AI savings; the uplift
  is derived from the audit gap. Email-gated as an unlock moment.
- **Competitor benchmarking (v1)** — your measured signals vs. category averages
  and 2–3 named competitors (chart + table).
- **Expansion strategies** — honest verdicts on building a brand, expanding
  distribution, manufacturing in-house, and launching new products.
- **Customer persona & journey** — target personas and per-stage opportunities.
- **Recommended Soulful Labs services** — Incubation / Acceleration / AI Tools /
  Projects & Consulting, ranked by fit with a best-fit highlight.
- **30/60/90-Day Action Plan** — prioritized tasks with impact + effort tags and
  quick-win flags, ending in a **Book a Consultation** CTA.
- **Export** — real generated PDF (jsPDF), plus Share / Copy Link that encode the
  whole report into the link so it reopens the exact report with no backend storage.

## How the numbers stay traceable

Scores are **not** invented by the LLM. `server/collect.mjs` measures/scrapes
objective signals; `server/audit.mjs` turns them into pass/warn/fail checks and
category scores; `server/compose.mjs` computes the composite Business Health Score
and detects business stage from cheap heuristics (revenue band, team size, store
count, channel mix). The model receives all this measured evidence and is
instructed to ground its qualitative analysis in it — the hero number and the
audit are computed server-side and injected, never asserted by the AI.

> Note: the audit reads server-rendered HTML, so JavaScript-only single-page apps
> can surface low SEO/content scores (a crawler sees the same empty shell). This is
> honest and traceable; the optional Lighthouse pass renders JS for a truer
> performance score when PageSpeed Insights is reachable. Set `PSI_API_KEY` to make
> the Lighthouse pass reliable.

## The four Soulful Labs programs

| Program | Stage | For |
|---|---|---|
| **Incubation** | 0 → 1 | Idea-stage / pre-launch founders building a foundation |
| **Acceleration** | 1 → 10 | Businesses with traction ready to scale |
| **AI Tools** | Automate | Any business losing time to manual, repetitive work |
| **Projects & Consulting** | Custom | Teams with a defined build or strategy need |

Program names and copy live in `src/lib/constants.ts` — adjust `SERVICES` and
`CONSULTATION_URL` to match Soulful Labs' exact offerings.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Framer Motion · Recharts ·
Lucide · React Hook Form + Zod · TanStack Query · jsPDF · Express · Gemini API

## Setup

```bash
npm install
cp .env.example .env   # then set GEMINI_API_KEY
```

`.env`:

```
GEMINI_API_KEY=<your key>          # server-side only, never sent to the browser
GEMINI_MODEL=gemini-flash-latest   # optional override
PORT=8787                          # optional
```

## Run

```bash
npm run dev      # Vite (5173) + API server (8787), /api proxied
npm run build    # typecheck + build to dist/
npm start        # Express serves dist/ and the API on PORT
```

## Deploying to Vercel

Vercel serves the built frontend from `dist/` and runs the backend as a
serverless function at `api/analyze.js` (the Express server is local-dev only);
both share `server/analyze.mjs`.

1. Import the repo in Vercel (framework preset: **Vite**).
2. Add environment variable **`GEMINI_API_KEY`** for Production (and Preview).
3. Deploy. `vercel.json` sets the function `maxDuration` to 60s because the
   Gemini call takes 20–40s (over Vercel's 10s default).

If Gemini is rate-limited or overloaded, the backend automatically tries a chain
of models before falling back to a heuristic report, so a busy model doesn't take
the whole report down.

## How analysis works

1. Inputs are validated (website URL **or** a business description required).
2. The server fetches the website and extracts public signals (title, meta,
   headings, structured data, contact hints, social links, word count).
3. The website signals plus the owner's industry / stage / goal / challenges are
   sent to Gemini with a strict JSON response schema.
4. The structured report renders as the dashboard; a heuristic fallback covers
   any AI outage.
