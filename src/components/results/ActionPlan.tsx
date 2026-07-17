import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarCheck, ChevronDown, Zap } from "lucide-react";
import type { RoadmapPhase, RoadmapTask } from "@/lib/types";
import { CONSULTATION_URL } from "@/lib/constants";
import { priority } from "@/lib/palette";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

const PHASE_ACCENT = ["bg-sun-300", "bg-blush-300", "bg-sage-500"];
const effortColor: Record<string, string> = {
  Low: "text-sage-900 bg-sage-100",
  Medium: "text-sun-900 bg-sun-100",
  High: "text-coral-700 bg-coral-100",
};

function Task({ task }: { task: RoadmapTask }) {
  const [open, setOpen] = useState(false);
  const p = priority[task.impact];
  return (
    <li className={cn("rounded-xl border bg-cream-50", task.quickWin ? "border-sage-300" : "border-ink-900/[0.06]")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            {task.quickWin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sage-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                <Zap className="h-2.5 w-2.5" /> Quick win
              </span>
            )}
            <span className="text-sm font-medium text-ink-900">{task.title}</span>
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <p className="text-sm leading-relaxed text-ink-500">{task.detail}</p>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: p.bg, color: p.text }}>
                  {task.impact} impact
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", effortColor[task.effort])}>
                  {task.effort} effort
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function ActionPlan({ roadmap, pitch }: { roadmap: RoadmapPhase[]; pitch: string }) {
  return (
    <section>
      <SectionHeading
        label="30 / 60 / 90-Day Action Plan"
        title="Your next three months, planned"
        description="Prioritized tasks with impact and effort — quick wins first. Expand any task for the detail."
      />
      <div className="relative grid gap-4 lg:grid-cols-3">
        <div aria-hidden className="absolute left-0 right-0 top-7 hidden h-px bg-ink-900/[0.08] lg:block" />
        {roadmap.map((phase, i) => (
          <motion.div
            key={phase.phase}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.28, delay: i * 0.07, ease: "easeOut" }}
            className="relative"
          >
            <Card className="h-full p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-full text-ink-900", PHASE_ACCENT[i % PHASE_ACCENT.length])}>
                  <CalendarCheck className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-900">{phase.phase}</h3>
                  <p className="text-xs text-ink-400">{phase.focus}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {phase.tasks.map((t) => (
                  <Task key={t.title} task={t} />
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="mt-4 flex flex-col items-center justify-between gap-6 overflow-hidden bg-ink-900 p-6 text-center text-white sm:flex-row sm:p-8 sm:text-left">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <CalendarCheck className="h-5 w-5 text-sun-300" />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold">Turn this plan into results</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/70">{pitch}</p>
            </div>
          </div>
          <a
            href={CONSULTATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-ink-900 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-glow"
          >
            Book a Consultation
            <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-[3px]" />
          </a>
        </Card>
      </motion.div>
    </section>
  );
}
