"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicAnnouncement } from "@/lib/types/announcements";
import type { SchoolConfig } from "@/lib/types/config";

const POLL_INTERVAL_MS = 5000;

export function useAnnouncements(
  config: SchoolConfig["announcements"]
): PublicAnnouncement[] {
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>([]);
  const lastJson = useRef("");

  const poll = useCallback(() => {
    if (!config?.enabled) return;

    const url = `${config.apiUrl.replace(/\/$/, "")}/api/public/announcements/${config.slug}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PublicAnnouncement[]) => {
        if (!Array.isArray(data)) return;
        const json = JSON.stringify(data);
        if (json !== lastJson.current) {
          lastJson.current = json;
          setAnnouncements(data);
        }
      })
      .catch(() => {});
  }, [config]);

  useEffect(() => {
    if (!config?.enabled) return;
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [config, poll]);

  // When disabled, always return empty — avoids stale data if re-enabled later
  // with a different config without a full remount clearing state.
  if (!config?.enabled) return [];

  return announcements;
}
