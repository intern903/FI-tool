import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

export const analyzeInputSchema = z
  .object({
    websiteUrl: optionalText,
    businessDetails: optionalText,
    industry: optionalText,
    stage: optionalText,
    goal: optionalText,
    challenges: z.array(z.string()).default([]),
  })
  .refine((v) => Boolean(v.websiteUrl || v.businessDetails), {
    message: "Add your website URL, or describe your business below — either works.",
    path: ["websiteUrl"],
  });

export type AnalyzeFormValues = z.input<typeof analyzeInputSchema>;
export type AnalyzeInput = z.output<typeof analyzeInputSchema>;

export type SnapshotKey =
  | "brand"
  | "digital"
  | "product"
  | "distribution"
  | "operations"
  | "ai";

export interface SnapshotDimension {
  key: SnapshotKey;
  label: string;
  score: number;
  insight: string;
}

export type Impact = "High" | "Medium" | "Low";
export type Effort = "Low" | "Medium" | "High";

export interface GrowthOpportunity {
  title: string;
  description: string;
  impact: Impact;
  effort: Effort;
  expectedOutcome: string;
  timeframe: string;
}

export interface AiOpportunity {
  title: string;
  area: string; // e.g. Marketing, Operations, Sales, Support, Product
  description: string;
  impact: Impact;
}

export type ExpansionVerdict = "Recommended" | "Worth exploring" | "Not yet";

export interface ExpansionStrategy {
  title: string; // e.g. "Build a brand"
  question: string; // e.g. "Should I build a brand?"
  recommendation: ExpansionVerdict;
  rationale: string;
}

export type ServiceName =
  | "Incubation"
  | "Acceleration"
  | "AI Tools"
  | "Projects & Consulting";

export type ServiceFit = "Best fit" | "Strong fit" | "Consider";

export interface RecommendedService {
  service: ServiceName;
  fit: ServiceFit;
  matchScore: number; // 0-100
  why: string;
  whatYouGet: string;
}

export interface NextStep {
  title: string;
  detail: string;
}

export interface Report {
  businessName: string;
  industry: string;
  stage: string;
  stageRationale: string;
  summary: string;
  overallScore: number; // Growth readiness 0-100
  snapshot: SnapshotDimension[];
  growthOpportunities: GrowthOpportunity[];
  aiOpportunities: AiOpportunity[];
  expansionStrategies: ExpansionStrategy[];
  recommendedServices: RecommendedService[];
  nextSteps: NextStep[];
  consultationPitch: string;
}

export interface AnalyzeResponse {
  report: Report;
  source: "gemini" | "heuristic";
  context: {
    businessName: string;
    industry?: string;
    hasWebsite: boolean;
    websiteReachable: boolean;
    hasBusinessDetails: boolean;
    challenges: string[];
  };
}
