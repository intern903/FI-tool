import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { analyzeBusiness } from "@/lib/api";
import type { AnalyzeInput, AnalyzeResponse } from "@/lib/types";
import { Hero } from "@/components/Hero";
import { ScanOverlay } from "@/components/ScanOverlay";
import { Dashboard } from "@/components/results/Dashboard";

// Keep the scan experience on screen at least this long, so fast responses
// don't cause a jarring flash. The real API call runs in parallel.
const MIN_SCAN_MS = 6000;

type Stage = "idle" | "scanning" | "results";

export default function App() {
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [scanDone, setScanDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async (input: AnalyzeInput) => {
      const [response] = await Promise.all([
        analyzeBusiness(input),
        new Promise((r) => window.setTimeout(r, MIN_SCAN_MS)),
      ]);
      return response;
    },
    onSuccess: (response) => {
      setResult(response);
      setScanDone(true);
      // Let the final checkmark + full progress bar land before switching.
      window.setTimeout(() => setStage("results"), 700);
    },
    onError: () => {
      setStage("idle");
    },
  });

  const handleAnalyze = useCallback(
    (input: AnalyzeInput) => {
      setScanDone(false);
      setStage("scanning");
      mutation.mutate(input);
    },
    [mutation]
  );

  const handleReset = useCallback(() => {
    setResult(null);
    setStage("idle");
    mutation.reset();
    window.scrollTo({ top: 0 });
  }, [mutation]);

  useEffect(() => {
    if (stage === "results") window.scrollTo({ top: 0 });
  }, [stage]);

  return (
    <div className="min-h-screen">
      {stage !== "results" && (
        <Hero
          onAnalyze={handleAnalyze}
          analyzing={stage === "scanning"}
          error={mutation.isError ? (mutation.error as Error).message : null}
        />
      )}

      <AnimatePresence>
        {stage === "scanning" && <ScanOverlay done={scanDone} />}
      </AnimatePresence>

      {stage === "results" && result && (
        <Dashboard result={result} onReset={handleReset} />
      )}

      <footer className="border-t border-ink-900/[0.06] py-8 text-center text-xs text-ink-400">
        GrowthLens — AI growth audits for local businesses
      </footer>
    </div>
  );
}
