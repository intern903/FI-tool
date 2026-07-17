import { motion } from "framer-motion";
import { MapPin, MessageCircle, Target, UserRound } from "lucide-react";
import type { JourneyStage, Persona } from "@/lib/types";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

export function Personas({ personas, journey }: { personas: Persona[]; journey: JourneyStage[] }) {
  return (
    <section>
      <SectionHeading
        label="Customer Persona & Journey"
        title="Who you serve, and how they buy"
        description="Target personas and the journey they take — with the opportunity at each stage."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personas.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.28, delay: Math.min(i * 0.05, 0.2), ease: "easeOut" }}
          >
            <Card hover className="h-full p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush-100">
                <UserRound className="h-5 w-5 text-coral-700" />
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-ink-900">{p.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{p.description}</p>
              <div className="mt-3 space-y-1.5 text-sm">
                <p className="flex items-start gap-2 text-ink-700">
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" />
                  <span><span className="text-ink-400">Needs:</span> {p.needs}</span>
                </p>
                <p className="flex items-start gap-2 text-ink-700">
                  <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" />
                  <span><span className="text-ink-400">Reach via:</span> {p.channels}</span>
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map((j, i) => (
            <motion.div
              key={j.stage}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.26, delay: Math.min(i * 0.06, 0.24), ease: "easeOut" }}
              className="relative rounded-xl bg-cream-50 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-700 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <h4 className="text-sm font-bold text-ink-900">{j.stage}</h4>
              </div>
              <p className="flex items-start gap-1.5 text-xs text-ink-500">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-ink-300" />
                {j.touchpoint}
              </p>
              <p className="mt-2 text-xs font-medium text-sage-900">→ {j.opportunity}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </section>
  );
}
