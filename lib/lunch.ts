// --- Flik API raw types ---

export type FlikFood = {
  name: string;
  description?: string | null;
  rounded_nutrition_info?: {
    calories?: number | null;
    g_protein?: number | null;
  } | null;
  icons?: {
    food_icons?: { synced_name?: string; custom_icon_url?: string | null }[];
  } | null;
  serving_size_info?: {
    serving_size_amount?: string | null;
    serving_size_unit?: string | null;
  } | null;
};

export type FlikMenuItem = {
  is_section_title?: boolean;
  text?: string;
  food?: FlikFood | null;
};

export type FlikDay = {
  date: string;
  menu_items: FlikMenuItem[];
};

// --- Processed types for the frontend ---

export type LunchItem = {
  name: string;
  description?: string;
  calories?: number;
  allergens: string[];
};

export type LunchStation = {
  name: string;
  items: LunchItem[];
};

export type LunchDayMenu = {
  date: string;
  dayName: string;
  stations: LunchStation[];
};

// --- Utilities ---

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getWeekSunday(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return formatLunchDate(d);
}

export function formatLunchDate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDayName(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return DAY_NAMES[d.getDay()];
}

export function parseFlikDay(day: FlikDay): LunchStation[] {
  const stations: LunchStation[] = [];
  let current: LunchStation | null = null;

  for (const item of day.menu_items ?? []) {
    if (item.is_section_title && item.text) {
      current = { name: item.text, items: [] };
      stations.push(current);
    } else if (item.food && current) {
      current.items.push({
        name: item.food.name,
        description: item.food.description || undefined,
        calories: item.food.rounded_nutrition_info?.calories ?? undefined,
        allergens: (item.food.icons?.food_icons ?? [])
          .map((i) => i.synced_name ?? "")
          .filter(Boolean),
      });
    }
  }

  return stations.filter((s) => s.items.length > 0);
}

export function getTodayIndex(days: FlikDay[]): number {
  const today = formatLunchDate(new Date());
  const idx = days.findIndex((d) => d.date === today);
  if (idx !== -1) return idx;
  // Default to Monday (index 1) if today isn't in the array
  return 1;
}

export function getWeekdayDays(days: FlikDay[]): FlikDay[] {
  return days.filter((d) => {
    const dow = new Date(d.date + "T12:00:00").getDay();
    return dow >= 1 && dow <= 5;
  });
}
