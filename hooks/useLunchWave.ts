"use client";

import { useState, useEffect, useCallback } from "react";
import type { LunchWave } from "@/lib/schedule";

const STORAGE_KEY = "lakerwatch-lunch-wave";
const EVENT_NAME = "lakerwatch-lunch-wave-change";

function read(): LunchWave {
  if (typeof window === "undefined") return "11/12";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "9/10" || stored === "11/12" ? stored : "11/12";
}

export function useLunchWave() {
  const [lunchWave, setLunchWave] = useState<LunchWave>(read);

  useEffect(() => {
    const handler = () => setLunchWave(read());
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const setWave = useCallback((wave: LunchWave) => {
    setLunchWave(wave);
    localStorage.setItem(STORAGE_KEY, wave);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  const toggle = useCallback(() => {
    const next: LunchWave = read() === "9/10" ? "11/12" : "9/10";
    setWave(next);
  }, [setWave]);

  return { lunchWave, setWave, toggle };
}
