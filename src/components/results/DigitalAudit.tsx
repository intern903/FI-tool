import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  CircleAlert,
  Gauge,
  Lock,
  Minus,
  Timer,
  Weight,
  X,
} from "lucide-react";
import type { AuditCategory, CheckStatus, DigitalAudit } from "@/lib/types";
import { scoreColor, status as statusColors } from "@/lib/palette";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

const STATUS_ICON: Record<CheckStatus, typeof Check> = {
  pass: Check,
  warn: CircleAlert,
  fail: X,
  na: Minus,
};

function StatusDot({ s }: { s: CheckStatus }) {
  const Icon = STATUS_ICON[s];
  const c = statusColors[s];
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <Icon className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

function CategoryBlock({ cat, defaultOpen }: { cat: AuditCategory; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const failing = cat.checks.filter((c) => c.status === "fail").length;
  return (
    <div className="rounded-xl border border-ink-900/[0.06] bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex-1">
          <span className="text-sm font-bold text-ink-900">{cat.label}</span>
          {failing > 0 && (
            <span className="ml-2 text-xs font-medium text-coral-700">{failing} to fix</span>
          )}
        </span>
        {cat.score != null ? (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
            style={{ color: scoreColor(cat.score), backgroundColor: `${scoreColor(cat.score)}14` }}
          >
            {cat.score}
          </span>
        ) : (
          <span className="rounded-full bg-cream-100 px-2 py-0.5 text-xs font-medium text-ink-400">n/a</span>
        )}
        <ChevronDown className={cn("h-4 w-4 text-ink-400 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {cat.checks.map((c) => (
              <li key={c.id} className="flex items-start gap-3 border-t border-ink-900/[0.04] px-4 py-2.5">
                <StatusDot s={c.status} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900">{c.label}</p>
                  <p className="text-xs text-ink-500">{c.evidence}</p>
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-cream-50 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-ink-400" />
      <div>
        <p className="text-xs text-ink-400">{label}</p>
        <p className="text-sm font-bold tabular-nums text-ink-900">{value}</p>
      </div>
    </div>
  );
}

export function DigitalAuditSection({ audit }: { audit: DigitalAudit }) {
  if (!audit.available) {
    return (
      <section>
        <SectionHeading label="Website & Digital Audit" title="The measured backbone" />
        <Card className="p-6 text-sm text-ink-500">
          {audit.note ?? "Add a website URL to run the objective digital audit."}
        </Card>
      </section>
    );
  }

  const m = audit.measured;
  const stats: { icon: typeof Gauge; label: string; value: string }[] = [];
  if (m.responseMs != null) stats.push({ icon: Timer, label: "Server response", value: `${m.responseMs} ms` });
  if (m.lighthousePerf != null) stats.push({ icon: Gauge, label: "Lighthouse", value: `${m.lighthousePerf}/100` });
  if (m.lcpMs != null) stats.push({ icon: Gauge, label: "LCP", value: `${(m.lcpMs / 1000).toFixed(1)} s` });
  if (m.pageWeightKb != null) stats.push({ icon: Weight, label: "Page weight", value: `${m.pageWeightKb} KB` });
  stats.push({ icon: Lock, label: "HTTPS", value: m.httpsValid ? "Secure" : "Not secure" });
  if (m.gbpRating != null) stats.push({ icon: Gauge, label: "Google rating", value: `${m.gbpRating.toFixed(1)}★` });

  return (
    <section>
      <SectionHeading
        label="Website & Digital Audit"
        title="The measured backbone"
        description={`Objective, scrapeable signals — the evidence every other score is built on. Source: ${
          audit.source === "measured+lighthouse" ? "our scan + Google Lighthouse" : "our live scan"
        }.`}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {audit.categories.map((cat, i) => (
          <CategoryBlock key={cat.key} cat={cat} defaultOpen={i < 2} />
        ))}
      </div>
    </section>
  );
}
