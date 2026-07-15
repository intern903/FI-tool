import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="mb-6"
    >
      <p className="section-label mb-2">{label}</p>
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
        {title}
      </h2>
      {description ? <p className="mt-2 max-w-2xl text-sm text-ink-500">{description}</p> : null}
    </motion.div>
  );
}
