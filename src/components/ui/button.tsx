import { forwardRef, useCallback, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "ripple-host inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sage-300/50 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-ink-900 text-white shadow-soft hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0",
        secondary:
          "border border-ink-900/10 bg-white text-ink-900 shadow-soft hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0",
        ghost: "text-ink-700 hover:bg-ink-900/5",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, onClick, ...props }, ref) => {
    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const d = Math.max(rect.width, rect.height);
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = `${d}px`;
        ripple.style.left = `${e.clientX - rect.left - d / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - d / 2}px`;
        btn.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 550);
        onClick?.(e);
      },
      [onClick]
    );
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
