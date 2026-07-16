import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { AnalyzeResponse } from "@/lib/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ScoreRing } from "./ScoreRing";
import { Snapshot } from "./Snapshot";
import { GrowthOpportunities } from "./GrowthOpportunities";
import { AiOpportunities } from "./AiOpportunities";
import { ExpansionStrategies } from "./ExpansionStrategies";
import { RecommendedServices } from "./RecommendedServices";
import { NextSteps } from "./NextSteps";
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
          New report
        </Button>
        {source === "heuristic" && (
          <span className="rounded-full bg-sun-100 px-3 py-1 text-xs font-semibold text-sun-900">
            Signal-based report — AI service was briefly unavailable
          </span>
        )}
      </div>

      {/* Current business understanding */}
      <Card className="mb-12 overflow-hidden">
        <div className="flex flex-col items-center gap-8 p-8 sm:p-10 lg:flex-row lg:gap-12">
          <div className="flex flex-col items-center">
            <ScoreRing score={report.overallScore} />
            <span className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Growth readiness
            </span>
          </div>
          <div className="text-center lg:text-left">
            <p className="section-label mb-2 flex items-center justify-center gap-1.5 lg:justify-start">
              <Sparkles className="h-3.5 w-3.5 text-sun-500" />
              Business Possibilities Report
            </p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              {report.businessName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-ink-700">
                {report.industry}
              </span>
              <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-900">
                {report.stage}
              </span>
            </div>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-500 sm:text-base lg:mx-0">
              {report.summary}
            </p>
            <p className="mx-auto mt-2 max-w-xl text-xs text-ink-400 lg:mx-0">{report.stageRationale}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-16">
        <Snapshot snapshot={report.snapshot} />

        {!context.hasWebsite && (
          <EmptyState
            title="No website analyzed"
            hint="We built this from the details you shared. Add your website URL in a new report for deeper, signal-based insights."
          />
        )}

        <GrowthOpportunities items={report.growthOpportunities} />
        <AiOpportunities items={report.aiOpportunities} />
        <ExpansionStrategies items={report.expansionStrategies} />
        <RecommendedServices items={report.recommendedServices} />
        <NextSteps steps={report.nextSteps} pitch={report.consultationPitch} />

        <section className="pt-2">
          <ExportBar result={result} />
        </section>
      </div>
    </motion.main>
  );
}
