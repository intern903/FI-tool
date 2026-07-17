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
    gbpUrl: optionalText,
    businessDetails: optionalText,
    industry: optionalText,
    stage: optionalText,
    goal: optionalText,
    revenueBand: optionalText,
    teamSize: optionalText,
    locations: optionalText,
    channels: z.array(z.string()).default([]),
    challenges: z.array(z.string()).default([]),
  })
  .refine((v) => Boolean(v.websiteUrl || v.businessDetails), {
    message: "Add your website URL, or describe your business below — either works.",
    path: ["websiteUrl"],
  });

export type AnalyzeFormValues = z.input<typeof analyzeInputSchema>;
export type AnalyzeInput = z.output<typeof analyzeInputSchema>;

export type Impact = "High" | "Medium" | "Low";
export type Effort = "Low" | "Medium" | "High";

// ---- Deterministic audit ----
export type CheckStatus = "pass" | "warn" | "fail" | "na";
export interface AuditCheck {
  id: string;
  label: string;
  status: CheckStatus;
  evidence: string;
  weight: number;
}
export interface AuditCategory {
  key: string;
  label: string;
  score: number | null;
  checks: AuditCheck[];
}
export interface AuditMeasured {
  httpsValid?: boolean;
  responseMs?: number;
  pageWeightKb?: number;
  lighthousePerf?: number;
  lcpMs?: number;
  cls?: number;
  gbpRating?: number;
  gbpReviews?: number;
}
export interface DigitalAudit {
  available: boolean;
  score: number | null;
  source: "measured" | "measured+lighthouse" | "none";
  categories: AuditCategory[];
  measured: AuditMeasured;
  note?: string;
}

// ---- Composite health ----
export interface HealthCategory {
  key: string;
  label: string;
  score: number;
  weight: number;
  weightPct: number;
  measured?: boolean;
}

export type SnapshotKey = "brand" | "digital" | "product" | "distribution" | "operations" | "ai";
export interface SnapshotDimension {
  key: SnapshotKey;
  label: string;
  score: number;
  insight: string;
}

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
  area: string;
  description: string;
  impact: Impact;
  hoursSavedPerWeek: number;
  monthlySavingsInr: number;
}

export interface SwotItem {
  point: string;
  evidence: string;
}
export interface Swot {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

export type ExpansionVerdict = "Recommended" | "Worth exploring" | "Not yet";
export interface ExpansionStrategy {
  title: string;
  question: string;
  recommendation: ExpansionVerdict;
  rationale: string;
}

export interface CompetitorRow {
  name: string;
  googleRating: number | null;
  reviews: number | null;
  seo: number;
  speed: number;
  social: number;
  note?: string;
}
export interface CompetitorBenchmark {
  summary: string;
  category: { googleRating: number; reviews: number; seo: number; speed: number; social: number };
  competitors: CompetitorRow[];
  you?: CompetitorRow;
}

export interface Persona {
  name: string;
  description: string;
  needs: string;
  channels: string;
}
export interface JourneyStage {
  stage: string;
  touchpoint: string;
  opportunity: string;
}

export interface RoadmapTask {
  title: string;
  detail: string;
  impact: Impact;
  effort: Effort;
  quickWin: boolean;
}
export interface RoadmapPhase {
  phase: "30 Days" | "60 Days" | "90 Days";
  focus: string;
  tasks: RoadmapTask[];
}

export type ServiceName = "Incubation" | "Acceleration" | "AI Tools" | "Projects & Consulting";
export type ServiceFit = "Best fit" | "Strong fit" | "Consider";
export interface RecommendedService {
  service: ServiceName;
  fit: ServiceFit;
  matchScore: number;
  why: string;
  whatYouGet: string;
}

export interface Report {
  businessName: string;
  industry: string;
  stage: string;
  stageRationale: string;
  summary: string;
  overallScore: number;
  healthBreakdown: HealthCategory[];
  audit: DigitalAudit;
  snapshot: SnapshotDimension[];
  swot: Swot;
  growthOpportunities: GrowthOpportunity[];
  aiOpportunities: AiOpportunity[];
  expansionStrategies: ExpansionStrategy[];
  competitorBenchmark: CompetitorBenchmark;
  personas: Persona[];
  journey: JourneyStage[];
  roadmap: RoadmapPhase[];
  recommendedServices: RecommendedService[];
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
    hasGbp: boolean;
    challenges: string[];
  };
}
