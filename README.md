# GrowthLens — AI Business Growth Audit

A premium AI-powered platform that audits a local business and generates a
prioritized growth strategy. Paste a Google Business Profile URL, a website
URL, or both (plus optional social profiles) and get a consultant-grade
audit in 20–40 seconds.

## What it produces

- **Overall score** — animated 0–100 ring
- **Business health** — SEO, Google Maps, Website, Social, Brand, Trust
- **Growth opportunities** — prioritized High / Medium / Low impact, each with
  difficulty, expected result, and time required
- **Competitor benchmark** — chart + table vs. three local competitor archetypes
- **30 / 60 / 90 day roadmap** — expandable task timeline
- **AI recommendations** — why, expected impact, estimated effort
- **Top 5 quick wins** and **revenue opportunities**
- **Export** — Download PDF (print-optimized), Share, Copy Link

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Framer Motion · Recharts ·
Lucide · React Hook Form + Zod · TanStack Query · Express · Gemini API

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
```

Production:

```bash
npm run build    # typecheck + build to dist/
npm start        # Express serves dist/ and the API on PORT
```

## How analysis works

1. Inputs are validated (at least one of Maps URL / website URL required).
2. The server fetches the website and extracts public signals: title, meta,
   headings, structured data, contact CTAs (WhatsApp/tel/mailto), social
   links, image alt coverage, word count.
3. For a Maps URL it extracts the business name, and best-effort rating /
   review count / category from public page metadata.
4. All collected context is sent to Gemini with a strict JSON response
   schema; the structured report renders as the dashboard.
5. If the Gemini API is unavailable, a heuristic signal-based report is
   generated instead and labeled as such in the UI — the product never
   dead-ends on an API hiccup.

## Design notes

- Palette derived from `F6BD60 · F7EDE2 · F5CAC3 · 84A59D · F28482`
  (warm cream surfaces, sage/coral/sun accents).
- Chart series colors (`#0F8A70` teal, `#C97E13` ochre, neutral grays for
  competitor context) are validated for colorblind separation and ≥3:1
  contrast; the benchmark always ships with a data table.
- Typography: Inter Tight (headings) + Inter (body). Animations are
  ≤300 ms ease-out; the hero background is a slow canvas node field with
  gentle mouse repulsion. `prefers-reduced-motion` is respected.
