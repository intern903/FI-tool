import type { AnalyzeInput, AnalyzeResponse } from "./types";

export async function analyzeBusiness(input: AnalyzeInput): Promise<AnalyzeResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Analysis failed (${res.status})`);
  }
  return res.json();
}
