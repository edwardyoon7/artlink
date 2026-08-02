"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  BG_THEME_STORAGE_KEY,
  DEFAULT_BG_THEME,
  isBgTheme,
  type BgTheme,
} from "@/lib/theme";

const ThemeContext = createContext<{
  theme: BgTheme;
  setTheme: (theme: BgTheme) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<BgTheme>(DEFAULT_BG_THEME);

  useEffect(() => {
    const stored = localStorage.getItem(BG_THEME_STORAGE_KEY);
    if (isBgTheme(stored)) {
      setThemeState(stored);
    }
  }, []);

  function setTheme(next: BgTheme) {
    setThemeState(next);
    localStorage.setItem(BG_THEME_STORAGE_KEY, next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useBgTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useBgTheme must be used within a ThemeProvider");
  }
  return ctx;
}
