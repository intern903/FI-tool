import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import type { RecommendedService } from "@/lib/types";
import { SERVICES, CONSULTATION_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

const FIT_STYLES: Record<string, string> = {
  "Best fit": "bg-sage-700 text-white",
  "Strong fit": "bg-sage-100 text-sage-900",
  Consider: "bg-cream-100 text-ink-500",
};

export function RecommendedServices({ items }: { items: RecommendedService[] }) {
  const ranked = [...items].sort((a, b) => b.matchScore - a.matchScore);
  const best = ranked[0];
  const rest = ranked.slice(1);
  const bestMeta = best ? SERVICES[best.service] : undefined;

  return (
    <section>
      <SectionHeading
        label="Recommended Soulful Labs Services"
        title="Which program fits you"
        description="Based on your stage, goals, and challenges — ranked by how well each fits."
      />

      {best && bestMeta && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="mb-4 overflow-hidden border-sage-300 bg-gradient-to-br from-sage-100/70 to-white">
            <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-700 text-white">
                    <bestMeta.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-700 px-2.5 py-1 text-xs font-semibold text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      Best fit for you
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
                  {best.service}
                  <span className="ml-2 text-base font-semibold text-sage-700">{bestMeta.tagline}</span>
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-700">{best.why}</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">{best.whatYouGet}</p>
                <a
                  href={CONSULTATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-6 text-sm font-semibold text-white shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Explore {best.service}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-[3px]" />
                </a>
              </div>
              <div className="flex shrink-0 flex-col items-center rounded-2xl bg-white/70 p-5 text-center shadow-soft">
                <span className="font-display text-4xl font-extrabold tabular-nums text-sage-700">
                  {best.matchScore}
                  <span className="text-xl text-ink-300">%</span>
                </span>
                <span className="mt-1 text-xs font-medium text-ink-400">match</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {rest.map((s, i) => {
          const meta = SERVICES[s.service];
          if (!meta) return null;
          return (
            <motion.div
              key={s.service}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.26, delay: Math.min(i * 0.05, 0.2), ease: "easeOut" }}
            >
              <Card hover className="flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-100">
                    <meta.icon className="h-5 w-5 text-ink-700" />
                  </span>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", FIT_STYLES[s.fit])}>
                    {s.fit}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink-900">
                  {s.service}
                  <span className="ml-2 text-xs font-semibold text-ink-400">{meta.tagline}</span>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{s.why}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-900/[0.06]">
                    <motion.div
                      className="h-full rounded-full bg-sage-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.matchScore}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-ink-500">{s.matchScore}%</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
