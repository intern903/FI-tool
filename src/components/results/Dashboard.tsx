import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { AnalyzeResponse } from "@/lib/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ScoreRing } from "./ScoreRing";
import { HealthGrid } from "./HealthGrid";
import { Opportunities } from "./Opportunities";
import { CompetitorBench } from "./CompetitorBench";
import { Roadmap } from "./Roadmap";
import { Recommendations } from "./Recommendations";
import { QuickWins } from "./QuickWins";
import { Revenue } from "./Revenue";
import { ExportBar } from "./ExportBar";
import { EmptyState } from "./EmptyState";

export function Dashboard({
  result,
  onReset,
}: {
  result: AnalyzeResponse;
  onReset: () => void;
}) {
  const { report, context, source } = result;

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6"
    >
      <div className="no-print mb-8 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onReset}>
          <ArrowLeft className="h-4 w-4" />
          New audit
        </Button>
        {source === "heuristic" && (
          <span className="rounded-full bg-sun-100 px-3 py-1 text-xs font-semibold text-sun-900">
            Signal-based audit — AI service was briefly unavailable
          </span>
        )}
      </div>

      {/* Overall score hero */}
      <Card className="mb-12 overflow-hidden">
        <div className="flex flex-col items-center gap-8 p-8 sm:p-10 lg:flex-row lg:gap-12">
          <ScoreRing score={report.overallScore} />
          <div className="text-center lg:text-left">
            <p className="section-label mb-2 flex items-center justify-center gap-1.5 lg:justify-start">
              <Sparkles className="h-3.5 w-3.5 text-sun-500" />
              AI Growth Audit
            </p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              {report.businessName}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-base lg:mx-0">
              {report.summary}
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-16">
        <HealthGrid health={report.health} />

        {!context.hasWebsite && (
          <EmptyState
            title="No website added"
            hint="We audited what we could without it. Add your website URL in a new audit to unlock SEO, speed, and conversion insights."
          />
        )}
        {!context.hasMapsProfile && (
          <EmptyState
            title="No Google Business found"
            hint="No Google Maps profile was provided. Claiming your Google Business Profile is usually the single fastest local growth lever."
          />
        )}

        <QuickWins quickWins={report.quickWins} />
        <Opportunities opportunities={report.opportunities} />
        <CompetitorBench competitors={report.competitors} />
        <Roadmap roadmap={report.roadmap} />
        <Recommendations recommendations={report.recommendations} />
        <Revenue items={report.revenueOpportunities} />

        {context.socialCount === 0 && (
          <EmptyState
            title="No social profiles"
            hint="Add Instagram, Facebook, LinkedIn, YouTube, or X to your next audit for channel-specific recommendations."
          />
        )}

        <section className="pt-2">
          <ExportBar result={result} />
        </section>
      </div>
    </motion.main>
  );
}
