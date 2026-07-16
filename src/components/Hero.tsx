import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Globe, Sparkles } from "lucide-react";
import {
  analyzeInputSchema,
  type AnalyzeFormValues,
  type AnalyzeInput,
} from "@/lib/types";
import { CHALLENGES, GOALS, INDUSTRIES, STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ParticleField } from "./ParticleField";

interface HeroProps {
  onAnalyze: (input: AnalyzeInput) => void;
  analyzing: boolean;
  error?: string | null;
}

function Select({
  label,
  placeholder,
  options,
  registerProps,
}: {
  label: string;
  placeholder: string;
  options: readonly string[];
  registerProps: ReturnType<ReturnType<typeof useForm<AnalyzeFormValues>>["register"]>;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ink-500">{label}</label>
      <div className="relative">
        <select
          defaultValue=""
          className="h-12 w-full appearance-none rounded-xl border border-ink-900/10 bg-white px-3.5 text-sm text-ink-900 transition-all duration-200 ease-out hover:border-ink-900/20 focus:border-sage-500 focus:shadow-input-glow focus:outline-none"
          {...registerProps}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
      </div>
    </div>
  );
}

export function Hero({ onAnalyze, analyzing, error }: HeroProps) {
  const [websiteFocused, setWebsiteFocused] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [challenges, setChallenges] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnalyzeFormValues, unknown, AnalyzeInput>({
    resolver: zodResolver(analyzeInputSchema),
  });

  const toggleChallenge = (c: string) =>
    setChallenges((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const websiteReg = register("websiteUrl");

  return (
    <section className="relative overflow-hidden">
      <ParticleField />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cream-100/80 to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white/80 px-4 py-1.5 text-xs font-semibold text-ink-700 shadow-soft backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-sun-500" />
          AI business growth advisor · Soulful Labs
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
          className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl"
        >
          See what's possible
          <br />
          <span className="text-sage-700">for your business.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="mt-5 max-w-lg text-base text-ink-500 sm:text-lg"
        >
          Share your website and a few details. Get a personalized AI growth
          report — and the clear next step for your business.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
          onSubmit={handleSubmit((data) => onAnalyze({ ...data, challenges }))}
          className="glass mt-10 w-full rounded-2xl p-5 text-left shadow-lift sm:p-6"
          noValidate
        >
          {/* Website URL */}
          <div>
            <label htmlFor="websiteUrl" className="mb-1.5 block text-xs font-semibold text-ink-500">
              Website URL
            </label>
            <div
              className={cn(
                "relative flex items-center rounded-xl border bg-white transition-all duration-200 ease-out",
                websiteFocused ? "border-sage-500 shadow-input-glow" : "border-ink-900/10 hover:border-ink-900/20"
              )}
            >
              <Globe className={cn("ml-3.5 h-4 w-4 shrink-0 transition-colors", websiteFocused ? "text-sage-700" : "text-ink-300")} />
              <input
                id="websiteUrl"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder="https://yourbusiness.com"
                className="h-12 w-full bg-transparent px-3 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none"
                {...websiteReg}
                onFocus={() => setWebsiteFocused(true)}
                onBlur={(e) => {
                  websiteReg.onBlur(e);
                  setWebsiteFocused(false);
                }}
              />
              <AnimatePresence>
                {websiteFocused && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="mr-3.5"
                  >
                    <Sparkles className="h-4 w-4 text-sun-500" />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Industry + stage */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select label="Industry" placeholder="Select your industry" options={INDUSTRIES} registerProps={register("industry")} />
            <Select label="Business stage" placeholder="Select your stage" options={STAGES} registerProps={register("stage")} />
          </div>

          {/* Goal */}
          <div className="mt-4">
            <Select label="Primary goal" placeholder="What matters most right now?" options={GOALS} registerProps={register("goal")} />
          </div>

          {/* Challenges */}
          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold text-ink-500">
              Current challenges <span className="font-normal text-ink-300">select any</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CHALLENGES.map((c) => {
                const active = challenges.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChallenge(c)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-out",
                      active
                        ? "border-sage-500 bg-sage-100 text-sage-900"
                        : "border-ink-900/10 bg-white text-ink-500 hover:border-ink-900/20 hover:text-ink-900"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional business details */}
          <button
            type="button"
            onClick={() => setShowDetails((s) => !s)}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-ink-500 transition-colors hover:text-ink-900"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", showDetails && "rotate-180")} />
            {showDetails ? "Hide business details" : "No website? Describe your business instead"}
          </button>
          <AnimatePresence initial={false}>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <textarea
                  {...register("businessDetails")}
                  rows={4}
                  placeholder="Tell us what your business does, who you serve, and where you'd like to grow…"
                  className="mt-3 w-full resize-none rounded-xl border border-ink-900/10 bg-white p-3.5 text-sm text-ink-900 placeholder:text-ink-300 transition-all duration-200 ease-out hover:border-ink-900/20 focus:border-sage-500 focus:shadow-input-glow focus:outline-none"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {(errors.websiteUrl || error) && (
            <p role="alert" className="mt-3 text-sm font-medium text-coral-700">
              {errors.websiteUrl?.message ?? error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={analyzing}
            layout
            className="ripple-host group mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink-900 text-base font-semibold text-white shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sage-300/50 disabled:pointer-events-none"
          >
            <Sparkles className="h-5 w-5 text-sun-300" />
            {analyzing ? "Analyzing…" : "Analyze my business"}
            <ArrowRight className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-[3px]" />
          </motion.button>

          <p className="mt-3 text-center text-xs text-ink-400">
            Free · No sign-up · Takes 20–40 seconds
          </p>
        </motion.form>
      </div>
    </section>
  );
}
