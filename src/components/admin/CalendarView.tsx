"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { createClient } from "@/lib/supabase/client";
import {
  rescheduleBooking,
  updateBookingStatus,
  updateStaffNotes,
  addTimeBlock,
  removeTimeBlock,
  updateTimeBlock,
  resizeBooking,
  syncFresha,
  deleteBooking,
  autoCompletePast,
  refundBooking,
} from "@/app/admin/actions";
import ManualBookingForm from "./ManualBookingForm";
import ConfirmHost, { confirmDialog } from "./Confirm";
import type { BookingRow } from "@/lib/types";
import type { AppSettings } from "@/lib/booking";

const START_HOUR = 9;
const END_HOUR = 22;
const PX_PER_MIN = 1;

const STATUS_OPTIONS = [
  { v: "upcoming", label: "Upcoming" },
  { v: "completed", label: "Completed" },
  { v: "cancelled", label: "Cancelled" },
  { v: "no_show", label: "No Show" },
];

const fieldCls = "rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-gold";

interface TimeBlock {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  note: string | null;
}

interface DragState {
  mode: "create" | "resize" | "move";
  date: string;
  blockId?: string;
  bookingId?: string;
  duration?: number;
  anchorMin: number;
  topMin: number;
  botMin: number;
  moved?: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function isoOf(dt: Date) {
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}
function todayISO() {
  // UK "today" so the calendar follows the business timezone, not the viewer's.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
}
function addDaysISO(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return isoOf(dt);
}
function mondayOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - dow);
  return isoOf(dt);
}
function fullDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
function shortDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}
function weekLabel(start: string) {
  const f = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };
  return `${f(start)} – ${f(addDaysISO(start, 6))}`;
}
function mins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minToTime(m: number) {
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}
function snapMin(raw: number) {
  return Math.max(START_HOUR * 60, Math.min(END_HOUR * 60, Math.round(raw / 15) * 15));
}
function bookingColor(status: string, paid: boolean) {
  switch (status) {
    case "completed": return "border-green-300 bg-green-50 text-green-900";
    case "cancelled": return "border-red-200 bg-red-50 text-red-800 opacity-75";
    case "no_show": return "border-amber-300 bg-amber-50 text-amber-900";
    default: return paid ? "border-blue-300 bg-blue-50 text-blue-900" : "border-zinc-300 bg-zinc-50 text-zinc-700";
  }
}

type ViewMode = "day" | "week";
interface Column {
  key: string;
  title: string;
  date: string;
  highlight?: boolean;
  bookings: BookingRow[];
}

export default function CalendarView({ settings }: { settings: AppSettings }) {
  const [view, setView] = useState<ViewMode>("day");
  const [day, setDay] = useState(todayISO());
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<BookingRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [preview, setPreview] = useState<DragState | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState<DateTime | null>(null);

  const dragRef = useRef<DragState | null>(null);
  const colRef = useRef<HTMLElement | null>(null);
  const startYRef = useRef(0);
  const clickBookingRef = useRef<BookingRow | null>(null);

  const weekStart = mondayOf(day);
  const from = view === "day" ? day : weekStart;
  const to = view === "day" ? day : addDaysISO(weekStart, 6);

  const load = useCallback(async (f: string, t: string) => {
    setLoading(true);
    const supabase = createClient();
    const [bRes, blkRes] = await Promise.all([
      supabase.from("bookings").select("*").gte("appointment_date", f).lte("appointment_date", t).order("appointment_time_uk"),
      supabase.from("time_blocks").select("*").gte("date", f).lte("date", t),
    ]);
    setBookings((bRes.data ?? []) as BookingRow[]);
    setBlocks((blkRes.data ?? []) as TimeBlock[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(from, to);
  }, [from, to, load]);

  // Live "now" indicator (UK time), refreshed every 30s.
  useEffect(() => {
    const tick = () => setNowTick(DateTime.now().setZone("Europe/London"));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  // On open, mark any past "upcoming" appointment as completed automatically.
  useEffect(() => {
    autoCompletePast().then((r) => {
      if (r.ok && r.completed > 0) load(from, to);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function columnAt(clientX: number): { el: HTMLElement; date: string } | null {
    const cols = Array.from(document.querySelectorAll<HTMLElement>(".cal-col"));
    for (const el of cols) {
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right) return { el, date: el.getAttribute("data-date") || "" };
    }
    return null;
  }
  function minAt(clientY: number, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    return snapMin(START_HOUR * 60 + (clientY - r.top) / PX_PER_MIN);
  }

  useEffect(() => {
    function move(e: MouseEvent) {
      const d = dragRef.current;
      if (!d) return;
      let next: DragState;
      if (d.mode === "move") {
        const ci = columnAt(e.clientX) ?? (colRef.current ? { el: colRef.current, date: d.date } : null);
        if (!ci || !ci.el) return;
        const dur = d.duration ?? 30;
        let top = minAt(e.clientY, ci.el);
        top = Math.min(top, END_HOUR * 60 - dur);
        const moved = d.moved || Math.abs(e.clientY - startYRef.current) > 5;
        next = { ...d, date: ci.date, topMin: top, botMin: top + dur, moved };
      } else {
        const el = colRef.current;
        if (!el) return;
        const m = minAt(e.clientY, el);
        if (d.mode === "resize") next = { ...d, botMin: Math.max(d.topMin + 15, m) };
        else next = { ...d, topMin: Math.min(d.anchorMin, m), botMin: Math.max(d.anchorMin, m) };
      }
      dragRef.current = next;
      setPreview(next);
    }
    async function up() {
      const d = dragRef.current;
      dragRef.current = null;
      setPreview(null);
      if (!d) return;
      if (d.mode === "move") {
        if (d.moved && d.bookingId) {
          const choice = await confirmDialog({
            title: "Move appointment",
            message: "Reschedule this appointment to the new time? You can also email the patient about the change.",
            actions: [
              { label: "Reschedule & email patient", value: "email", variant: "primary" },
              { label: "Reschedule, don't email", value: "noemail", variant: "ghost" },
              { label: "Cancel", value: "cancel", variant: "ghost" },
            ],
          });
          if (choice === "email" || choice === "noemail") {
            await rescheduleBooking(d.bookingId, d.date, minToTime(d.topMin), choice === "email");
          }
          await load(from, to);
        } else if (clickBookingRef.current) {
          setSelected(clickBookingRef.current);
        }
        clickBookingRef.current = null;
        return;
      }
      if (d.botMin - d.topMin >= 15) {
        const startT = minToTime(d.topMin);
        const endT = minToTime(d.botMin);
        if (d.mode === "create") await addTimeBlock(d.date, startT, endT, "Blocked time");
        else if (d.blockId) await updateTimeBlock(d.blockId, d.date, startT, endT);
        else if (d.bookingId) await resizeBooking(d.bookingId, d.botMin - d.topMin);
        await load(from, to);
      }
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [from, to, load]);

  function beginCreate(e: React.MouseEvent<HTMLDivElement>, date: string) {
    if ((e.target as HTMLElement).closest("button")) return;
    const colEl = e.currentTarget;
    colRef.current = colEl;
    const m = minAt(e.clientY, colEl);
    const st: DragState = { mode: "create", date, anchorMin: m, topMin: m, botMin: m };
    dragRef.current = st;
    setPreview(st);
  }

  function beginResize(e: React.MouseEvent, blk: TimeBlock) {
    e.stopPropagation();
    e.preventDefault();
    colRef.current = (e.currentTarget as HTMLElement).closest(".cal-col") as HTMLElement | null;
    const st: DragState = { mode: "resize", date: blk.date, blockId: blk.id, anchorMin: mins(blk.start_time), topMin: mins(blk.start_time), botMin: mins(blk.end_time) };
    dragRef.current = st;
    setPreview(st);
  }

  function beginMove(e: React.MouseEvent, b: BookingRow) {
    e.stopPropagation();
    colRef.current = (e.currentTarget as HTMLElement).closest(".cal-col") as HTMLElement | null;
    startYRef.current = e.clientY;
    clickBookingRef.current = b;
    const start = mins(b.appointment_time_uk);
    const st: DragState = { mode: "move", date: b.appointment_date, bookingId: b.id, duration: b.duration_minutes, anchorMin: start, topMin: start, botMin: start + b.duration_minutes, moved: false };
    dragRef.current = st;
    setPreview(st);
  }

  function beginBookingResize(e: React.MouseEvent, b: BookingRow) {
    e.stopPropagation();
    e.preventDefault();
    colRef.current = (e.currentTarget as HTMLElement).closest(".cal-col") as HTMLElement | null;
    const start = mins(b.appointment_time_uk);
    const st: DragState = { mode: "resize", date: b.appointment_date, bookingId: b.id, anchorMin: start, topMin: start, botMin: start + b.duration_minutes };
    dragRef.current = st;
    setPreview(st);
  }

  function nav(dir: number) {
    setDay((d) => addDaysISO(d, view === "day" ? dir : dir * 7));
  }

  async function doSyncFresha() {
    setSyncing(true);
    setSyncMsg(null);
    const res = await syncFresha();
    setSyncing(false);
    if (res.ok) {
      setSyncMsg(`Fresha synced: ${res.imported} booking${res.imported === 1 ? "" : "s"} blocked.`);
      await load(from, to);
    } else {
      setSyncMsg(res.error || "Fresha sync failed.");
    }
  }

  async function removeBlock(blk: TimeBlock) {
    const r = await confirmDialog({
      title: "Remove blocked time",
      message: `Remove this block (${blk.start_time}–${blk.end_time})?`,
      actions: [
        { label: "Remove", value: "yes", variant: "danger" },
        { label: "Keep it", value: "no", variant: "ghost" },
      ],
    });
    if (r !== "yes") return;
    await removeTimeBlock(blk.id);
    await load(from, to);
  }

  let columns: Column[];
  if (view === "day") {
    const dayB = bookings.filter((b) => b.appointment_date === day);
    columns = [
      { key: "online", title: "Online Video", date: day, bookings: dayB.filter((b) => b.consultation_type === "online") },
      { key: "f2f", title: "Face-to-Face", date: day, bookings: dayB.filter((b) => b.consultation_type !== "online") },
    ];
  } else {
    columns = [];
    for (let i = 0; i < 7; i++) {
      const d = addDaysISO(weekStart, i);
      columns.push({ key: d, title: shortDay(d), date: d, highlight: d === todayISO(), bookings: bookings.filter((b) => b.appointment_date === d) });
    }
  }

  const hours: number[] = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) hours.push(h);
  const gridHeight = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;
  const nowMin = nowTick ? nowTick.hour * 60 + nowTick.minute : -1;
  const nowDateISO = nowTick ? nowTick.toFormat("yyyy-LL-dd") : "";

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setDay(todayISO())} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/[0.03]">Today</button>
        <button onClick={() => nav(-1)} aria-label="Previous" className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-zinc-600 hover:bg-black/[0.03]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button onClick={() => nav(1)} aria-label="Next" className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-zinc-600 hover:bg-black/[0.03]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
        <span className="ml-1 font-heading text-base font-bold text-ink">{view === "day" ? fullDay(day) : weekLabel(weekStart)}</span>
        {loading && <span className="text-xs text-zinc-400">Loading…</span>}

        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-lg border border-black/10 p-0.5">
            <button onClick={() => setView("day")} className={`rounded-md px-3 py-1 text-sm font-medium ${view === "day" ? "bg-ink text-white" : "text-zinc-600"}`}>Day</button>
            <button onClick={() => setView("week")} className={`rounded-md px-3 py-1 text-sm font-medium ${view === "week" ? "bg-ink text-white" : "text-zinc-600"}`}>Week</button>
          </div>
          <button onClick={doSyncFresha} disabled={syncing} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/[0.03] disabled:opacity-50">{syncing ? "Syncing…" : "Sync Fresha"}</button>
          <button onClick={() => setBlocking(true)} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-black/[0.03]">Block time</button>
          <button onClick={() => setAdding(true)} className="rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-white">+ Add</button>
        </div>
      </div>

      <p className="mt-2 text-xs font-semibold text-zinc-500">All times shown in UK time (London).</p>
      {syncMsg && <p className="mt-1 text-xs font-medium text-zinc-600">{syncMsg}</p>}

      <p className="mt-2 text-xs text-zinc-400">Drag a booking to reschedule it · drag an empty slot to block time · drag the grip at the bottom of a block to resize · click the × to remove it.</p>

      {/* Grid */}
      <div className="mt-3 overflow-x-auto rounded-2xl border border-black/10 bg-white p-4">
        <div className="min-w-[520px]">
          <div className="mb-2 flex">
            <div className="w-12 shrink-0" />
            {columns.map((c) => (
              <div key={c.key} className={`flex-1 px-1 text-center text-xs font-semibold ${c.highlight ? "text-gold-deep" : "text-zinc-500"}`}>{c.title}</div>
            ))}
          </div>

          <div className="flex">
            <div className="relative w-12 shrink-0" style={{ height: gridHeight }}>
              {hours.map((h) => (
                <div key={h} style={{ position: "absolute", top: (h - START_HOUR) * 60 * PX_PER_MIN - 7 }} className="text-xs text-zinc-400">{pad(h)}:00</div>
              ))}
            </div>
            {columns.map((c) => (
              <div
                key={c.key}
                data-date={c.date}
                className="cal-col relative flex-1 cursor-crosshair border-l border-black/5"
                style={{ height: gridHeight }}
                onMouseDown={(e) => beginCreate(e, c.date)}
              >
                {hours.map((h) => (
                  <div key={h} style={{ top: (h - START_HOUR) * 60 * PX_PER_MIN }} className="pointer-events-none absolute left-0 right-0 border-t border-black/5" />
                ))}

                {blocks.filter((blk) => blk.date === c.date).map((blk) => {
                  const top = (mins(blk.start_time) - START_HOUR * 60) * PX_PER_MIN;
                  const height = Math.max((mins(blk.end_time) - mins(blk.start_time)) * PX_PER_MIN, 20);
                  return (
                    <div
                      key={blk.id}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{ top, height }}
                      className="group absolute left-0.5 right-0.5 overflow-hidden rounded-md border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-left text-[11px] leading-tight text-zinc-500"
                    >
                      <div className="font-semibold">Blocked</div>
                      {blk.note && blk.note !== "Blocked time" && <div className="truncate">{blk.note}</div>}
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => removeBlock(blk)}
                        title="Remove this block"
                        className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded text-zinc-400 hover:bg-zinc-300 hover:text-zinc-700"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      </button>
                      <span
                        onMouseDown={(e) => beginResize(e, blk)}
                        title="Drag to resize"
                        className="absolute inset-x-0 bottom-0 flex h-4 cursor-ns-resize items-center justify-center bg-zinc-300/80 hover:bg-zinc-400"
                      >
                        <span className="h-0.5 w-6 rounded-full bg-zinc-500/70" />
                      </span>
                    </div>
                  );
                })}

                {c.bookings.map((b) => {
                  const top = (mins(b.appointment_time_uk) - START_HOUR * 60) * PX_PER_MIN;
                  const height = Math.max(b.duration_minutes * PX_PER_MIN, 24);
                  const startM = mins(b.appointment_time_uk);
                  const isNow = b.appointment_date === nowDateISO && nowMin >= startM && nowMin < startM + b.duration_minutes;
                  return (
                    <button
                      key={b.id}
                      onMouseDown={(e) => beginMove(e, b)}
                      style={{ top, height }}
                      title="Drag to reschedule · click to open"
                      className={`absolute left-0.5 right-0.5 cursor-move overflow-hidden rounded-md border px-1.5 py-0.5 text-left text-[11px] leading-tight transition-all hover:shadow-md ${bookingColor(b.status, b.payment_status === "paid")} ${isNow ? "z-10 animate-pulse ring-2 ring-red-500" : ""} ${preview?.mode === "move" && preview.bookingId === b.id ? "opacity-30" : ""}`}
                    >
                      <div className="truncate font-semibold">{b.appointment_time_uk} {b.full_name}</div>
                      {b.treatment && <div className="truncate opacity-70">{b.treatment}</div>}
                      <span onMouseDown={(e) => beginBookingResize(e, b)} title="Drag to change duration" className="absolute inset-x-0 bottom-0 flex h-3 cursor-ns-resize items-center justify-center bg-black/5 hover:bg-black/15"><span className="h-0.5 w-5 rounded-full bg-current opacity-40" /></span>
                    </button>
                  );
                })}

                {preview && preview.date === c.date && (
                  <div
                    style={{ top: (preview.topMin - START_HOUR * 60) * PX_PER_MIN, height: Math.max((preview.botMin - preview.topMin) * PX_PER_MIN, 22) }}
                    className="pointer-events-none absolute left-0.5 right-0.5 z-30 flex items-center justify-center rounded-lg border-2 border-gold bg-gold/20 text-xs font-bold text-gold-deep shadow-[0_4px_14px_rgba(197,162,83,0.35)]"
                  >
                    {minToTime(preview.topMin)}–{minToTime(preview.botMin)}
                  </div>
                )}

                {c.date === nowDateISO && nowMin >= START_HOUR * 60 && nowMin <= END_HOUR * 60 && (
                  <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: (nowMin - START_HOUR * 60) * PX_PER_MIN }}>
                    <span className="-ml-1 h-2 w-2 rounded-full bg-red-500" />
                    <span className="h-px flex-1 bg-red-500/70" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && <DetailDrawer booking={selected} onClose={() => setSelected(null)} onChanged={() => load(from, to)} />}
      {adding && <ManualBookingForm settings={settings} defaultDate={day} onClose={() => setAdding(false)} onCreated={() => load(from, to)} />}
      {blocking && <BlockTimeDrawer defaultDate={day} onClose={() => setBlocking(false)} onCreated={() => load(from, to)} />}
      <ConfirmHost />
    </div>
  );
}

function BlockTimeDrawer({
  defaultDate,
  onClose,
  onCreated,
}: {
  defaultDate: string;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}) {
  const [date, setDate] = useState(defaultDate);
  const [start, setStart] = useState("13:00");
  const [end, setEnd] = useState("14:00");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (mins(end) <= mins(start)) {
      setErr("End time must be after start time.");
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await addTimeBlock(date, start, end, note.trim() || "Blocked time");
    setBusy(false);
    if (!res.ok) {
      setErr(res.error || "Could not block this time.");
      return;
    }
    await onCreated();
    onClose();
  }

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/20" />
      <aside className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto bg-white shadow-2xl sm:w-[380px]">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h3 className="font-heading text-lg font-bold text-ink">Block time</h3>
          <button onClick={onClose} aria-label="Close" className="text-zinc-400 hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-3 p-5">
          <p className="text-sm text-zinc-500">Close a time slot so it can&apos;t be booked online (e.g. for a walk-in who pays on arrival).</p>
          <label className="block text-xs font-medium text-zinc-500">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 w-full ${fieldCls}`} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-medium text-zinc-500">From (UK)<input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={`mt-1 w-full ${fieldCls}`} /></label>
            <label className="text-xs font-medium text-zinc-500">To (UK)<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={`mt-1 w-full ${fieldCls}`} /></label>
          </div>
          <label className="block text-xs font-medium text-zinc-500">Note<input value={note} onChange={(e) => setNote(e.target.value)} className={`mt-1 w-full ${fieldCls}`} placeholder="e.g. Walk-in patient" /></label>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button onClick={submit} disabled={busy} className="w-full rounded-xl bg-ink py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Block this time"}</button>
        </div>
      </aside>
    </>
  );
}

function DetailDrawer({
  booking,
  onClose,
  onChanged,
}: {
  booking: BookingRow;
  onClose: () => void;
  onChanged: () => Promise<void> | void;
}) {
  const b = booking;
  const [status, setStatus] = useState(b.status);
  const [rDate, setRDate] = useState(b.appointment_date);
  const [rTime, setRTime] = useState(b.appointment_time_uk);
  const [notes, setNotes] = useState(b.staff_notes ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [notifyResched, setNotifyResched] = useState(true);

  async function changeStatus(v: string) {
    setStatus(v);
    setBusy(true);
    await updateBookingStatus(b.id, v);
    setBusy(false);
    setMsg("Status updated ✓");
    await onChanged();
  }
  async function doReschedule() {
    setBusy(true);
    const res = await rescheduleBooking(b.id, rDate, rTime, notifyResched);
    setBusy(false);
    setMsg(res.ok ? "Rescheduled ✓" : `Error: ${res.error}`);
    await onChanged();
  }
  async function saveNotes() {
    setBusy(true);
    await updateStaffNotes(b.id, notes);
    setBusy(false);
    setMsg("Notes saved ✓");
    await onChanged();
  }
  async function doDelete() {
    const r = await confirmDialog({
      title: "Delete appointment",
      message: `Delete ${b.full_name}'s appointment? This cannot be undone.`,
      actions: [
        { label: "Delete appointment", value: "yes", variant: "danger" },
        { label: "Cancel", value: "no", variant: "ghost" },
      ],
    });
    if (r !== "yes") return;
    setBusy(true);
    const res = await deleteBooking(b.id);
    setBusy(false);
    if (res.ok) {
      await onChanged();
      onClose();
    } else {
      setMsg(`Error: ${res.error}`);
    }
  }
  async function doRefund() {
    const r = await confirmDialog({
      title: "Refund & cancel",
      message: `Refund £${b.amount_paid ?? b.price_gbp} to ${b.full_name} and cancel this appointment?`,
      actions: [
        { label: "Refund & cancel", value: "yes", variant: "danger" },
        { label: "Keep it", value: "no", variant: "ghost" },
      ],
    });
    if (r !== "yes") return;
    setBusy(true);
    const res = await refundBooking(b.id);
    setBusy(false);
    if (res.ok) {
      setStatus("cancelled");
      setMsg("Refunded & cancelled ✓");
      await onChanged();
    } else {
      setMsg(`Error: ${res.error}`);
    }
  }

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/20" />
      <aside className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto bg-white shadow-2xl sm:w-[400px]">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h3 className="font-heading text-lg font-bold text-ink">{b.full_name}</h3>
          <button onClick={onClose} aria-label="Close" className="text-zinc-400 hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-5 p-5">
          <div className="text-sm text-zinc-600">
            <div>{b.email}</div>
            <div>{b.phone}</div>
            <div>{b.country}</div>
          </div>
          <div className="rounded-xl border border-black/10 p-3 text-sm">
            <div className="font-medium text-ink">{b.consultation_type === "online" ? "Online Video Consultation" : "Face-to-Face Consultation"}</div>
            <div className="text-zinc-500">{b.duration_minutes} min{b.treatment ? ` · ${b.treatment}` : ""}</div>
            <div className="mt-2">
              <span className="font-semibold text-ink">£{b.amount_paid ?? b.price_gbp}</span>
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${b.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>{b.payment_status}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400">Status</label>
            <select value={status} onChange={(e) => changeStatus(e.target.value)} className={`mt-1 w-full ${fieldCls}`}>
              {STATUS_OPTIONS.map((o) => (<option key={o.v} value={o.v}>{o.label}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400">Reschedule (UK time)</label>
            <div className="mt-1 flex gap-2">
              <input type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} className={`${fieldCls} flex-1`} />
              <input type="time" value={rTime} onChange={(e) => setRTime(e.target.value)} className={fieldCls} />
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
              <input type="checkbox" checked={notifyResched} onChange={(e) => setNotifyResched(e.target.checked)} className="accent-[#c5a253]" />
              Email the patient about this change
            </label>
            <button onClick={doReschedule} disabled={busy} className="mt-2 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Reschedule</button>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400">Internal staff notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`mt-1 w-full resize-none ${fieldCls}`} placeholder="Private notes…" />
            <button onClick={saveNotes} disabled={busy} className="mt-2 rounded-lg border border-black/10 px-4 py-2 text-xs font-semibold text-zinc-700 disabled:opacity-50">Save notes</button>
          </div>
          <div className="space-y-2 border-t border-black/10 pt-4">
            {b.payment_status === "paid" && b.transaction_id && b.transaction_id !== "manual" && (
              <button onClick={doRefund} disabled={busy} className="w-full rounded-lg border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50">Refund &amp; cancel</button>
            )}
            <button onClick={doDelete} disabled={busy} className="w-full rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Delete appointment</button>
          </div>
          {msg && <p className="text-xs text-gold-deep">{msg}</p>}
        </div>
      </aside>
    </>
  );
}
