"use server";

import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getSettings } from "@/lib/settings";

export interface BookingPayload {
  consultation_type: string;
  appointment_date: string;
  appointment_time_uk: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  treatment?: string;
  notes: string | null;
}

export async function createCheckoutSession(
  payload: BookingPayload
): Promise<{ url?: string; error?: string }> {
  try {
    // Price & duration come from the server-side settings — never trust the client.
    const settings = await getSettings();
    const isOnline = payload.consultation_type === "online";
    const price = isOnline ? settings.online_price : settings.face_to_face_price;
    const duration = isOnline ? settings.online_duration : settings.face_to_face_duration;
    const typeLabel = isOnline ? "Online Video Consultation" : "Face-to-Face Consultation";

    const h = await headers();
    const host = h.get("host") || "localhost:3010";
    const proto = host.startsWith("localhost") ? "http" : "https";
    const origin = `${proto}://${host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: payload.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(price * 100),
            product_data: {
              name: `${typeLabel} · Luxury Dental Turkey`,
              description: `${payload.appointment_date} at ${payload.appointment_time_uk} (UK) · ${duration} min`,
            },
          },
        },
      ],
      metadata: {
        consultation_type: payload.consultation_type,
        appointment_date: payload.appointment_date,
        appointment_time_uk: payload.appointment_time_uk,
        duration_minutes: String(duration),
        price_gbp: String(price),
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        country: payload.country,
        treatment: payload.treatment || "",
        notes: payload.notes || "",
      },
      success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book?canceled=1`,
    });

    return { url: session.url || undefined };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not start payment" };
  }
}
