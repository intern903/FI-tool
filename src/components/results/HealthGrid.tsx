import { motion } from "framer-motion";
import {
  Award,
  Landmark,
  MapPin,
  Monitor,
  Search,
  Share2,
} from "lucide-react";
import type { HealthCard, HealthKey } from "@/lib/types";
import { scoreColor } from "@/lib/palette";
import { Card } from "../ui/card";
import { CountUp } from "../CountUp";
import { SectionHeading } from "../SectionHeading";

const ICONS: Record<HealthKey, typeof Search> = {
  seo: Search,
  maps: MapPin,
  website: Monitor,
  social: Share2,
  brand: Award,
  trust: Landmark,
};

export function HealthGrid({ health }: { health: HealthCard[] }) {
  return (
    <section>
      <SectionHeading
        label="Business Health"
        title="Where you stand today"
        description="Six pillars of your online presence, scored from the signals we collected."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {health.map((h, i) => {
          const Icon = ICONS[h.key] ?? Search;
          const color = scoreColor(h.score);
          return (
            <motion.div
              key={h.key}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.28, delay: Math.min(i * 0.05, 0.25), ease: "easeOut" }}
            >
              <Card hover className="h-full p-5">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-100">
                    <Icon className="h-5 w-5 text-ink-700" />
                  </span>
                  <span className="font-display text-3xl font-bold tabular-nums text-ink-900">
                    <CountUp value={h.score} />
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink-900">{h.label}</h3>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-900/[0.06]"
                  role="meter"
                  aria-valuenow={h.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${h.label} score`}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${h.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{h.insight}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
