import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPatientEmail, bookingRef } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Daily cron: emails a "your consultation is tomorrow" reminder to every patient
// whose upcoming appointment is on the next UK day. Scheduled via vercel.json.
// Protected by CRON_SECRET (Vercel Cron sends it as a Bearer token).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new NextResponse("Cron secret not configured", { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 500 });
  }

  const tomorrow = DateTime.now().setZone("Europe/London").plus({ days: 1 }).toFormat("yyyy-LL-dd");
  const { data, error } = await supabase
    .from("bookings")
    .select("id,full_name,email,consultation_type,appointment_date,appointment_time_uk,duration_minutes,transaction_id")
    .eq("appointment_date", tomorrow)
    .eq("status", "upcoming");
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  let sent = 0;
  for (const b of data ?? []) {
    const seed = b.transaction_id && b.transaction_id !== "manual" ? b.transaction_id : b.id;
    try {
      await sendPatientEmail("reminder", {
        full_name: b.full_name,
        email: b.email,
        consultation_type: b.consultation_type,
        appointment_date: b.appointment_date,
        appointment_time_uk: b.appointment_time_uk,
        duration_minutes: b.duration_minutes,
        reference: bookingRef(seed),
      });
      sent++;
    } catch (e) {
      console.error("[reminder]", e);
    }
  }

  return NextResponse.json({ ok: true, date: tomorrow, count: (data ?? []).length, sent });
}
