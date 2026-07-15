import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Lightbulb } from "lucide-react";
import type { Recommendation } from "@/lib/types";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

function RecCard({ rec, index }: { rec: Recommendation; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.05, 0.2), ease: "easeOut" }}
    >
      <Card hover className="flex h-full flex-col p-5">
        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sun-100">
          <Lightbulb className="h-5 w-5 text-sun-700" />
        </span>
        <h3 className="font-display text-base font-bold text-ink-900">{rec.title}</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="font-semibold text-ink-400">Why</dt>
            <dd className="text-ink-700">{rec.why}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-400">Expected impact</dt>
            <dd className="text-ink-700">{rec.expectedImpact}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-400">Estimated effort</dt>
            <dd className="text-ink-700">{rec.estimatedEffort}</dd>
          </div>
        </dl>
        <AnimatePresence initial={false}>
          {open && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mt-3 overflow-hidden border-t border-ink-900/[0.06] pt-3 text-sm leading-relaxed text-ink-500"
            >
              {rec.details}
            </motion.p>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-sage-900 transition-colors hover:text-ink-900"
        >
          {open ? "Show less" : "Learn More"}
          <ArrowRight
            className={`h-4 w-4 transition-transform duration-200 ease-out ${
              open ? "rotate-90" : "group-hover:translate-x-[3px]"
            }`}
          />
        </button>
      </Card>
    </motion.div>
  );
}

export function Recommendations({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <section>
      <SectionHeading
        label="AI Recommendations"
        title="Strategic moves worth making"
        description="Consultant-grade recommendations with the reasoning behind each one."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {recommendations.map((rec, i) => (
          <RecCard key={rec.title} rec={rec} index={i} />
        ))}
      </div>
    </section>
  );
}
