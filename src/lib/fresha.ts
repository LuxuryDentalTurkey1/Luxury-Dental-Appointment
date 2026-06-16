// Server-only: pulls the clinic's Fresha appointments (public iCal feed) and
// mirrors the FUTURE ones into `time_blocks`, so Fresha bookings show as
// occupied in our booking flow. Takes a Supabase client so it can run either
// under the admin's session (the manual button) or a service-role client (cron).

import { DateTime } from "luxon";
import type { SupabaseClient } from "@supabase/supabase-js";

const FRESHA_NOTE = "Fresha booking";

interface ICalEvent {
  start: string;
  end: string;
}

function parseICal(text: string): ICalEvent[] {
  // Unfold continuation lines (iCal folds long lines with a leading space/tab).
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);
  const events: ICalEvent[] = [];
  let cur: Partial<ICalEvent> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT") {
      if (cur && cur.start && cur.end) events.push(cur as ICalEvent);
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const name = line.slice(0, idx).split(";")[0];
      const val = line.slice(idx + 1);
      if (name === "DTSTART") cur.start = val;
      else if (name === "DTEND") cur.end = val;
    }
  }
  return events;
}

// "20260618T150000Z" (UTC) or floating "20260618T150000" -> UK-local DateTime.
function toUk(v: string): DateTime {
  const isUtc = v.endsWith("Z");
  const s = v.replace("Z", "");
  return DateTime.fromFormat(s, "yyyyLLdd'T'HHmmss", {
    zone: isUtc ? "utc" : "Europe/London",
  }).setZone("Europe/London");
}

export async function syncFreshaBlocks(supabase: SupabaseClient) {
  const url = process.env.FRESHA_ICAL_URL;
  if (!url) return { ok: false as const, error: "Fresha calendar link is not configured." };

  let text: string;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { ok: false as const, error: `Could not reach Fresha (${res.status}).` };
    text = await res.text();
  } catch {
    return { ok: false as const, error: "Could not reach Fresha." };
  }

  const now = DateTime.now().setZone("Europe/London");
  const rows = parseICal(text)
    .map((ev) => ({ s: toUk(ev.start), e: toUk(ev.end) }))
    .filter(({ s, e }) => s.isValid && e.isValid && e >= now)
    .map(({ s, e }) => ({
      date: s.toFormat("yyyy-LL-dd"),
      start_time: s.toFormat("HH:mm"),
      end_time: e.toFormat("HH:mm"),
      note: FRESHA_NOTE,
    }));

  // Replace the previous Fresha mirror (handles cancellations + moves cleanly).
  const del = await supabase.from("time_blocks").delete().eq("note", FRESHA_NOTE);
  if (del.error) return { ok: false as const, error: del.error.message };
  if (rows.length) {
    const ins = await supabase.from("time_blocks").insert(rows);
    if (ins.error) return { ok: false as const, error: ins.error.message };
  }
  return { ok: true as const, imported: rows.length };
}
