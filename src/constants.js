export const CAT_META = {
  all:         { emoji: "◈", color: "#C8FF47" },
  snacks:      { emoji: "🍫", color: "#F4A942" },
  drinks:      { emoji: "☕", color: "#60C3F5" },
  restaurants: { emoji: "🍽", color: "#F07070" },
  cafes:       { emoji: "🥐", color: "#C084FC" },
  groceries:   { emoji: "🛒", color: "#34D399" },
};

export const DIET_TAGS = [
  { id: "vegetarian",    label: "Vegetarian"   },
  { id: "vegan",         label: "Vegan"         },
  { id: "gluten-free",   label: "Gluten-free"   },
  { id: "non-alcoholic", label: "Non-alcoholic" },
  { id: "halal",         label: "Halal"         },
  { id: "nut-free",      label: "Nut-free"      },
];

export const PRICE_RANGE = [
  { id: "cheap",  label: "Cheap",  symbol: "£"   },
  { id: "fair",   label: "Fair",   symbol: "££"  },
  { id: "pricey", label: "Pricey", symbol: "£££" },
];

export const SCORE_META = [
  { value: 0, label: "Pass",                short: "Pass"      },
  { value: 1, label: "Legit",               short: "Legit"     },
  { value: 2, label: "Big Legit",           short: "Big Legit" },
  { value: 3, label: "Certified Legit Buy", short: "Certified" },
];

export const SCORE_COLORS = ["#808080", "#60C3F5", "#F4A942", "#C8FF47"];

export const SCORE_HINTS = [
  "No recommendation",
  "Worth picking up",
  "Genuinely great",
  "Stop what you're doing and buy this",
];

export function priceSymbol(range) {
  return PRICE_RANGE.find(p => p.id === range)?.symbol ?? "";
}

// Rate limiter constants
export const SUBMISSION_KEY = "lb_submissions";
export const RATE_LIMIT = 3;
export const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

export function getRecentSubmissions() {
  try {
    const raw = localStorage.getItem(SUBMISSION_KEY);
    const timestamps = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - RATE_WINDOW_MS;
    return timestamps.filter(t => t > cutoff);
  } catch { return []; }
}

export function recordSubmission() {
  try {
    const recent = getRecentSubmissions();
    localStorage.setItem(SUBMISSION_KEY, JSON.stringify([...recent, Date.now()]));
  } catch {}
}

export function canSubmit() {
  return getRecentSubmissions().length < RATE_LIMIT;
}
