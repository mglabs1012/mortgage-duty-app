import { useCallback, useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";

const STORAGE_KEY = "rj-duty-calc:theme";
const media = () => window.matchMedia("(prefers-color-scheme: dark)");

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* storage unavailable */
  }
  return "system";
}

/** Light / dark / system theme with persistence and live OS-change tracking. */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(readPref);
  const [systemDark, setSystemDark] = useState(() => media().matches);

  // Subscribe to OS theme changes (only matters while pref === "system").
  useEffect(() => {
    const mq = media();
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDark = pref === "dark" || (pref === "system" && systemDark);

  // Sync the derived theme out to the DOM.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const setTheme = useCallback((next: ThemePref) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
    setPref(next);
  }, []);

  const toggle = useCallback(() => setTheme(isDark ? "light" : "dark"), [isDark, setTheme]);

  return { pref, isDark, setTheme, toggle };
}
