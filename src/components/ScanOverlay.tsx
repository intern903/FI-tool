import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Reading website...",
  "Checking Google reviews...",
  "Analyzing SEO...",
  "Checking competitors...",
  "Finding opportunities...",
  "Generating strategy...",
];

// Cumulative seconds at which each step completes (~34s total). The last step
// only completes when the API responds, so the bar never lies.
const STEP_AT = [3, 8, 14, 21, 28, Infinity];

export function ScanOverlay({ done }: { done: boolean }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((e) => e + 0.25), 250);
    return () => window.clearInterval(id);
  }, []);

  const completedCount = done
    ? STEPS.length
    : STEP_AT.filter((t) => elapsed >= t).length;
  const activeIndex = Math.min(completedCount, STEPS.length - 1);

  // Progress eases toward 92% while waiting; jumps to 100% on completion.
  const progress = done ? 100 : Math.min(92, (1 - Math.exp(-elapsed / 16)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-cream-50/90 px-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="card w-full max-w-md p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100">
            <Sparkles className="h-5 w-5 text-sage-700" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">
              Running your growth audit
            </h2>
            <p className="text-xs text-ink-400">Usually takes 20–40 seconds</p>
          </div>
        </div>

        <ol className="space-y-3">
          {STEPS.map((step, i) => {
            const isDone = i < completedCount;
            const isActive = !isDone && i === activeIndex;
            return (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                    isDone
                      ? "border-sage-700 bg-sage-700"
                      : isActive
                        ? "border-sage-500 bg-white"
                        : "border-ink-900/10 bg-white"
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isDone ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </motion.span>
                    ) : isActive ? (
                      <motion.span
                        key="spin"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-sage-700" />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
                <span
                  className={cn(
                    "text-sm transition-colors duration-200",
                    isDone ? "text-ink-400 line-through decoration-ink-300" : isActive ? "font-medium text-ink-900" : "text-ink-300"
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-ink-900/[0.06]">
          <motion.div
            className="h-full rounded-full bg-sage-700"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
