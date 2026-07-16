import { motion } from "framer-motion";
import { CircleCheck, CircleDashed, CircleSlash } from "lucide-react";
import type { ExpansionStrategy, ExpansionVerdict } from "@/lib/types";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

const VERDICT: Record<
  ExpansionVerdict,
  { icon: typeof CircleCheck; text: string; bg: string; label: string }
> = {
  Recommended: { icon: CircleCheck, text: "#3C554F", bg: "#E4ECE9", label: "Recommended" },
  "Worth exploring": { icon: CircleDashed, text: "#8A5406", bg: "#FCEBCB", label: "Worth exploring" },
  "Not yet": { icon: CircleSlash, text: "#6B645C", bg: "#F0E1CF", label: "Not yet" },
};

export function ExpansionStrategies({ items }: { items: ExpansionStrategy[] }) {
  return (
    <section>
      <SectionHeading
        label="Expansion Strategies"
        title="Should you make these moves?"
        description="Honest, business-specific answers to the big strategic questions."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((e, i) => {
          const v = VERDICT[e.recommendation] ?? VERDICT["Worth exploring"];
          const Icon = v.icon;
          return (
            <motion.div
              key={e.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.28, delay: Math.min(i * 0.05, 0.2), ease: "easeOut" }}
            >
              <Card hover className="h-full p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-base font-bold text-ink-900">{e.question}</h3>
                  <span
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ backgroundColor: v.bg, color: v.text }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {v.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{e.rationale}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
