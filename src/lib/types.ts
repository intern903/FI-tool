import { z } from "zod";

const optionalUrlish = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined));

export const analyzeInputSchema = z
  .object({
    googleMapsUrl: optionalUrlish,
    websiteUrl: optionalUrlish,
    instagram: optionalUrlish,
    facebook: optionalUrlish,
    linkedin: optionalUrlish,
    youtube: optionalUrlish,
    x: optionalUrlish,
  })
  .refine((v) => Boolean(v.googleMapsUrl || v.websiteUrl), {
    message: "Add your Google Maps link or website — either one works.",
    path: ["googleMapsUrl"],
  });

/** Raw form values before Zod transforms (fields may be ""). */
export type AnalyzeFormValues = z.input<typeof analyzeInputSchema>;
/** Parsed values after Zod transforms (empty strings become undefined). */
export type AnalyzeInput = z.output<typeof analyzeInputSchema>;

export type HealthKey = "seo" | "maps" | "website" | "social" | "brand" | "trust";

export interface HealthCard {
  key: HealthKey;
  label: string;
  score: number;
  insight: string;
}

export interface Opportunity {
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Moderate" | "Hard";
  expectedResult: string;
  timeRequired: string;
}

export interface CompetitorRow {
  name: string;
  isYou: boolean;
  googleRating: number;
  reviews: number;
  seo: number;
  speed: number;
  social: number;
  content: number;
  trust: number;
}

export interface RoadmapPhase {
  phase: "30 Days" | "60 Days" | "90 Days";
  focus: string;
  tasks: { title: string; detail: string }[];
}

export interface Recommendation {
  title: string;
  why: string;
  expectedImpact: string;
  estimatedEffort: string;
  details: string;
}

export interface QuickWin {
  title: string;
  description: string;
  expectedResult: string;
}

export interface RevenueOpportunity {
  title: string;
  description: string;
  potential: string;
}

export interface Report {
  businessName: string;
  summary: string;
  overallScore: number;
  health: HealthCard[];
  opportunities: Opportunity[];
  competitors: CompetitorRow[];
  roadmap: RoadmapPhase[];
  recommendations: Recommendation[];
  quickWins: QuickWin[];
  revenueOpportunities: RevenueOpportunity[];
}

export interface AnalyzeResponse {
  report: Report;
  source: "gemini" | "heuristic";
  context: {
    businessName: string;
    hasWebsite: boolean;
    websiteReachable: boolean;
    hasMapsProfile: boolean;
    mapsReachable: boolean;
    socialCount: number;
    socialsProvided: string[];
  };
}
