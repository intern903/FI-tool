import { motion } from "framer-motion";
import { BadgeDollarSign } from "lucide-react";
import type { RevenueOpportunity } from "@/lib/types";
import { Card } from "../ui/card";
import { SectionHeading } from "../SectionHeading";

export function Revenue({ items }: { items: RevenueOpportunity[] }) {
  return (
    <section>
      <SectionHeading
        label="Revenue Opportunities"
        title="Where the money is"
        description="Each of these maps directly to more calls, bookings, or sales."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.28, delay: Math.min(i * 0.04, 0.2), ease: "easeOut" }}
          >
            <Card hover className="h-full p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage-100">
                  <BadgeDollarSign className="h-[18px] w-[18px] text-sage-900" />
                </span>
                <h3 className="font-display text-base font-bold text-ink-900">{r.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">{r.description}</p>
              <p className="mt-3 inline-flex rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-ink-700">
                {r.potential}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
