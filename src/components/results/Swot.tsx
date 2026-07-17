import { motion } from "framer-motion";
import { AlertTriangle, Shield, Target, TrendingDown } from "lucide-react";
import type { Swot, SwotItem } from "@/lib/types";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

const QUADRANTS = [
  { key: "strengths" as const, label: "Strengths", icon: Shield, color: "#0F8A70", bg: "#E4ECE9" },
  { key: "weaknesses" as const, label: "Weaknesses", icon: TrendingDown, color: "#D5484F", bg: "#FCE4E1" },
  { key: "opportunities" as const, label: "Opportunities", icon: Target, color: "#C97E13", bg: "#FCEBCB" },
  { key: "threats" as const, label: "Threats", icon: AlertTriangle, color: "#5F827A", bg: "#E4ECE9" },
];

function Quadrant({
  label,
  icon: Icon,
  color,
  bg,
  items,
  index,
}: {
  label: string;
  icon: typeof Shield;
  color: string;
  bg: string;
  items: SwotItem[];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card className="h-full p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: bg }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </span>
          <h3 className="font-display text-base font-bold text-ink-900">{label}</h3>
        </div>
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li key={i}>
              <p className="text-sm font-medium text-ink-900">{it.point}</p>
              <p className="mt-0.5 text-xs text-ink-400">
                <span className="font-semibold">Evidence:</span> {it.evidence}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}

export function SwotSection({ swot }: { swot: Swot }) {
  return (
    <section>
      <SectionHeading
        label="SWOT & Risk Analysis"
        title="Strengths, gaps, and risks"
        description="Every point traces back to a concrete finding in your audit."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {QUADRANTS.map((q, i) => (
          <Quadrant
            key={q.key}
            label={q.label}
            icon={q.icon}
            color={q.color}
            bg={q.bg}
            items={swot[q.key] ?? []}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
