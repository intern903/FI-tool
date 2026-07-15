/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFAF5",
          100: "#F7EDE2",
          200: "#F0E1CF",
        },
        sun: {
          100: "#FCEBCB",
          300: "#F6BD60",
          500: "#E09F33",
          700: "#C97E13",
          900: "#8A5406",
        },
        blush: {
          100: "#FBE9E5",
          300: "#F5CAC3",
          500: "#E9A198",
        },
        sage: {
          100: "#E4ECE9",
          300: "#AEC4BD",
          500: "#84A59D",
          700: "#5F827A",
          900: "#3C554F",
        },
        coral: {
          100: "#FCE4E1",
          300: "#F7ABA9",
          500: "#F28482",
          700: "#D5484F",
          900: "#A32E3C",
        },
        ink: {
          900: "#1D1A17",
          700: "#3D3833",
          500: "#6B645C",
          400: "#8A8279",
          300: "#B3ABA1",
        },
        teal: {
          chart: "#0F8A70",
        },
      },
      fontFamily: {
        display: ["'Inter Tight'", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(29,26,23,0.04), 0 4px 16px rgba(29,26,23,0.06)",
        lift: "0 2px 4px rgba(29,26,23,0.05), 0 12px 32px rgba(29,26,23,0.10)",
        glow: "0 0 0 4px rgba(242,132,130,0.15), 0 8px 24px rgba(242,132,130,0.25)",
        "input-glow": "0 0 0 4px rgba(132,165,157,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
