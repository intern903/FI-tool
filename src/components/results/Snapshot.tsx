import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  Award,
  Boxes,
  Bot,
  Globe,
  Settings2,
  Truck,
} from "lucide-react";
import type { SnapshotDimension, SnapshotKey } from "@/lib/types";
import { chart, scoreColor } from "@/lib/palette";
import { Card } from "../ui/card";
import { CountUp } from "../CountUp";
import { SectionHeading } from "../SectionHeading";

const ICONS: Record<SnapshotKey, typeof Award> = {
  brand: Award,
  digital: Globe,
  product: Boxes,
  distribution: Truck,
  operations: Settings2,
  ai: Bot,
};

export function Snapshot({ snapshot }: { snapshot: SnapshotDimension[] }) {
  const radarData = snapshot.map((d) => ({ dim: d.label.split(" ")[0], score: d.score }));

  return (
    <section>
      <SectionHeading
        label="Business Snapshot"
        title="Where you stand today"
        description="Six dimensions of your business, scored from your inputs and what we could learn."
      />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <div className="h-72 w-full" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke={chart.grid} />
                <PolarAngleAxis dataKey="dim" tick={{ fill: chart.axis, fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="score"
                  stroke={chart.primary}
                  fill={chart.primary}
                  fillOpacity={0.22}
                  strokeWidth={2}
                  isAnimationActive
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
          {snapshot.map((d, i) => {
            const Icon = ICONS[d.key] ?? Award;
            const color = scoreColor(d.score);
            return (
              <motion.div
                key={d.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.26, delay: Math.min(i * 0.04, 0.2), ease: "easeOut" }}
              >
                <Card hover className="h-full p-4">
                  <div className="flex items-start justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream-100">
                      <Icon className="h-[18px] w-[18px] text-ink-700" />
                    </span>
                    <span className="font-display text-2xl font-bold tabular-nums text-ink-900">
                      <CountUp value={d.score} />
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-ink-900">{d.label}</h3>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-900/[0.06]" role="meter" aria-valuenow={d.score} aria-valuemin={0} aria-valuemax={100} aria-label={d.label}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${d.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-ink-500">{d.insight}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
