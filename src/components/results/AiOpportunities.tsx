import { motion } from "framer-motion";
import { Clock, IndianRupee, Sparkles } from "lucide-react";
import type { AiOpportunity } from "@/lib/types";
import { priority } from "@/lib/palette";
import { formatInr } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { CountUp } from "../CountUp";
import { SectionHeading } from "../SectionHeading";

export function AiOpportunities({ items }: { items: AiOpportunity[] }) {
  const totalHours = items.reduce((s, a) => s + (a.hoursSavedPerWeek || 0), 0);
  const totalSavings = items.reduce((s, a) => s + (a.monthlySavingsInr || 0), 0);

  return (
    <section>
      <SectionHeading
        label="AI Opportunity Finder"
        title="What AI can do for you"
        description="Concrete automations with estimated time and cost savings for a business your size."
      />

      <Card className="mb-4 overflow-hidden bg-gradient-to-br from-sage-100/70 to-white p-6">
        <div className="flex flex-wrap items-center justify-around gap-6 text-center">
          <div>
            <p className="font-display text-3xl font-extrabold tabular-nums text-sage-700">
              ~<CountUp value={totalHours} /> hrs
            </p>
            <p className="mt-1 text-xs font-medium text-ink-400">saved per week</p>
          </div>
          <div className="hidden h-10 w-px bg-ink-900/10 sm:block" />
          <div>
            <p className="font-display text-3xl font-extrabold tabular-nums text-sage-700">
              {formatInr(totalSavings)}
            </p>
            <p className="mt-1 text-xs font-medium text-ink-400">estimated saved / month</p>
          </div>
          <div className="hidden h-10 w-px bg-ink-900/10 sm:block" />
          <div>
            <p className="font-display text-3xl font-extrabold tabular-nums text-sage-700">
              {formatInr(totalSavings * 12)}
            </p>
            <p className="mt-1 text-xs font-medium text-ink-400">projected / year</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => {
          const p = priority[a.impact];
          return (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.28, delay: Math.min(i * 0.05, 0.2), ease: "easeOut" }}
            >
              <Card hover className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-100">
                    <Sparkles className="h-5 w-5 text-sage-700" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">{a.area}</span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink-900">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{a.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                    <Clock className="h-3 w-3" /> {a.hoursSavedPerWeek}h/wk
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
                    <IndianRupee className="h-3 w-3" /> {formatInr(a.monthlySavingsInr).replace("₹", "")}/mo
                  </span>
                  <Badge style={{ backgroundColor: p.bg, color: p.text }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
                    {a.impact}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
