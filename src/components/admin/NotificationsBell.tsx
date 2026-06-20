"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { BookingRow } from "@/lib/types";

const SEEN_KEY = "ldt_notif_seen";

function bookedAt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
}

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BookingRow[]>([]);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      const rows = (data ?? []) as BookingRow[];
      setItems(rows);
      let seen = "";
      try {
        seen = localStorage.getItem(SEEN_KEY) || "";
      } catch {}
      setNewCount(rows.filter((r) => (r.created_at || "") > seen).length);
    })();
  }, []);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      // Opening the bell marks the newest booking as seen, clearing the badge.
      if (next && items.length) {
        try {
          localStorage.setItem(SEEN_KEY, items[0].created_at || new Date().toISOString());
        } catch {}
        setNewCount(0);
      }
      return next;
    });
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-zinc-700 hover:bg-black/[0.03]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {newCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
            {newCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-40" />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
            <div className="border-b border-black/5 px-4 py-3 font-heading text-sm font-bold text-ink">Recent bookings</div>
            <div className="max-h-[360px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-zinc-400">No bookings yet.</div>
              ) : (
                items.map((b) => (
                  <Link
                    key={b.id}
                    href="/admin/bookings"
                    onClick={() => setOpen(false)}
                    className="block border-b border-black/5 px-4 py-3 transition-colors hover:bg-black/[0.02]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-ink">{b.full_name}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${b.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {b.payment_status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {b.consultation_type === "online" ? "Online" : "Face-to-Face"} · {b.appointment_date} {b.appointment_time_uk}
                    </div>
                    <div className="text-[11px] text-zinc-400">Booked {bookedAt(b.created_at)}</div>
                  </Link>
                ))
              )}
            </div>
            <Link
              href="/admin/bookings"
              onClick={() => setOpen(false)}
              className="block border-t border-black/5 px-4 py-3 text-center text-sm font-semibold text-gold-deep hover:bg-gold/[0.05]"
            >
              See all bookings
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
