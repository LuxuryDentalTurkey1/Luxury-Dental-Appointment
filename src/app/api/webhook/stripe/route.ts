import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBookingFromSession } from "@/lib/createBooking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe calls this URL the moment a payment is confirmed — even if the
// patient closes the tab and never reaches /book/success. This is the
// reliable safety net that guarantees a paid consultation is recorded.
// Configure it in Stripe → Developers → Webhooks → add endpoint
//   https://<your-domain>/api/webhook/stripe   event: checkout.session.completed
// then put the signing secret in STRIPE_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    // Bad/forged signature — reject so only genuine Stripe events are trusted.
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }
    try {
      // The event already carries the full session (payment_status + our
      // metadata), so we use it directly — no extra API call. A Stripe
      // "send test event" has no metadata, so createBookingFromSession just
      // returns created:false and we still ack 200.
      const session = event.data.object as Stripe.Checkout.Session;
      await createBookingFromSession(session, supabase);
    } catch (e) {
      console.error("[stripe webhook]", e);
      // 500 → Stripe retries later; createBookingFromSession is idempotent so
      // a retry can't create a duplicate.
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
