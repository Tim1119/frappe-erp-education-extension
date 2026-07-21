import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { chartTokens } from "../config/appConfig";

const UIContext = createContext(null);

function applyTheme(theme) {
  // Apply to <html> — this is what the CSS selectors target
  // Portals render into <body> which is a child of <html>, so they inherit
  document.documentElement.setAttribute("data-theme", theme);
  // Also keep .sync-root class on html for fallback
  document.documentElement.classList.add("sync-root");
}

export function UIProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem("staffportal_theme") || "light";
    // Apply immediately during initialization (before first render)
    applyTheme(saved);
    return saved;
  });

  const tk = chartTokens[theme] || chartTokens.dark;

  const setTheme = (next) => {
    setThemeState(next);
    localStorage.setItem("staffportal_theme", next);
    applyTheme(next);
  };

  // Re-apply on every theme change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, tk }), [theme, tk]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}
