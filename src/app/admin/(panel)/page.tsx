import { DateTime } from "luxon";
import { createClient } from "@/lib/supabase/server";
import type { BookingRow } from "@/lib/types";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAYS_SHORT[dt.getDay()]} ${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</div>
      <div className="mt-2 font-heading text-3xl font-extrabold text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs text-zinc-400">{sub}</div>}
    </div>
  );
}

function PayBadge({ status }: { status: string }) {
  const paid = status === "paid";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        paid ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
      }`}
    >
      {paid ? "Paid" : status}
    </span>
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const nowUk = DateTime.now().setZone("Europe/London");
  const todayISO = nowUk.toFormat("yyyy-MM-dd");
  const monthStart = nowUk.startOf("month").toFormat("yyyy-MM-dd");
  const monthEnd = nowUk.endOf("month").toFormat("yyyy-MM-dd");

  const [totalRes, todayRes, monthRes, upcomingRes, paidRes, recentRes] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("appointment_date", todayISO),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("appointment_date", monthStart)
      .lte("appointment_date", monthEnd),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("appointment_date", todayISO)
      .eq("status", "upcoming"),
    supabase
      .from("bookings")
      .select("amount_paid")
      .eq("payment_status", "paid")
      .gte("paid_at", nowUk.startOf("month").toISO() ?? ""),
    supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  const total = totalRes.count ?? 0;
  const todayCount = todayRes.count ?? 0;
  const monthCount = monthRes.count ?? 0;
  const upcoming = upcomingRes.count ?? 0;
  const revenue = (paidRes.data ?? []).reduce((s, r) => s + (Number(r.amount_paid) || 0), 0);
  const recent = (recentRes.data ?? []) as BookingRow[];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">Overview of your consultations.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total bookings" value={String(total)} />
        <StatCard label="Today" value={String(todayCount)} sub="appointments today" />
        <StatCard label="This month" value={String(monthCount)} sub="appointments" />
        <StatCard label="Revenue this month" value={`£${revenue.toFixed(0)}`} sub={`${upcoming} upcoming`} />
      </div>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white">
        <div className="border-b border-black/5 px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-ink">Recent bookings</h2>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-zinc-400">No bookings yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-zinc-400">
                <tr className="border-b border-black/5">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Time (UK)</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-b border-black/5 last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink">{b.full_name}</div>
                      <div className="text-xs text-zinc-400">{b.treatment}</div>
                    </td>
                    <td className="px-5 py-3 text-zinc-600">
                      {b.consultation_type === "online" ? "Online" : "Face-to-Face"}
                    </td>
                    <td className="px-5 py-3 text-zinc-600">{prettyDate(b.appointment_date)}</td>
                    <td className="px-5 py-3 text-zinc-600">{b.appointment_time_uk}</td>
                    <td className="px-5 py-3"><PayBadge status={b.payment_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
