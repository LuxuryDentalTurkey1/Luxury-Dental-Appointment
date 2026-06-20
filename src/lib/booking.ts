import { DateTime } from "luxon";

export type ConsultationId = "face-to-face" | "online";

export interface ConsultationMeta {
  id: ConsultationId;
  label: string;
  blurb: string;
}

export const CONSULTATION_META: Record<ConsultationId, ConsultationMeta> = {
  "face-to-face": {
    id: "face-to-face",
    label: "Face-to-Face Consultation",
    blurb: "Meet our specialist in person in Bournemouth for a thorough assessment.",
  },
  online: {
    id: "online",
    label: "Online Video Consultation",
    blurb: "Speak with our specialist by video, from anywhere in the world.",
  },
};

// Online opening hours for one weekday. `open`/`close` are 24h UK hours where
// `open` is the first bookable hour and `close` is when the day ends (the last
// appointment must finish by `close`). `closed` shuts the whole day for online.
export interface DayHours {
  open: number;
  close: number;
  closed: boolean;
}

// Admin-editable settings (stored in the `settings` table)
export interface AppSettings {
  face_to_face_price: number;
  face_to_face_duration: number;
  online_price: number;
  online_duration: number;
  thursday_enabled: boolean;
  friday_enabled: boolean;
  f2f_start_hour: number;
  f2f_last_hour: number;
  online_start_hour: number;
  online_last_hour: number;
  online_thu_fri_from_hour: number;
  // Per-weekday online hours, indexed by JS getDay() (0=Sun ... 6=Sat).
  online_day_hours: DayHours[];
}

// Default online hours per weekday (0=Sun ... 6=Sat). Thu/Fri are evening-only
// (the daytime is kept for face-to-face); the others follow the day hours.
export const DEFAULT_ONLINE_DAY_HOURS: DayHours[] = [
  { open: 9, close: 21, closed: false }, // Sun
  { open: 9, close: 21, closed: false }, // Mon
  { open: 9, close: 20, closed: false }, // Tue
  { open: 9, close: 20, closed: false }, // Wed
  { open: 18, close: 21, closed: false }, // Thu
  { open: 18, close: 21, closed: false }, // Fri
  { open: 9, close: 17, closed: false }, // Sat
];

export const DEFAULT_SETTINGS: AppSettings = {
  face_to_face_price: 40,
  face_to_face_duration: 60,
  online_price: 15,
  online_duration: 30,
  thursday_enabled: true,
  friday_enabled: true,
  f2f_start_hour: 10,
  f2f_last_hour: 17,
  online_start_hour: 9,
  online_last_hour: 22,
  online_thu_fri_from_hour: 20,
  online_day_hours: DEFAULT_ONLINE_DAY_HOURS,
};

export interface Consultation {
  id: ConsultationId;
  label: string;
  blurb: string;
  duration: number;
  price: number;
}

export function buildConsultations(s: AppSettings): Record<ConsultationId, Consultation> {
  return {
    "face-to-face": {
      ...CONSULTATION_META["face-to-face"],
      duration: s.face_to_face_duration,
      price: s.face_to_face_price,
    },
    online: {
      ...CONSULTATION_META.online,
      duration: s.online_duration,
      price: s.online_price,
    },
  };
}

// JS getDay(): Sun=0 ... Sat=6. Thursday = 4, Friday = 5.
export function availableWeekdaysFrom(s: AppSettings): number[] {
  const days: number[] = [];
  if (s.thursday_enabled) days.push(4);
  if (s.friday_enabled) days.push(5);
  return days;
}

export const TREATMENTS = [
  "Dental Implants",
  "Veneers",
  "Crowns",
  "Full Mouth Restoration",
  "Smile Makeover",
  "Orthodontics",
  "General Consultation",
  "Other",
];

function fmtSlot(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Working hours per type (UK time) come from admin settings.
// FACE-TO-FACE uses a single daily window (f2f_start_hour .. f2f_last_hour, the
// last figure being the last START hour). ONLINE has its OWN hours for EACH
// weekday (online_day_hours, indexed 0=Sun..6=Sat): slots run from `open` and
// the last appointment must finish by `close`; a `closed` day has no slots.
export function slotsFor(
  id: ConsultationId,
  durationMinutes: number,
  date: Date,
  s: AppSettings
): string[] {
  const step = durationMinutes > 0 ? durationMinutes : 30;
  const dow = date.getDay();
  const slots: string[] = [];

  if (id === "online") {
    const dh = s.online_day_hours?.[dow] ?? DEFAULT_ONLINE_DAY_HOURS[dow];
    if (!dh || dh.closed) return [];
    const open = dh.open * 60;
    const close = dh.close * 60;
    // A slot is valid only if the whole appointment fits before `close`.
    for (let mins = open; mins + step <= close; mins += step) {
      slots.push(fmtSlot(mins));
    }
    return slots;
  }

  // Face-to-face: f2f_last_hour is the last START hour (inclusive).
  for (let mins = s.f2f_start_hour * 60; mins <= s.f2f_last_hour * 60; mins += step) {
    slots.push(fmtSlot(mins));
  }
  return slots;
}

// Face-to-face: only the admin's enabled weekdays (Thu/Fri). Online: any day
// that isn't marked closed in the per-weekday online hours.
export function weekdaysForType(id: ConsultationId, s: AppSettings): number[] {
  if (id === "online") {
    return [0, 1, 2, 3, 4, 5, 6].filter((d) => {
      const dh = s.online_day_hours?.[d] ?? DEFAULT_ONLINE_DAY_HOURS[d];
      return dh && !dh.closed && dh.open * 60 + (s.online_duration || 30) <= dh.close * 60;
    });
  }
  return availableWeekdaysFrom(s);
}

export function localZoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London";
  } catch {
    return "Europe/London";
  }
}

export interface SlotView {
  uk: string;
  local: string;
  differs: boolean;
}

export function ukSlotView(date: Date, ukTime: string): SlotView {
  const [h, m] = ukTime.split(":").map(Number);
  const uk = DateTime.fromObject(
    {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: h,
      minute: m,
    },
    { zone: "Europe/London" }
  );
  const local = uk.setZone(localZoneName());
  return {
    uk: ukTime,
    local: local.toFormat("HH:mm"),
    differs: local.offset !== uk.offset,
  };
}

export const COUNTRY_SUGGESTIONS = [
  "United Kingdom", "Ireland", "United States", "Canada", "Germany", "France",
  "Spain", "Italy", "Netherlands", "Belgium", "Switzerland", "Austria",
  "Sweden", "Norway", "Denmark", "Finland", "Portugal", "Greece", "Poland",
  "Czech Republic", "Romania", "Turkey", "United Arab Emirates", "Saudi Arabia",
  "Qatar", "Kuwait", "Australia", "New Zealand", "South Africa", "Nigeria",
  "Egypt", "Morocco", "Israel", "India", "Pakistan", "China", "Japan",
  "South Korea", "Singapore", "Malaysia", "Russia", "Ukraine", "Bulgaria",
  "Hungary", "Croatia", "Luxembourg",
];
