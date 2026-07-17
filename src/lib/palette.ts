// Chart colors validated for CVD safety and 3:1 contrast on white/cream
// (see dataviz palette validation). Charts use at most these two categorical
// hues; competitor context rows use neutral grays with direct labels + table.
export const chart = {
  primary: "#0F8A70", // teal — "You" / primary series
  secondary: "#C97E13", // ochre — second series
  neutralA: "#8A8279",
  neutralB: "#B3ABA1",
  neutralC: "#CFC8BE",
  grid: "#EDE7DD",
  axis: "#8A8279",
} as const;

// Priority/status colors ship with a text label + icon, never color alone.
export const priority = {
  High: { text: "#A32E3C", bg: "#FCE4E1", dot: "#D5484F" },
  Medium: { text: "#8A5406", bg: "#FCEBCB", dot: "#C97E13" },
  Low: { text: "#3C554F", bg: "#E4ECE9", dot: "#5F827A" },
} as const;

export function scoreColor(score: number): string {
  if (score >= 75) return chart.primary;
  if (score >= 50) return "#C97E13";
  return "#D5484F";
}

// Audit check statuses ship with an icon + label, never color alone.
export const status = {
  pass: { text: "#3C554F", bg: "#E4ECE9", dot: "#0F8A70" },
  warn: { text: "#8A5406", bg: "#FCEBCB", dot: "#C97E13" },
  fail: { text: "#A32E3C", bg: "#FCE4E1", dot: "#D5484F" },
  na: { text: "#6B645C", bg: "#F0E1CF", dot: "#B3ABA1" },
} as const;
