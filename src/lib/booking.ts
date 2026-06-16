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
}

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

// Working hours per type (UK time) come from admin settings. On Thu/Fri the
// daytime is reserved for face-to-face, so online opens only from the evening
// threshold (online_thu_fri_from_hour).
export function slotsFor(
  id: ConsultationId,
  durationMinutes: number,
  date: Date,
  s: AppSettings
): string[] {
  const start = id === "online" ? s.online_start_hour : s.f2f_start_hour;
  const lastStart = id === "online" ? s.online_last_hour : s.f2f_last_hour;
  const step = durationMinutes > 0 ? durationMinutes : 30;
  const dow = date.getDay();
  const slots: string[] = [];
  for (let mins = start * 60; mins <= lastStart * 60; mins += step) {
    if (id === "online" && (dow === 4 || dow === 5) && mins < s.online_thu_fri_from_hour * 60) continue;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return slots;
}

// Face-to-face: only the admin's enabled weekdays (Thu/Fri). Online: any day.
export function weekdaysForType(id: ConsultationId, s: AppSettings): number[] {
  if (id === "online") return [0, 1, 2, 3, 4, 5, 6];
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
