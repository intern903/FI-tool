import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, TrendingUp } from "lucide-react";
import type { Report } from "@/lib/types";
import { formatInr } from "@/lib/utils";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

function Input({
  label,
  prefix,
  value,
  onChange,
}: {
  label: string;
  prefix?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-500">{label}</label>
      <div className="flex items-center rounded-xl border border-ink-900/10 bg-white focus-within:border-sage-500 focus-within:shadow-input-glow">
        {prefix && <span className="pl-3.5 text-sm text-ink-400">{prefix}</span>}
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full bg-transparent px-3 text-sm text-ink-900 focus:outline-none"
        />
      </div>
    </div>
  );
}

export function RoiCalculator({ report }: { report: Report }) {
  const [visitors, setVisitors] = useState("2000");
  const [aov, setAov] = useState("1500");
  const [conv, setConv] = useState("1.5");
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  // The bigger the gap to a healthy score, the more headroom the fixes unlock.
  const upliftPct = useMemo(() => 0.12 + ((100 - report.overallScore) / 100) * 0.28, [report.overallScore]);
  const aiSavingsMonthly = useMemo(
    () => report.aiOpportunities.reduce((s, a) => s + (a.monthlySavingsInr || 0), 0),
    [report.aiOpportunities]
  );

  const result = useMemo(() => {
    const v = Number(visitors) || 0;
    const a = Number(aov) || 0;
    const c = (Number(conv) || 0) / 100;
    const currentRevenue = v * c * a;
    const improvedRevenue = v * Math.min(c * (1 + upliftPct), 1) * a;
    const extraRevenue = Math.max(0, improvedRevenue - currentRevenue);
    return {
      currentRevenue,
      extraRevenue,
      combinedMonthly: extraRevenue + aiSavingsMonthly,
      combinedAnnual: (extraRevenue + aiSavingsMonthly) * 12,
    };
  }, [visitors, aov, conv, upliftPct, aiSavingsMonthly]);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <section>
      <SectionHeading
        label="ROI Calculator"
        title="What this is worth to you"
        description="Plug in three numbers to project the revenue and savings these recommendations could unlock."
      />
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Monthly visitors" value={visitors} onChange={setVisitors} />
              <Input label="Avg order value" prefix="₹" value={aov} onChange={setAov} />
              <Input label="Conversion %" value={conv} onChange={setConv} />
            </div>
            <p className="mt-4 text-xs text-ink-400">
              Estimate based on a projected {Math.round(upliftPct * 100)}% conversion uplift from closing the gaps in
              your audit, plus {formatInr(aiSavingsMonthly)}/mo in AI automation savings. Directional, not a guarantee.
            </p>
          </div>

          <div className="relative flex flex-col justify-center rounded-2xl bg-ink-900 p-6 text-white">
            {!unlocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-ink-900/80 p-6 text-center backdrop-blur-sm">
                <Lock className="h-5 w-5 text-sun-300" />
                <p className="text-sm font-medium">Enter your email to unlock your projection</p>
                <div className="flex w-full max-w-xs gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-10 w-full rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!validEmail}
                    onClick={() => setUnlocked(true)}
                    className="flex h-10 shrink-0 items-center rounded-full bg-white px-4 text-sm font-semibold text-ink-900 transition-opacity disabled:opacity-40"
                  >
                    Unlock
                  </button>
                </div>
              </div>
            )}
            <motion.div
              animate={{ opacity: unlocked ? 1 : 0.25, filter: unlocked ? "blur(0px)" : "blur(6px)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                <TrendingUp className="h-4 w-4 text-sun-300" />
                Estimated additional value
              </div>
              <p className="mt-3 font-display text-4xl font-extrabold tabular-nums">
                {formatInr(result.combinedMonthly)}<span className="text-xl text-white/50"> /mo</span>
              </p>
              <p className="mt-1 text-sm text-white/60">{formatInr(result.combinedAnnual)} projected over 12 months</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
                <div>
                  <p className="text-white/50">Extra revenue</p>
                  <p className="font-semibold tabular-nums">{formatInr(result.extraRevenue)}/mo</p>
                </div>
                <div>
                  <p className="text-white/50">AI savings</p>
                  <p className="font-semibold tabular-nums">{formatInr(aiSavingsMonthly)}/mo</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Card>
    </section>
  );
}
