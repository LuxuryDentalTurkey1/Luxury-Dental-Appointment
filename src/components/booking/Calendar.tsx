"use client";

import { useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isoOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sameDay(a: Date | null, b: Date | null) {
  return (
    !!a && !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Calendar({
  availableWeekdays,
  blockedDates = [],
  selected,
  onSelect,
}: {
  availableWeekdays: number[];
  blockedDates?: string[];
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  // UK "today" (the business timezone) as YYYY-MM-DD — identical for every
  // visitor whatever their own timezone, so past days are disabled the same way
  // for a UK patient and an overseas one (and matches the server, no SSR drift).
  const todayISOuk = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
  const [ty, tm] = todayISOuk.split("-").map(Number);
  const [view, setView] = useState({ y: ty, m: tm - 1 });

  const firstOfMonth = new Date(view.y, view.m, 1);
  const leading = (firstOfMonth.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.y, view.m, d));

  const atCurrentMonth = view.y === ty && view.m === tm - 1;

  function isSelectable(d: Date) {
    return (
      isoOf(d) >= todayISOuk &&
      availableWeekdays.includes(d.getDay()) &&
      !blockedDates.includes(isoOf(d))
    );
  }

  function shift(delta: number) {
    setView((v) => {
      const total = v.y * 12 + v.m + delta;
      return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 };
    });
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={atCurrentMonth}
          aria-label="Previous month"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 text-zinc-600 transition-colors hover:bg-black/[0.03] disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="font-heading text-base font-bold text-ink">
          {MONTHS[view.m]} {view.y}
        </div>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 text-zinc-600 transition-colors hover:bg-black/[0.03]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`blank-${i}`} />;
          const selectable = isSelectable(d);
          const isSel = sameDay(d, selected);
          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={!selectable}
              onClick={() => selectable && onSelect(d)}
              className={[
                "flex h-10 items-center justify-center rounded-lg text-sm transition-colors",
                isSel
                  ? "bg-ink font-semibold text-white"
                  : selectable
                    ? "font-medium text-ink ring-1 ring-inset ring-gold/40 hover:bg-gold/15 hover:text-gold-deep"
                    : "text-zinc-300",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-lg text-[10px] font-medium text-ink ring-1 ring-inset ring-gold/50">1</span>
        Highlighted days are available to book.
      </p>
    </div>
  );
}
