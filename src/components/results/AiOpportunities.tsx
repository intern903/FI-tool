import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { AiOpportunity } from "@/lib/types";
import { priority } from "@/lib/palette";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

export function AiOpportunities({ items }: { items: AiOpportunity[] }) {
  return (
    <section>
      <SectionHeading
        label="AI Opportunities"
        title="What AI can do for you"
        description="Concrete places AI can automate work and unlock growth in your business."
      />
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
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    {a.area}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink-900">{a.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{a.description}</p>
                <Badge className="mt-4 self-start" style={{ backgroundColor: p.bg, color: p.text }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
                  {a.impact} Impact
                </Badge>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
