# Soulful Labs — Business Possibilities Report

An AI business growth advisor. A visitor shares their website (or a short
description), industry, stage, goals, and current challenges; the AI analyzes
the business and generates a personalized report that explains where they stand,
where they can grow, what AI can automate, which strategic moves make sense, and
which **Soulful Labs** program fits them best — ending in a consultation booking.

## What the report contains

- **Current business understanding** — plain-language summary, inferred **stage**,
  and a **Growth Readiness** score
- **Business snapshot** — 6 dimensions (Brand, Digital, Product, Distribution,
  Operations, AI Readiness) as a radar + scored cards
- **Growth opportunities** — prioritized by impact, with effort, outcome, timeframe
- **AI opportunities** — concrete places AI can automate work in this business
- **Expansion strategies** — honest verdicts on building a brand, expanding
  distribution, manufacturing in-house, and launching new products
- **Recommended Soulful Labs services** — Incubation / Acceleration / AI Tools /
  Projects & Consulting, ranked by fit with a best-fit highlight
- **Next steps** + **Book a Consultation** CTA
- **Export** — real generated PDF (jsPDF), plus Share / Copy Link that encode the
  whole report into the link so it reopens the exact report with no backend storage

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
