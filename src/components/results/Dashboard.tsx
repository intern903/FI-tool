import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { AnalyzeResponse } from "@/lib/types";
import { Button } from "../ui/button";
import { HealthScore } from "./HealthScore";
import { DigitalAuditSection } from "./DigitalAudit";
import { Snapshot } from "./Snapshot";
import { SwotSection } from "./Swot";
import { GrowthOpportunities } from "./GrowthOpportunities";
import { AiOpportunities } from "./AiOpportunities";
import { RoiCalculator } from "./RoiCalculator";
import { CompetitorBench } from "./CompetitorBench";
import { ExpansionStrategies } from "./ExpansionStrategies";
import { Personas } from "./Personas";
import { RecommendedServices } from "./RecommendedServices";
import { ActionPlan } from "./ActionPlan";
import { ExportBar } from "./ExportBar";
import { EmptyState } from "./EmptyState";

export function Dashboard({ result, onReset }: { result: AnalyzeResponse; onReset: () => void }) {
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

      <HealthScore report={report} />

      <div className="space-y-16">
        <DigitalAuditSection audit={report.audit} />
        <Snapshot snapshot={report.snapshot} />
        <SwotSection swot={report.swot} />
        <GrowthOpportunities items={report.growthOpportunities} />
        <AiOpportunities items={report.aiOpportunities} />
        <RoiCalculator report={report} />
        {report.competitorBenchmark && <CompetitorBench data={report.competitorBenchmark} />}
        <ExpansionStrategies items={report.expansionStrategies} />
        <Personas personas={report.personas} journey={report.journey} />
        <RecommendedServices items={report.recommendedServices} />
        <ActionPlan roadmap={report.roadmap} pitch={report.consultationPitch} />

        {!context.hasWebsite && (
          <EmptyState
            title="No website analyzed"
            hint="This report is based on your description. Add your website URL in a new report to run the full objective audit and sharpen every score."
          />
        )}

        <section className="pt-2">
          <ExportBar result={result} />
        </section>
      </div>
    </motion.main>
  );
}
