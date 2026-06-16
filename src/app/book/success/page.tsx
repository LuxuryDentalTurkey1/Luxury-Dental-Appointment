import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { sendBookingNotification, sendPatientEmail, bookingRef } from "@/lib/notify";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let ok = false;
  let info: { name: string; date: string; timeUk: string; type: string; amount: number; reference: string } | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const m = session.metadata;
      if (session.payment_status === "paid" && m) {
        const amount = (session.amount_total || 0) / 100;
        const booking = {
          consultation_type: m.consultation_type,
          appointment_date: m.appointment_date,
          appointment_time_uk: m.appointment_time_uk,
          duration_minutes: Number(m.duration_minutes),
          price_gbp: Number(m.price_gbp),
          full_name: m.full_name,
          email: m.email,
          phone: m.phone,
          country: m.country,
          treatment: m.treatment,
          notes: m.notes || null,
          status: "upcoming",
          payment_status: "paid",
          transaction_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : String(session.payment_intent ?? session.id),
          amount_paid: amount,
          paid_at: new Date().toISOString(),
        };

        const supabase = await createClient();
        const { error } = await supabase.from("bookings").insert(booking);
        const reference = bookingRef(booking.transaction_id);
        // Duplicate (page refresh → unique transaction_id) → don't email again.
        if (!error) {
          try {
            await sendBookingNotification(booking);
          } catch (e) {
            console.error(e);
          }
          try {
            await sendPatientEmail("confirmation", { ...booking, reference });
          } catch (e) {
            console.error(e);
          }
        }

        ok = true;
        info = {
          name: m.full_name,
          date: m.appointment_date,
          timeUk: m.appointment_time_uk,
          type:
            booking.consultation_type === "online"
              ? "Online Video Consultation"
              : "Face-to-Face Consultation",
          amount,
          reference,
        };
      }
    } catch (e) {
      console.error("[success] error", e);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[680px] flex-col items-center justify-center px-6 py-24 text-center">
      {ok && info ? (
        <div className="w-full rounded-3xl border border-black/10 bg-white p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-ink">Payment confirmed!</h1>
          <p className="mx-auto mt-3 max-w-md text-zinc-600">
            Thank you, {info.name.split(" ")[0]}. Your {info.type.toLowerCase()} is booked for{" "}
            <span className="font-medium text-ink">{info.date}</span> at{" "}
            <span className="font-medium text-ink">{info.timeUk} (UK)</span>. A confirmation will follow by email.
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Booking reference: <span className="font-semibold text-ink">{info.reference}</span>
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            Amount paid: <span className="font-semibold text-ink">£{info.amount}</span>
          </p>
          <Link href="/" className="mt-8 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">
            Back to home
          </Link>
        </div>
      ) : (
        <div className="w-full rounded-3xl border border-black/10 bg-white p-10">
          <h1 className="font-heading text-2xl font-bold text-ink">Payment not completed</h1>
          <p className="mx-auto mt-3 max-w-md text-zinc-600">
            We couldn&apos;t confirm your payment. If you were charged, please contact us and we&apos;ll sort it
            out right away.
          </p>
          <Link href="/book" className="mt-8 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">
            Try again
          </Link>
        </div>
      )}
    </main>
  );
}
