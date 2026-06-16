"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";
import type { BookingRow } from "@/lib/types";

const btn =
  "rounded-lg border border-black/10 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-gold/60 hover:bg-gold/[0.06] disabled:opacity-50";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ExportBookings() {
  const [busy, setBusy] = useState(false);
  const [custom, setCustom] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function exportRange(fromISO: string, toISO: string, label: string) {
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .gte("created_at", fromISO)
      .lte("created_at", `${toISO}T23:59:59`)
      .order("created_at", { ascending: false });

    if (error) {
      setMsg(`Error: ${error.message}`);
      setBusy(false);
      return;
    }

    const rows = (data ?? []) as BookingRow[];
    if (rows.length === 0) {
      setMsg("No bookings found in this date range.");
      setBusy(false);
      return;
    }

    const sheetData = rows.map((b) => ({
      "Booking ID": b.id,
      "Patient Name": b.full_name,
      "Phone Number": b.phone,
      Email: b.email,
      Country: b.country,
      "Consultation Type": b.consultation_type === "online" ? "Online Video" : "Face-to-Face",
      "Treatment Interest": b.treatment,
      "Appointment Date": b.appointment_date,
      "Appointment Time (UK)": b.appointment_time_uk,
      "Payment Status": b.payment_status,
      "Amount Paid (GBP)": b.amount_paid ?? "",
      Status: b.status,
      "Booking Date": new Date(b.created_at).toLocaleString("en-GB", { timeZone: "Europe/London" }),
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    ws["!cols"] = [
      { wch: 38 }, { wch: 20 }, { wch: 16 }, { wch: 24 }, { wch: 14 },
      { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 14 },
      { wch: 14 }, { wch: 12 }, { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, `luxury-dental-bookings-${label}.xlsx`);
    setMsg(`Downloaded ${rows.length} booking${rows.length === 1 ? "" : "s"}.`);
    setBusy(false);
  }

  function lastDays(n: number, label: string) {
    const fromD = new Date();
    fromD.setDate(fromD.getDate() - n);
    exportRange(isoDate(fromD), isoDate(new Date()), label);
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="font-heading text-base font-bold text-ink">Export to Excel</h2>
      <p className="mt-1 text-xs text-zinc-500">Download a .xlsx report of bookings by date.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button className={btn} disabled={busy} onClick={() => lastDays(7, "last-7-days")}>Last 7 days</button>
        <button className={btn} disabled={busy} onClick={() => lastDays(30, "last-30-days")}>Last 30 days</button>
        <button className={btn} disabled={busy} onClick={() => lastDays(90, "last-90-days")}>Last 90 days</button>
        <button className={btn} disabled={busy} onClick={() => setCustom((c) => !c)}>Custom range</button>
      </div>

      {custom && (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-zinc-500">
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-gold" />
          </label>
          <label className="text-xs font-medium text-zinc-500">
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-gold" />
          </label>
          <button
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={busy || !from || !to}
            onClick={() => exportRange(from, to, `${from}_to_${to}`)}
          >
            Export
          </button>
        </div>
      )}

      {busy && <p className="mt-3 text-xs text-zinc-400">Preparing file…</p>}
      {msg && <p className="mt-3 text-xs text-zinc-600">{msg}</p>}
    </div>
  );
}
