import { motion } from "framer-motion";
import { Clock, Gauge, TrendingUp } from "lucide-react";
import type { Opportunity } from "@/lib/types";
import { priority } from "@/lib/palette";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

const IMPACT_ORDER: Opportunity["impact"][] = ["High", "Medium", "Low"];

function ImpactBadge({ impact }: { impact: Opportunity["impact"] }) {
  const p = priority[impact];
  return (
    <Badge style={{ backgroundColor: p.bg, color: p.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
      {impact} Impact
    </Badge>
  );
}

export function Opportunities({ opportunities }: { opportunities: Opportunity[] }) {
  const sorted = [...opportunities].sort(
    (a, b) => IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact)
  );
  return (
    <section>
      <SectionHeading
        label="Growth Opportunities"
        title="Prioritized by impact"
        description="What to tackle, in order, with the expected payoff of each move."
      />
      <div className="space-y-3">
        {sorted.map((o, i) => (
          <motion.div
            key={o.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.26, delay: Math.min(i * 0.04, 0.2), ease: "easeOut" }}
          >
            <Card hover className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-bold text-ink-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-base font-bold text-ink-900">{o.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{o.description}</p>
                </div>
                <ImpactBadge impact={o.impact} />
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 shrink-0 text-ink-300" />
                  <dt className="sr-only">Difficulty</dt>
                  <dd className="text-ink-700">
                    <span className="text-ink-400">Difficulty:</span> {o.difficulty}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 shrink-0 text-ink-300" />
                  <dt className="sr-only">Expected result</dt>
                  <dd className="text-ink-700">{o.expectedResult}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-ink-300" />
                  <dt className="sr-only">Time required</dt>
                  <dd className="text-ink-700">{o.timeRequired}</dd>
                </div>
              </dl>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
