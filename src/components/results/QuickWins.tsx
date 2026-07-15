import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { QuickWin } from "@/lib/types";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

export function QuickWins({ quickWins }: { quickWins: QuickWin[] }) {
  return (
    <section>
      <SectionHeading
        label="Quick Wins"
        title="Top 5 actions for this week"
        description="Highest leverage relative to effort — start here."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickWins.slice(0, 5).map((w, i) => (
          <motion.div
            key={w.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.28, delay: Math.min(i * 0.05, 0.2), ease: "easeOut" }}
            className={i === 0 ? "sm:col-span-2 lg:col-span-1" : undefined}
          >
            <Card hover className="relative h-full overflow-hidden p-6">
              <span className="absolute right-4 top-4 font-display text-5xl font-extrabold text-cream-100">
                {i + 1}
              </span>
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-coral-100">
                <Zap className="h-5 w-5 text-coral-700" />
              </span>
              <h3 className="relative font-display text-lg font-bold text-ink-900">{w.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{w.description}</p>
              <p className="relative mt-3 text-sm font-semibold text-sage-900">
                → {w.expectedResult}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
