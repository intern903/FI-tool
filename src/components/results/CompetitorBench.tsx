import { motion } from "framer-motion";
import { Star } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CompetitorRow } from "@/lib/types";
import { chart } from "@/lib/palette";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

const METRICS: { key: keyof CompetitorRow; label: string }[] = [
  { key: "seo", label: "SEO" },
  { key: "speed", label: "Speed" },
  { key: "social", label: "Social Presence" },
  { key: "content", label: "Content" },
  { key: "trust", label: "Trust" },
];

const SERIES_COLORS = [chart.primary, chart.neutralA, chart.neutralB, chart.neutralC];

export function CompetitorBench({ competitors }: { competitors: CompetitorRow[] }) {
  const you = competitors.find((c) => c.isYou) ?? competitors[0];
  const others = competitors.filter((c) => c !== you);
  const ordered = [you, ...others];

  const chartData = METRICS.map((m) => {
    const row: Record<string, string | number> = { metric: m.label };
    for (const c of ordered) row[c.name] = c[m.key] as number;
    return row;
  });

  return (
    <section>
      <SectionHeading
        label="Competitor Benchmark"
        title="How you compare"
        description="Your business (teal) against three local competitor archetypes."
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="h-72 w-full" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="24%" barGap={2}>
                <CartesianGrid vertical={false} stroke={chart.grid} />
                <XAxis
                  dataKey="metric"
                  tickLine={false}
                  axisLine={{ stroke: chart.grid }}
                  tick={{ fill: chart.axis, fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: chart.axis, fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(29,26,23,0.04)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(29,26,23,0.08)",
                    boxShadow: "0 8px 24px rgba(29,26,23,0.10)",
                    fontSize: 13,
                  }}
                />
                {ordered.map((c, i) => (
                  <Bar
                    key={c.name}
                    dataKey={c.name}
                    fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                    isAnimationActive
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
            {ordered.map((c, i) => (
              <li key={c.name} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }}
                />
                <span className={c.isYou ? "font-semibold text-ink-900" : undefined}>{c.name}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] text-sm">
              <caption className="sr-only">Competitor benchmark data</caption>
              <thead>
                <tr className="border-b border-ink-900/[0.06] text-left">
                  <th className="px-4 py-3 font-semibold text-ink-400">Metric</th>
                  {ordered.map((c) => (
                    <th
                      key={c.name}
                      className={cn(
                        "px-3 py-3 text-right font-semibold",
                        c.isYou ? "text-sage-900" : "text-ink-400"
                      )}
                    >
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-ink-900/[0.04]">
                  <td className="px-4 py-2.5 text-ink-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-sun-500" /> Google Rating
                    </span>
                  </td>
                  {ordered.map((c) => (
                    <td
                      key={c.name}
                      className={cn(
                        "px-3 py-2.5 text-right tabular-nums",
                        c.isYou ? "bg-sage-100/50 font-bold text-ink-900" : "text-ink-700"
                      )}
                    >
                      {c.googleRating.toFixed(1)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-ink-900/[0.04]">
                  <td className="px-4 py-2.5 text-ink-700">Reviews</td>
                  {ordered.map((c) => (
                    <td
                      key={c.name}
                      className={cn(
                        "px-3 py-2.5 text-right tabular-nums",
                        c.isYou ? "bg-sage-100/50 font-bold text-ink-900" : "text-ink-700"
                      )}
                    >
                      {c.reviews.toLocaleString()}
                    </td>
                  ))}
                </tr>
                {METRICS.map((m) => (
                  <tr key={m.key} className="border-b border-ink-900/[0.04] last:border-0">
                    <td className="px-4 py-2.5 text-ink-700">{m.label}</td>
                    {ordered.map((c) => (
                      <td
                        key={c.name}
                        className={cn(
                          "px-3 py-2.5 text-right tabular-nums",
                          c.isYou ? "bg-sage-100/50 font-bold text-ink-900" : "text-ink-700"
                        )}
                      >
                        {c[m.key] as number}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
}
