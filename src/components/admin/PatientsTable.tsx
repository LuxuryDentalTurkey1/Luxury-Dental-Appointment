"use client";

import { useMemo, useState } from "react";

export interface Patient {
  name: string;
  email: string;
  phone: string;
  country: string;
  treatment: string;
  bookings: number;
  totalPaid: number;
  lastDate: string; // YYYY-MM-DD
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function prettyDate(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "—";
  const dt = new Date(y, m - 1, d);
  return `${DAYS[dt.getDay()]} ${d} ${MONTHS[m - 1]} ${y}`;
}

function waLink(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 7 ? `https://wa.me/${digits}` : null;
}

export default function PatientsTable({ patients }: { patients: Patient[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return patients;
    return patients.filter((p) =>
      [p.name, p.email, p.phone, p.country, p.treatment].some((v) => v.toLowerCase().includes(s))
    );
  }, [q, patients]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white">
      <div className="border-b border-black/5 p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, phone or country…"
          className="w-full rounded-lg border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-zinc-500">
          {patients.length === 0 ? "No patients yet." : "No patients match your search."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-zinc-500">
              <tr className="border-b border-black/5">
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 font-medium tabular-nums">Bookings</th>
                <th className="px-5 py-3 font-medium tabular-nums">Total paid</th>
                <th className="px-5 py-3 font-medium">Last appt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const wa = waLink(p.phone);
                return (
                  <tr key={`${p.email || p.name}-${i}`} className="border-b border-black/5 last:border-0 hover:bg-black/[0.015]">
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink">{p.name}</div>
                      {p.email ? (
                        <a href={`mailto:${p.email}`} className="text-xs text-gold-deep hover:underline">{p.email}</a>
                      ) : (
                        <span className="text-xs text-zinc-400">no email</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-zinc-600">
                      {p.phone ? (
                        wa ? <a href={wa} target="_blank" rel="noreferrer" className="hover:text-gold-deep hover:underline">{p.phone}</a> : p.phone
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-zinc-600">{p.country || <span className="text-zinc-400">—</span>}</td>
                    <td className="px-5 py-3 tabular-nums text-zinc-700">{p.bookings}</td>
                    <td className="px-5 py-3 tabular-nums font-medium text-ink">£{p.totalPaid.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</td>
                    <td className="px-5 py-3 text-zinc-600">{prettyDate(p.lastDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
