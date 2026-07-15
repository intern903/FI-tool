import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange, ChevronDown } from "lucide-react";
import type { RoadmapPhase } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

const PHASE_ACCENTS = ["bg-sun-300", "bg-blush-300", "bg-sage-500"];

function Task({ task }: { task: { title: string; detail: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-xl border border-ink-900/[0.06] bg-cream-50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-ink-900">{task.title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200 ease-out",
            open && "rotate-180"
          )}
        />
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
            <p className="px-4 pb-3 text-sm leading-relaxed text-ink-500">{task.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Roadmap({ roadmap }: { roadmap: RoadmapPhase[] }) {
  return (
    <section>
      <SectionHeading
        label="30 / 60 / 90 Day Roadmap"
        title="Your next three months, planned"
        description="A phased plan — expand any task for the specifics."
      />
      <div className="relative grid gap-4 lg:grid-cols-3">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-7 hidden h-px bg-ink-900/[0.08] lg:block"
        />
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
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-ink-900",
                    PHASE_ACCENTS[i % PHASE_ACCENTS.length]
                  )}
                >
                  <CalendarRange className="h-[18px] w-[18px]" />
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
    </section>
  );
}
