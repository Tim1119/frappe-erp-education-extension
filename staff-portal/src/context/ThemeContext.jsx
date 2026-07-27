import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_COLOR,
  DEFAULT_MODE,
  STORAGE_KEY_COLOR,
  STORAGE_KEY_MODE,
  applyPreset,
} from "@/config/themes";

const ThemeContext = createContext(null);

function getInitialMode() {
  try {
    return localStorage.getItem(STORAGE_KEY_MODE) || DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

function getInitialColor() {
  try {
    return localStorage.getItem(STORAGE_KEY_COLOR) || DEFAULT_COLOR;
  } catch {
    return DEFAULT_COLOR;
  }
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(getInitialMode);
  const [colorKey, setColorKeyState] = useState(getInitialColor);

  // Apply class + CSS vars on every change
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    applyPreset(colorKey, mode);
  }, [mode, colorKey]);

  const setMode = useCallback((m) => {
    setModeState(m);
    try { localStorage.setItem(STORAGE_KEY_MODE, m); } catch { /* noop */ }
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem(STORAGE_KEY_MODE, next); } catch { /* noop */ }
      return next;
    });
  }, []);

  const setColorKey = useCallback((key) => {
    setColorKeyState(key);
    try { localStorage.setItem(STORAGE_KEY_COLOR, key); } catch { /* noop */ }
  }, []);

  const value = useMemo(
    () => ({ mode, colorKey, setMode, toggleMode, setColorKey }),
    [mode, colorKey, setMode, toggleMode, setColorKey],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
