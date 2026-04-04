"use client";

import { useCallback, useSyncExternalStore } from "react";
import { storageKey } from "@/lib/storage";

type Theme = "light" | "dark";

const THEME_KEY = storageKey("theme");

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

function getSnapshot(): Theme {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
    listeners.forEach((l) => l());
  }, [theme]);

  return { theme, toggleTheme, mounted };
}
