import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS, DEFAULT_ONLINE_DAY_HOURS, type AppSettings, type DayHours } from "@/lib/booking";

// Coerces whatever is stored in the `online_day_hours` jsonb column into a
// clean 7-entry array (0=Sun..6=Sat), falling back to the defaults per day so
// a missing column or a malformed value never breaks the booking page.
function normalizeDayHours(raw: unknown): DayHours[] {
  const arr = Array.isArray(raw) ? raw : [];
  return DEFAULT_ONLINE_DAY_HOURS.map((def, i) => {
    const v = arr[i] as Partial<DayHours> | undefined;
    if (!v || typeof v !== "object") return { ...def };
    const open = Number(v.open);
    const close = Number(v.close);
    return {
      open: Number.isFinite(open) ? open : def.open,
      close: Number.isFinite(close) ? close : def.close,
      closed: !!v.closed,
    };
  });
}

// Reads admin settings. Falls back to defaults if the table/row is missing.
export async function getSettings(): Promise<AppSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
    if (!data) return DEFAULT_SETTINGS;
    return {
      face_to_face_price: Number(data.face_to_face_price),
      face_to_face_duration: Number(data.face_to_face_duration),
      online_price: Number(data.online_price),
      online_duration: Number(data.online_duration),
      thursday_enabled: !!data.thursday_enabled,
      friday_enabled: !!data.friday_enabled,
      f2f_start_hour: Number(data.f2f_start_hour ?? DEFAULT_SETTINGS.f2f_start_hour),
      f2f_last_hour: Number(data.f2f_last_hour ?? DEFAULT_SETTINGS.f2f_last_hour),
      online_start_hour: Number(data.online_start_hour ?? DEFAULT_SETTINGS.online_start_hour),
      online_last_hour: Number(data.online_last_hour ?? DEFAULT_SETTINGS.online_last_hour),
      online_thu_fri_from_hour: Number(data.online_thu_fri_from_hour ?? DEFAULT_SETTINGS.online_thu_fri_from_hour),
      online_day_hours: normalizeDayHours(data.online_day_hours),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getBlockedDates(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("blocked_dates").select("date").order("date");
    return (data ?? []).map((r: { date: string }) => r.date);
  } catch {
    return [];
  }
}
