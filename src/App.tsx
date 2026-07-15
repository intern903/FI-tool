import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { analyzeBusiness } from "@/lib/api";
import type { AnalyzeInput, AnalyzeResponse } from "@/lib/types";
import { clearHash, decodeResult, encodeResult, readHashToken, setHash } from "@/lib/share";
import { Hero } from "@/components/Hero";
import { ScanOverlay } from "@/components/ScanOverlay";
import { Dashboard } from "@/components/results/Dashboard";

// Keep the scan experience on screen at least this long, so fast responses
// don't cause a jarring flash. The real API call runs in parallel.
const MIN_SCAN_MS = 6000;

type Stage = "loading" | "idle" | "scanning" | "results";

export default function App() {
  // If the page was opened from a shared link, start in "loading" while we
  // decode the report from the URL fragment.
  const [stage, setStage] = useState<Stage>(() => (readHashToken() ? "loading" : "idle"));
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [scanDone, setScanDone] = useState(false);

  // Restore a shared/bookmarked report from the URL fragment on first load.
  useEffect(() => {
    const token = readHashToken();
    if (!token) return;
    let active = true;
    decodeResult(token).then((decoded) => {
      if (!active) return;
      if (decoded) {
        setResult(decoded);
        setStage("results");
      } else {
        clearHash();
        setStage("idle");
      }
    });
    return () => {
      active = false;
    };
  }, []);

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
      // Persist the report into the URL so a refresh or shared link restores it.
      encodeResult(response)
        .then((token) => setHash(token))
        .catch(() => {});
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
    clearHash();
    mutation.reset();
    window.scrollTo({ top: 0 });
  }, [mutation]);

  useEffect(() => {
    if (stage === "results") window.scrollTo({ top: 0 });
  }, [stage]);

  if (stage === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sage-700" />
        <span className="sr-only">Loading shared report…</span>
      </div>
    );
  }

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
