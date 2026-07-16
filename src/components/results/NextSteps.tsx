import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck } from "lucide-react";
import type { NextStep } from "@/lib/types";
import { CONSULTATION_URL } from "@/lib/constants";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

export function NextSteps({ steps, pitch }: { steps: NextStep[]; pitch: string }) {
  return (
    <section>
      <SectionHeading label="Next Steps" title="Your next best moves" />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.26, delay: Math.min(i * 0.06, 0.3), ease: "easeOut" }}
                className="flex gap-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 font-display text-sm font-bold text-sage-900">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <h3 className="text-sm font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-500">{s.detail}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="lg:col-span-2"
        >
          <Card className="flex h-full flex-col justify-between overflow-hidden bg-ink-900 p-6 text-white">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <CalendarCheck className="h-5 w-5 text-sun-300" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold">Talk to Soulful Labs</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{pitch}</p>
            </div>
            <a
              href={CONSULTATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-ink-900 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-glow"
            >
              Book a Consultation
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-[3px]" />
            </a>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
