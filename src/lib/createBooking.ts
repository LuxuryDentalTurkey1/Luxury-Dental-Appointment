import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendBookingNotification, sendPatientEmail, bookingRef } from "@/lib/notify";

export interface CreatedBookingInfo {
  name: string;
  date: string;
  timeUk: string;
  type: string;
  amount: number;
  reference: string;
}

// Idempotently turns a PAID Stripe Checkout session into a booking row.
// Both the /book/success render and the Stripe webhook call this for the same
// session; a unique index on transaction_id means only the FIRST call inserts
// and emails — any later call (page refresh, webhook retry, the slower of the
// two paths) returns created:false and does nothing. So a payment is never
// lost (the webhook is a safety net if the browser never reaches success) and
// never double-recorded.
export async function createBookingFromSession(
  session: Stripe.Checkout.Session,
  supabase: SupabaseClient
): Promise<{ created: boolean; info: CreatedBookingInfo | null }> {
  const m = session.metadata;
  if (session.payment_status !== "paid" || !m) return { created: false, info: null };

  const amount = (session.amount_total || 0) / 100;
  const transaction_id =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : String(session.payment_intent ?? session.id);
  const reference = bookingRef(transaction_id);
  const info: CreatedBookingInfo = {
    name: m.full_name,
    date: m.appointment_date,
    timeUk: m.appointment_time_uk,
    type: m.consultation_type === "online" ? "Online Video Consultation" : "Face-to-Face Consultation",
    amount,
    reference,
  };

  const duration = Number(m.duration_minutes) || 0;

  // Double-booking guard: does another appointment already overlap this slot?
  // We still record the paid booking (never reject a payment) but flag it so
  // staff see the clash and can reschedule or refund one side.
  let conflict = false;
  try {
    const [h, mm] = String(m.appointment_time_uk).split(":").map(Number);
    const start = h * 60 + mm;
    const end = start + duration;
    const { data: ivs } = await supabase.rpc("taken_intervals", { p_date: m.appointment_date });
    conflict = ((ivs ?? []) as { start_min: number; end_min: number }[]).some(
      (iv) => start < iv.end_min && end > iv.start_min
    );
  } catch {
    // RPC unavailable → skip the guard rather than block a paid booking.
  }

  const booking = {
    consultation_type: m.consultation_type,
    appointment_date: m.appointment_date,
    appointment_time_uk: m.appointment_time_uk,
    duration_minutes: duration,
    price_gbp: Number(m.price_gbp),
    full_name: m.full_name,
    email: m.email,
    phone: m.phone,
    country: m.country,
    treatment: m.treatment,
    notes: m.notes || null,
    status: "upcoming",
    payment_status: "paid",
    transaction_id,
    amount_paid: amount,
    paid_at: new Date().toISOString(),
    staff_notes: conflict
      ? "⚠ DOUBLE-BOOKED — overlaps another appointment, please review"
      : null,
  };

  const { error } = await supabase.from("bookings").insert(booking);
  if (error) {
    // 23505 = unique violation: the other path already created this booking.
    if (error.code === "23505") return { created: false, info };
    throw new Error(error.message);
  }

  // Only the path that actually inserted sends emails, so each fires once.
  try {
    await sendBookingNotification(booking);
  } catch (e) {
    console.error("[booking notify]", e);
  }
  try {
    await sendPatientEmail("confirmation", { ...booking, reference });
  } catch (e) {
    console.error("[patient email]", e);
  }

  return { created: true, info };
}
