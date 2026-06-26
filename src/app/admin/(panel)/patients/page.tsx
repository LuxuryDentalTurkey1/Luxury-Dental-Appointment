import { createClient } from "@/lib/supabase/server";
import PatientsTable, { type Patient } from "@/components/admin/PatientsTable";

// There is no separate patients table — a "patient" is derived from the
// bookings they have made, grouped by email (falling back to name). For each
// person we collect their latest contact details, how many appointments they
// have, how much they have actually paid, and their most recent appointment.
export default async function PatientsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("full_name,email,phone,country,treatment,appointment_date,amount_paid,payment_status,created_at")
    .order("created_at", { ascending: false });

  const map = new Map<string, Patient>();
  for (const b of data ?? []) {
    const email = (b.email || "").trim();
    const name = (b.full_name || "").trim();
    const key = (email.toLowerCase() || name.toLowerCase() || "unknown");
    const paid = b.payment_status === "paid" ? Number(b.amount_paid) || 0 : 0;
    const existing = map.get(key);
    if (!existing) {
      // Rows are newest-first, so the first one we see has the freshest details.
      map.set(key, {
        name: name || "(no name)",
        email,
        phone: (b.phone || "").trim(),
        country: (b.country || "").trim(),
        treatment: (b.treatment || "").trim(),
        bookings: 1,
        totalPaid: paid,
        lastDate: b.appointment_date || "",
      });
    } else {
      existing.bookings += 1;
      existing.totalPaid += paid;
      if ((b.appointment_date || "") > existing.lastDate) existing.lastDate = b.appointment_date || "";
      if (!existing.phone && b.phone) existing.phone = b.phone.trim();
      if (!existing.country && b.country) existing.country = b.country.trim();
      if (!existing.treatment && b.treatment) existing.treatment = b.treatment.trim();
    }
  }
  const patients = [...map.values()];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink">Patients</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Everyone who has booked a consultation{patients.length ? ` · ${patients.length} total` : ""}.
      </p>
      <div className="mt-6">
        <PatientsTable patients={patients} />
      </div>
    </div>
  );
}
