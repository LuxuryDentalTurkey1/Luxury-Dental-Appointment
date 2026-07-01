"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatus, updateStaffNotes, deleteBooking } from "@/app/admin/actions";
import type { BookingRow } from "@/lib/types";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_OPTIONS = [
  { v: "upcoming", label: "Upcoming" },
  { v: "completed", label: "Completed" },
  { v: "cancelled", label: "Cancelled" },
  { v: "no_show", label: "No Show" },
];

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAYS_SHORT[dt.getDay()]} ${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function statusClasses(s: string) {
  switch (s) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "no_show":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function BookingCard({ booking }: { booking: BookingRow }) {
  const b = booking;
  const router = useRouter();
  const [status, setStatus] = useState(b.status);
  const [notes, setNotes] = useState(b.staff_notes ?? "");
  const [savedNotes, setSavedNotes] = useState(b.staff_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    setDeleting(true);
    const res = await deleteBooking(b.id);
    setDeleting(false);
    if (res.ok) router.refresh();
    else setConfirmingDelete(false);
  }

  async function onStatus(v: string) {
    const prev = status;
    setStatus(v);
    const res = await updateBookingStatus(b.id, v);
    if (!res.ok) setStatus(prev);
  }

  async function onSaveNotes() {
    setSaving(true);
    const res = await updateStaffNotes(b.id, notes);
    if (res.ok) setSavedNotes(notes);
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-ink">{b.full_name}</div>
          <div className="truncate text-xs text-zinc-400">
            {b.email} · {b.phone} · {b.country}
          </div>
          <div className="mt-2 text-sm text-zinc-700">
            {b.consultation_type === "online" ? "Online Video" : "Face-to-Face"} ·{" "}
            <span className="font-medium">{prettyDate(b.appointment_date)}</span> ·{" "}
            {b.appointment_time_uk} (UK) · {b.duration_minutes} min
          </div>
          <div className="mt-1 text-sm text-zinc-500">{b.treatment}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              b.payment_status === "paid"
                ? "bg-green-100 text-green-700"
                : b.payment_status === "free"
                  ? "bg-indigo-100 text-indigo-700"
                  : b.payment_status === "refunded"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {b.payment_status === "paid"
              ? `Paid £${b.amount_paid ?? b.price_gbp}`
              : b.payment_status === "free"
                ? "Free"
                : b.payment_status === "refunded"
                  ? "Refunded"
                  : "Unpaid"}
          </span>
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            className={`cursor-pointer rounded-lg border-0 px-2.5 py-1.5 text-xs font-semibold outline-none ${statusClasses(status)}`}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 border-t border-black/5 pt-3">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Internal staff notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Private notes about this patient or booking…"
          className="mt-1.5 w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-zinc-300 focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
        {notes !== savedNotes && (
          <button
            onClick={onSaveNotes}
            disabled={saving}
            className="mt-2 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save notes"}
          </button>
        )}
      </div>

      <div className="mt-3 flex justify-end border-t border-black/5 pt-3">
        {confirmingDelete ? (
          <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
            <span className="text-zinc-600">Delete this appointment permanently?</span>
            <button onClick={onDelete} disabled={deleting} className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button onClick={() => setConfirmingDelete(false)} disabled={deleting} className="rounded-lg border border-black/10 px-3 py-1.5 font-semibold text-zinc-600 hover:bg-black/[0.04]">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmingDelete(true)} className="text-xs font-semibold text-red-500 hover:underline">
            Delete appointment
          </button>
        )}
      </div>
    </div>
  );
}
