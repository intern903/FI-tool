import { motion } from "framer-motion";
import { Card } from "../ui/card";

/** Minimal premium illustration: dashed circle, floating dot, soft shapes. */
function Illustration() {
  return (
    <svg width="120" height="88" viewBox="0 0 120 88" aria-hidden className="mx-auto">
      <ellipse cx="60" cy="76" rx="42" ry="6" fill="#F7EDE2" />
    <circle
        cx="60"
        cy="40"
        r="26"
        fill="none"
        stroke="#B3ABA1"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />
      <circle cx="60" cy="40" r="14" fill="#F5CAC3" opacity="0.55" />
      <motion.circle
        cx="88"
        cy="20"
        r="4"
        fill="#F6BD60"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="30"
        cy="26"
        r="3"
        fill="#84A59D"
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <Card className="p-8 text-center">
      <Illustration />
      <h3 className="mt-4 font-display text-base font-bold text-ink-900">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">{hint}</p>
    </Card>
  );
}
