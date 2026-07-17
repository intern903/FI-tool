import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Star } from "lucide-react";
import type { CompetitorBenchmark, CompetitorRow } from "@/lib/types";
import { chart } from "@/lib/palette";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

const SERIES_COLORS = [chart.primary, chart.secondary, chart.neutralA, chart.neutralB, chart.neutralC];
const METRICS: { key: "seo" | "speed" | "social"; label: string }[] = [
  { key: "seo", label: "SEO" },
  { key: "speed", label: "Speed" },
  { key: "social", label: "Social" },
];

const fmtRating = (v: number | null) => (v == null ? "—" : v.toFixed(1));
const fmtReviews = (v: number | null) => (v == null ? "—" : v.toLocaleString("en-IN"));

export function CompetitorBench({ data }: { data: CompetitorBenchmark }) {
  const you: CompetitorRow = data.you ?? {
    name: "You",
    googleRating: null,
    reviews: null,
    seo: 50,
    speed: 50,
    social: 50,
  };
  const category: CompetitorRow = {
    name: "Category avg",
    googleRating: data.category.googleRating,
    reviews: data.category.reviews,
    seo: data.category.seo,
    speed: data.category.speed,
    social: data.category.social,
  };
  const rows: CompetitorRow[] = [you, category, ...data.competitors];

  const chartData = METRICS.map((m) => {
    const row: Record<string, string | number> = { metric: m.label };
    rows.forEach((r) => (row[r.name] = r[m.key]));
    return row;
  });

  return (
    <section>
      <SectionHeading
        label="Competitor Benchmarking"
        title="How you compare"
        description={data.summary}
      />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="h-72 w-full" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barCategoryGap="22%" barGap={2}>
                <CartesianGrid vertical={false} stroke={chart.grid} />
                <XAxis dataKey="metric" tickLine={false} axisLine={{ stroke: chart.grid }} tick={{ fill: chart.axis, fontSize: 12 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: chart.axis, fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(29,26,23,0.04)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid rgba(29,26,23,0.08)", boxShadow: "0 8px 24px rgba(29,26,23,0.10)", fontSize: 13 }}
                />
                {rows.map((r, i) => (
                  <Bar
                    key={r.name}
                    dataKey={r.name}
                    fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
            {rows.map((r, i) => (
              <li key={r.name} className="flex items-center gap-1.5">
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
                <span className={r.name === "You" ? "font-semibold text-ink-900" : undefined}>{r.name}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm">
              <thead>
                <tr className="border-b border-ink-900/[0.06] text-left">
                  <th className="px-4 py-3 font-semibold text-ink-400">Metric</th>
                  {rows.map((r) => (
                    <th key={r.name} className={cn("px-3 py-3 text-right font-semibold", r.name === "You" ? "text-sage-900" : "text-ink-400")}>
                      {r.name === "Category avg" ? "Cat." : r.name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-ink-900/[0.04]">
                  <td className="px-4 py-2.5 text-ink-700">
                    <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-sun-500" /> Rating</span>
                  </td>
                  {rows.map((r) => (
                    <td key={r.name} className={cn("px-3 py-2.5 text-right tabular-nums", r.name === "You" ? "bg-sage-100/50 font-bold text-ink-900" : "text-ink-700")}>
                      {fmtRating(r.googleRating)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-ink-900/[0.04]">
                  <td className="px-4 py-2.5 text-ink-700">Reviews</td>
                  {rows.map((r) => (
                    <td key={r.name} className={cn("px-3 py-2.5 text-right tabular-nums", r.name === "You" ? "bg-sage-100/50 font-bold text-ink-900" : "text-ink-700")}>
                      {fmtReviews(r.reviews)}
                    </td>
                  ))}
                </tr>
                {METRICS.map((m) => (
                  <tr key={m.key} className="border-b border-ink-900/[0.04] last:border-0">
                    <td className="px-4 py-2.5 text-ink-700">{m.label}</td>
                    {rows.map((r) => (
                      <td key={r.name} className={cn("px-3 py-2.5 text-right tabular-nums", r.name === "You" ? "bg-sage-100/50 font-bold text-ink-900" : "text-ink-700")}>
                        {r[m.key]}
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
