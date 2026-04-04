export type Period = {
  name: string;
  start: string; // "HH:MM" 24hr
  end: string;   // "HH:MM" 24hr
};

export type DayTypeConfig = {
  id: string;
  label: string;
  weekdays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
};

export type BellSchedule = {
  shared: Period[];
  lunchWaves?: Record<string, Period[]>;
  after: Period[];
};

export type DayTypeOverride = {
  date: string; // "YYYY-MM-DD"
  dayTypeId: string;
};

export type LunchWaveOption = {
  id: string;
  label: string;
};

export type CalendarDate = {
  date: string;    // "YYYY-MM-DD"
  name: string;
};

export type CalendarEvent = {
  date: string;    // "YYYY-MM-DD"
  name: string;
  type: string;    // "event" | "no-school" | "early-dismissal" | "exam" | "deadline"
  endDate?: string; // "YYYY-MM-DD" for multi-day events
};

export type SchoolConfig = {
  school: {
    name: string;
    shortName: string;
    acronym: string;
    mascot: string;
    appName: string;
    domain: string;
    logoPath: string;
    academicYear: string;
  };

  location: {
    city: string;
    state: string;
    stateCode: string;
    country: string;
  };

  colors: {
    primary: string;
    primaryLight: string;
    accent: string;
    accentLight: string;
    darkBg: string;
    darkSurface: string;
  };

  storagePrefix: string;

  schedule: {
    dayTypes: DayTypeConfig[];
    bells: Record<string, BellSchedule>;
    dayTypeOverrides: DayTypeOverride[];
  };

  lunchWaves: {
    options: LunchWaveOption[];
    default: string;
  };

  calendar: {
    noSchoolDates: CalendarDate[];
    earlyDismissalDates: CalendarDate[];
    events: CalendarEvent[];
  };

  features: {
    announcements: boolean;
    events: boolean;
    productivity: boolean;
  };
};
