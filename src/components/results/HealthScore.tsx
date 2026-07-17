import { motion } from "framer-motion";
import { BadgeCheck, Sparkles } from "lucide-react";
import type { HealthCategory, Report } from "@/lib/types";
import { scoreColor } from "@/lib/palette";
import { Card } from "../ui/card";
import { ScoreRing } from "./ScoreRing";

function BreakdownRow({ item, index }: { item: HealthCategory; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 + index * 0.06, ease: "easeOut" }}
      className="flex items-center gap-3"
    >
      <div className="w-40 shrink-0">
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink-700">
          {item.label}
          {item.measured && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-sage-100 px-1.5 py-0.5 text-[10px] font-semibold text-sage-900">
              <BadgeCheck className="h-2.5 w-2.5" />
              measured
            </span>
          )}
        </span>
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-900/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: scoreColor(item.score) }}
          initial={{ width: 0 }}
          animate={{ width: `${item.score}%` }}
          transition={{ duration: 0.7, delay: 0.25 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-ink-900">
        {item.score}
      </span>
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-ink-400">{item.weightPct}%</span>
    </motion.div>
  );
}

export function HealthScore({ report }: { report: Report }) {
  return (
    <Card className="mb-12 overflow-hidden">
      <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="section-label mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sun-500" />
            Business Possibilities Report
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {report.businessName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-ink-700">
              {report.industry}
            </span>
            <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-900">
              {report.stage}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-500 sm:text-base">{report.summary}</p>
          <p className="mt-2 text-xs text-ink-400">{report.stageRationale}</p>
        </div>

        <div className="flex flex-col items-center gap-6 border-t border-ink-900/[0.06] pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          <div className="flex flex-col items-center">
            <ScoreRing score={report.overallScore} />
            <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Business Health Score
            </span>
          </div>
          <div className="w-full">
            <p className="mb-3 text-xs font-medium text-ink-400">
              How this number is built — weighted category scores
            </p>
            <div className="space-y-2.5">
              {report.healthBreakdown.map((item, i) => (
                <BreakdownRow key={item.key} item={item} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
