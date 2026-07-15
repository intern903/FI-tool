import { useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  AtSign,
  Briefcase,
  Camera,
  ChevronDown,
  Globe,
  MapPin,
  Play,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import {
  analyzeInputSchema,
  type AnalyzeFormValues,
  type AnalyzeInput,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { ParticleField } from "./ParticleField";

interface HeroProps {
  onAnalyze: (input: AnalyzeInput) => void;
  analyzing: boolean;
  error?: string | null;
}

interface FieldSpec {
  name: keyof AnalyzeFormValues;
  label: string;
  placeholder: string;
  icon: typeof Globe;
  optional?: boolean;
}

const PRIMARY_FIELDS: FieldSpec[] = [
  {
    name: "googleMapsUrl",
    label: "Google Maps URL",
    placeholder: "https://maps.google.com/…",
    icon: MapPin,
  },
  {
    name: "websiteUrl",
    label: "Website URL",
    placeholder: "https://yourbusiness.com",
    icon: Globe,
  },
];

const SOCIAL_FIELDS: FieldSpec[] = [
  { name: "instagram", label: "Instagram", placeholder: "instagram.com/yourbusiness", icon: Camera, optional: true },
  { name: "facebook", label: "Facebook", placeholder: "facebook.com/yourbusiness", icon: ThumbsUp, optional: true },
  { name: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/company/yourbusiness", icon: Briefcase, optional: true },
  { name: "youtube", label: "YouTube", placeholder: "youtube.com/@yourbusiness", icon: Play, optional: true },
];

function Field({
  spec,
  register,
  focused,
  onFocus,
  onBlur,
}: {
  spec: FieldSpec;
  register: UseFormRegister<AnalyzeFormValues>;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const Icon = spec.icon;
  const reg = register(spec.name);
  return (
    <div>
      <label
        htmlFor={spec.name}
        className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-500"
      >
        {spec.label}
        {spec.optional && <span className="font-normal text-ink-300">optional</span>}
      </label>
      <div
        className={cn(
          "relative flex items-center rounded-xl border bg-white transition-all duration-200 ease-out",
          focused
            ? "border-sage-500 shadow-input-glow"
            : "border-ink-900/10 hover:border-ink-900/20"
        )}
      >
        <Icon
          className={cn(
            "ml-3.5 h-4 w-4 shrink-0 transition-colors duration-200",
            focused ? "text-sage-700" : "text-ink-300"
          )}
        />
        <input
          id={spec.name}
          type="text"
          inputMode="url"
          autoComplete="off"
          placeholder={spec.placeholder}
          className="h-12 w-full bg-transparent px-3 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none"
          {...reg}
          onFocus={onFocus}
          onBlur={(e) => {
            reg.onBlur(e);
            onBlur();
          }}
        />
        <AnimatePresence>
          {focused && (
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
  );
}

export function Hero({ onAnalyze, analyzing, error }: HeroProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSocials, setShowSocials] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnalyzeFormValues, unknown, AnalyzeInput>({
    resolver: zodResolver(analyzeInputSchema),
  });

  return (
    <section className="relative overflow-hidden">
      <ParticleField />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cream-100/80 to-transparent" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white/80 px-4 py-1.5 text-xs font-semibold text-ink-700 shadow-soft backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-sun-500" />
          AI growth audits for local businesses
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
          className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl"
        >
          Grow your business
          <br />
          <span className="text-sage-700">with AI.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="mt-5 max-w-md text-base text-ink-500 sm:text-lg"
        >
          Paste your Google Business Profile or website.
          <br />
          Get a complete AI growth audit in minutes.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
          onSubmit={handleSubmit(onAnalyze)}
          className="glass mt-10 w-full rounded-2xl p-5 text-left shadow-lift sm:p-6"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {PRIMARY_FIELDS.map((spec) => (
              <Field
                key={spec.name}
                spec={spec}
                register={register}
                focused={focusedField === spec.name}
                onFocus={() => setFocusedField(spec.name)}
                onBlur={() => setFocusedField(null)}
              />
            ))}
          </div>

          {errors.googleMapsUrl && (
            <p role="alert" className="mt-3 text-sm font-medium text-coral-700">
              {errors.googleMapsUrl.message}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-coral-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => setShowSocials((s) => !s)}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-ink-500 transition-colors hover:text-ink-900"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                showSocials && "rotate-180"
              )}
            />
            {showSocials ? "Hide social profiles" : "Add social profiles (optional)"}
          </button>

          <AnimatePresence initial={false}>
            {showSocials && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="grid gap-4 pt-4 sm:grid-cols-2">
                  {SOCIAL_FIELDS.map((spec) => (
                    <Field
                      key={spec.name}
                      spec={spec}
                      register={register}
                      focused={focusedField === spec.name}
                      onFocus={() => setFocusedField(spec.name)}
                      onBlur={() => setFocusedField(null)}
                    />
                  ))}
                  <div className="sm:col-span-2">
                    <Field
                      spec={{
                        name: "x",
                        label: "X (Twitter)",
                        placeholder: "x.com/yourbusiness",
                        icon: AtSign,
                        optional: true,
                      }}
                      register={register}
                      focused={focusedField === "x"}
                      onFocus={() => setFocusedField("x")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={analyzing}
            layout
            className="ripple-host group mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink-900 text-base font-semibold text-white shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sage-300/50 disabled:pointer-events-none"
          >
            <Sparkles className="h-5 w-5 text-sun-300" />
            {analyzing ? "Analyzing…" : "Analyze Business"}
            <ArrowRight className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-[3px]" />
          </motion.button>

          <p className="mt-3 text-center text-xs text-ink-400">
            Free audit · No sign-up · Takes 20–40 seconds
          </p>
        </motion.form>
      </div>
    </section>
  );
}
