"use client";

import { useState, useEffect, useCallback } from "react";
import config from "@/school.config";
import { storageKey } from "@/lib/storage";

export type LunchWave = string;

const lunchWaveConfig = config.lunchWaves;
const options = lunchWaveConfig.options;
const defaultWave = lunchWaveConfig.default || options[0]?.id || "";
const hasLunchWaves = options.length > 0;

const STORAGE_KEY = storageKey("lunch-wave");
const EVENT_NAME = storageKey("lunch-wave-change");

function read(): string {
  if (typeof window === "undefined") return defaultWave;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && options.some((o) => o.id === stored)) return stored;
  return defaultWave;
}

export function useLunchWave() {
  const [lunchWave, setLunchWave] = useState<string>(read);

  useEffect(() => {
    const handler = () => setLunchWave(read());
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const setWave = useCallback((wave: string) => {
    setLunchWave(wave);
    localStorage.setItem(STORAGE_KEY, wave);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  const toggle = useCallback(() => {
    const current = read();
    const currentIdx = options.findIndex((o) => o.id === current);
    const nextIdx = (currentIdx + 1) % options.length;
    setWave(options[nextIdx].id);
  }, [setWave]);

  return { lunchWave, setWave, toggle, options, hasLunchWaves };
}
