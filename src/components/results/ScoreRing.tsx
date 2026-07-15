import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CountUp } from "../CountUp";
import { scoreColor } from "@/lib/palette";

export function ScoreRing({ score }: { score: number }) {
  const size = 200;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const offset = circumference * (1 - (mounted ? score : 0) / 100);
  const color = scoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" role="img" aria-label={`Overall score ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#EDE7DD"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-extrabold tabular-nums tracking-tight text-ink-900">
          <CountUp value={score} />
        </span>
        <span className="text-sm font-medium text-ink-400">/ 100</span>
      </div>
    </div>
  );
}
