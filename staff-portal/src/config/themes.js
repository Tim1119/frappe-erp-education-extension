/**
 * Predefined colour presets.
 *
 * Each preset overrides --primary, --ring, and sidebar/background tints
 * for both light and dark modes. The sidebar and layout backgrounds get
 * a subtle tint of the accent colour so the whole UI feels cohesive
 * without making buttons blend into the background.
 *
 * Stored in localStorage under "staff-portal-theme-color".
 * The light/dark mode itself is stored under "staff-portal-theme-mode".
 *
 * hue = the HSL hue of the accent. Used to generate tinted surfaces.
 */

/**
 * Predefined colour presets.
 *
 * Each preset tints EVERY surface in the app — main background, cards,
 * muted panels, borders, and the sidebar — with the accent hue, at a
 * saturation/lightness low enough to stay readable while still making
 * the whole UI feel cohesively themed. Buttons and other --primary
 * elements stay at full saturation so they never blend into the tinted
 * background.
 *
 * Stored in localStorage under "staff-portal-theme-color".
 * The light/dark mode itself is stored under "staff-portal-theme-mode".
 */

function preset(key, label, swatch, hue, lightPrimary, darkPrimary) {
  return {
    key, label, swatch, hue,
    light: {
      primary: lightPrimary,
      ring: lightPrimary,
      background: `${hue} 30% 97%`,
      card: `${hue} 25% 99%`,
      popover: `${hue} 25% 99%`,
      muted: `${hue} 20% 93%`,
      mutedForeground: `${hue} 10% 42%`,
      accentBg: `${hue} 35% 92%`,
      accentForeground: `${hue} 30% 18%`,
      border: `${hue} 20% 89%`,
      input: `${hue} 20% 89%`,
      sidebarBg: `${hue} 28% 96%`,
      sidebarAccent: `${hue} 32% 91%`,
      sidebarBorder: `${hue} 20% 88%`,
      sidebarForeground: `${hue} 20% 22%`,
    },
    dark: {
      primary: darkPrimary || lightPrimary,
      ring: darkPrimary || lightPrimary,
      background: `${hue} 28% 5%`,
      card: `${hue} 24% 7%`,
      popover: `${hue} 24% 8%`,
      muted: `${hue} 20% 12%`,
      mutedForeground: `${hue} 12% 62%`,
      accentBg: `${hue} 25% 14%`,
      accentForeground: `${hue} 15% 85%`,
      border: `${hue} 20% 15%`,
      input: `${hue} 20% 15%`,
      sidebarBg: `${hue} 30% 4%`,
      sidebarAccent: `${hue} 25% 11%`,
      sidebarBorder: `${hue} 20% 13%`,
      sidebarForeground: `${hue} 15% 80%`,
    },
  };
}

export const COLOR_PRESETS = [
  preset("blue",    "Blue",    "#2563eb", 217, "217 91% 60%"),
  preset("sky",     "Sky",     "#0ea5e9", 199, "199 89% 48%"),
  preset("cyan",    "Cyan",    "#06b6d4", 188, "188 94% 43%"),
  preset("indigo",  "Indigo",  "#6366f1", 239, "239 84% 67%"),
  preset("violet",  "Violet",  "#8b5cf6", 258, "258 90% 66%"),
  preset("purple",  "Purple",  "#a855f7", 271, "271 91% 65%"),
  preset("fuchsia", "Fuchsia", "#d946ef", 292, "292 84% 61%"),
  preset("pink",    "Pink",    "#ec4899", 330, "330 81% 60%"),
  preset("rose",    "Rose",    "#f43f5e", 350, "350 89% 60%"),
  preset("red",     "Red",     "#ef4444", 0,   "0 84% 60%",   "0 72% 51%"),
  preset("orange",  "Orange",  "#f97316", 25,  "25 95% 53%"),
  preset("amber",   "Amber",   "#f59e0b", 38,  "38 92% 50%"),
  preset("emerald", "Emerald", "#10b981", 160, "160 84% 39%"),
  preset("green",   "Green",   "#22c55e", 142, "142 71% 45%"),
  preset("teal",    "Teal",    "#14b8a6", 173, "173 80% 40%"),
  preset("slate",   "Slate",   "#64748b", 215, "215 16% 47%", "215 20% 65%"),
];

export const DEFAULT_COLOR = "blue";
export const DEFAULT_MODE = "dark";

export const STORAGE_KEY_COLOR = "staff-portal-theme-color";
export const STORAGE_KEY_MODE = "staff-portal-theme-mode";

/** Look up a preset by its key string. */
export function getPreset(key) {
  return COLOR_PRESETS.find((p) => p.key === key) || COLOR_PRESETS[0];
}

/**
 * Apply a colour preset to the document by setting CSS custom properties
 * on :root. This is called once on boot and whenever the user picks a new
 * preset. The mode ("light"/"dark") is handled separately via a class on
 * <html>.
 *
 * Two layers of variables are set:
 *
 * 1. shadcn-style tokens (--primary, --background, --card, --border, etc.)
 *    stored as raw "H S% L%" triples, consumed via hsl(var(--x)) in
 *    Tailwind classes and tailwind.config.js.
 *
 * 2. Legacy design-system tokens (--brand, --ink, --surface-2, --success,
 *    --danger-soft, etc.) that the original page components reference
 *    directly in inline styles, e.g. `color: "var(--ink-3)"` or
 *    `border: "1px solid var(--border)"`. These MUST be fully-resolved
 *    hsl(...) colour strings (not raw triples) since inline styles use
 *    them as-is with no wrapping hsl(). Semantic colours (success/
 *    warning/danger/info) stay FIXED green/amber/red/blue regardless of
 *    the chosen accent, so e.g. an "Approved" badge is always green.
 */
export function applyPreset(presetKey, mode) {
  const preset = getPreset(presetKey);
  const v = mode === "dark" ? preset.dark : preset.light;
  const isDark = mode === "dark";
  const root = document.documentElement;

  const set = (name, value) => root.style.setProperty(name, value);
  const hsl = (triple) => `hsl(${triple})`;

  // ── Layer 1: shadcn tokens (raw triples) ─────────────────────────────
  set("--primary", v.primary);
  set("--ring", v.ring);
  set("--background", v.background);
  set("--card", v.card);
  set("--card-foreground", isDark ? "220 20% 96%" : "228 40% 6%");
  set("--popover", v.popover);
  set("--popover-foreground", isDark ? "220 20% 96%" : "228 40% 6%");
  set("--muted", v.muted);
  set("--muted-foreground", v.mutedForeground);
  set("--accent", v.accentBg);
  set("--accent-foreground", v.accentForeground);
  set("--border", v.border);
  set("--input", v.input);

  set("--sidebar-background", v.sidebarBg);
  set("--sidebar-foreground", v.sidebarForeground);
  set("--sidebar-accent", v.sidebarAccent);
  set("--sidebar-accent-foreground", v.sidebarForeground);
  set("--sidebar-border", v.sidebarBorder);
  set("--sidebar-primary", v.primary);
  set("--sidebar-ring", v.ring);

  // ── Layer 2: legacy tokens (fully-resolved hsl() colours) ────────────
  const { hue } = preset;

  // Brand — the accent colour itself, in various strengths
  set("--brand", hsl(v.primary));
  set("--brand-2", hsl(v.primary)); // secondary accent alias (kept identical — most usages just want "the accent")
  set("--brand-3", hsl(isDark ? `${hue} 91% 70%` : `${hue} 91% 45%`)); // slightly lighter/darker for hover states
  set("--brand-soft", hsl(isDark ? `${hue} 40% 16%` : `${hue} 90% 95%`)); // soft tinted background for badges/chips
  set("--brand-ink", hsl(isDark ? `${hue} 91% 75%` : `${hue} 80% 38%`)); // readable text on brand-soft bg

  // Ink — text hierarchy (foreground → increasingly muted)
  set("--ink", hsl(isDark ? "220 20% 96%" : "228 40% 6%"));
  set("--ink-2", hsl(isDark ? "220 15% 82%" : `${hue} 15% 30%`));
  set("--ink-3", hsl(v.mutedForeground));
  set("--ink-4", hsl(isDark ? `${hue} 10% 45%` : `${hue} 10% 65%`));

  // Surface — card/panel background variants
  set("--surface", hsl(v.card));
  set("--surface-2", hsl(v.muted));
  set("--surface-3", hsl(v.accentBg));
  set("--surface-4", hsl(isDark ? `${hue} 22% 18%` : `${hue} 22% 88%`));

  // Semantic colours — ALWAYS green/amber/red/blue, regardless of accent,
  // so status meaning (approved/pending/rejected) stays universally clear.
  set("--success", hsl(isDark ? "160 70% 45%" : "160 84% 32%"));
  set("--success-soft", hsl(isDark ? "160 45% 14%" : "160 70% 94%"));
  set("--success-ink", hsl(isDark ? "160 70% 70%" : "160 84% 26%"));

  set("--warning", hsl(isDark ? "38 92% 55%" : "38 92% 42%"));
  set("--warning-soft", hsl(isDark ? "38 60% 14%" : "38 92% 94%"));
  set("--warning-ink", hsl(isDark ? "38 92% 75%" : "38 80% 32%"));

  set("--danger", hsl(isDark ? "0 72% 58%" : "0 72% 48%"));
  set("--danger-soft", hsl(isDark ? "0 45% 15%" : "0 84% 95%"));
  set("--danger-ink", hsl(isDark ? "0 80% 78%" : "0 72% 40%"));

  set("--info", hsl(isDark ? "205 90% 60%" : "205 90% 45%"));
  set("--info-soft", hsl(isDark ? "205 50% 15%" : "205 90% 95%"));

  set("--purple", hsl(isDark ? "258 80% 72%" : "258 80% 58%"));
  set("--purple-soft", hsl(isDark ? "258 40% 16%" : "258 80% 95%"));
}
