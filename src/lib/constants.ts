import {
  Rocket,
  TrendingUp,
  Bot,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ServiceName } from "./types";

export const INDUSTRIES = [
  "Retail / E-commerce",
  "Food & Beverage",
  "Beauty & Wellness",
  "Health & Fitness",
  "Fashion & Apparel",
  "Home & Living",
  "Technology / SaaS",
  "Professional Services",
  "Education & Training",
  "Manufacturing",
  "Hospitality & Travel",
  "Media & Content",
  "Finance & Fintech",
  "Real Estate",
  "Other",
] as const;

export const STAGES = [
  "Just an idea",
  "Pre-launch",
  "Early stage (0–2 yrs)",
  "Growing (2–5 yrs)",
  "Established (5+ yrs)",
  "Scaling / multi-location",
] as const;

export const GOALS = [
  "Grow revenue",
  "Build a strong brand",
  "Automate with AI",
  "Expand distribution",
  "Launch a new product",
  "Raise funding",
  "Improve operations",
  "Explore what's possible",
] as const;

export const REVENUE_BANDS = [
  "Pre-revenue",
  "Under ₹5L / year",
  "₹5L – ₹50L / year",
  "₹50L – ₹5Cr / year",
  "₹5Cr+ / year",
] as const;

export const TEAM_SIZES = [
  "Just me",
  "2–10",
  "11–50",
  "51–200",
  "200+",
] as const;

export const LOCATION_COUNTS = [
  "Online only",
  "1 location",
  "2–5 locations",
  "6+ locations",
] as const;

export const CHANNELS = [
  "Own website",
  "Marketplaces (Amazon, etc.)",
  "Retail / in-store",
  "Social selling",
  "Wholesale / B2B",
  "Resellers / distributors",
] as const;

export const CHALLENGES = [
  "Not enough customers or leads",
  "Low brand awareness",
  "Manual, time-consuming operations",
  "Growth has plateaued",
  "Expanding to new markets",
  "Launching new products",
  "Limited online presence",
  "Pricing & margins",
  "Fundraising / investment",
  "Team & hiring",
  "Don't know where to start",
] as const;

export interface ServiceMeta {
  name: ServiceName;
  tagline: string;
  description: string;
  bestFor: string;
  icon: LucideIcon;
}

// Canonical Soulful Labs programs. Descriptions are grounded in the standard
// meaning of each program type and are easy to tune to Soulful Labs' exact copy.
export const SERVICES: Record<ServiceName, ServiceMeta> = {
  Incubation: {
    name: "Incubation",
    tagline: "0 → 1",
    description:
      "Turn an idea or early business into something real — brand, product, and a validated foundation, built with hands-on guidance.",
    bestFor: "Idea-stage and pre-launch founders",
    icon: Rocket,
  },
  Acceleration: {
    name: "Acceleration",
    tagline: "1 → 10",
    description:
      "Scale a business that already has traction — growth strategy, distribution, and go-to-market firepower to move faster.",
    bestFor: "Businesses with early traction ready to scale",
    icon: TrendingUp,
  },
  "AI Tools": {
    name: "AI Tools",
    tagline: "Automate",
    description:
      "Ready-to-use AI products and automations that remove manual work across marketing, operations, sales, and support.",
    bestFor: "Any business losing time to repetitive work",
    icon: Bot,
  },
  "Projects & Consulting": {
    name: "Projects & Consulting",
    tagline: "Custom",
    description:
      "Bespoke builds and expert strategy for a specific, high-stakes need — from custom software to a focused growth engagement.",
    bestFor: "Teams with a defined project or strategic challenge",
    icon: Wrench,
  },
};

export const SERVICE_ORDER: ServiceName[] = [
  "Incubation",
  "Acceleration",
  "AI Tools",
  "Projects & Consulting",
];

// Where to send visitors who want to talk to Soulful Labs.
export const CONSULTATION_URL = "https://soulfullabs.ai/contact";
