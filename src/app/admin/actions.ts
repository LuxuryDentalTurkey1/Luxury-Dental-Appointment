"use server";

import { revalidatePath } from "next/cache";
import { DateTime } from "luxon";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { sendPatientEmail, bookingRef } from "@/lib/notify";
import { syncFreshaBlocks } from "@/lib/fresha";

export async function updateBookingStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateStaffNotes(id: string, staff_notes: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update({ staff_notes }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/bookings");
  return { ok: true };
}

export interface SettingsInput {
  face_to_face_price: number;
  face_to_face_duration: number;
  online_price: number;
  online_duration: number;
  thursday_enabled: boolean;
  friday_enabled: boolean;
  f2f_start_hour: number;
  f2f_last_hour: number;
  online_start_hour: number;
  online_last_hour: number;
  online_thu_fri_from_hour: number;
}

export async function saveSettings(s: SettingsInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({ ...s, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) {
    // The working-hours columns may not exist yet (SQL not run) — save the core fields.
    const core = {
      face_to_face_price: s.face_to_face_price,
      face_to_face_duration: s.face_to_face_duration,
      online_price: s.online_price,
      online_duration: s.online_duration,
      thursday_enabled: s.thursday_enabled,
      friday_enabled: s.friday_enabled,
    };
    const retry = await supabase
      .from("settings")
      .update({ ...core, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (retry.error) return { ok: false, error: retry.error.message };
  }
  revalidatePath("/admin/settings");
  revalidatePath("/book");
  return { ok: true };
}

export async function addBlockedDate(date: string, reason: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blocked_dates").insert({ date, reason: reason || null });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/book");
  return { ok: true };
}

export async function removeBlockedDate(date: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blocked_dates").delete().eq("date", date);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/book");
  return { ok: true };
}

export async function rescheduleBooking(
  id: string,
  appointment_date: string,
  appointment_time_uk: string,
  notify = false
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ appointment_date, appointment_time_uk })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (notify) {
    const { data } = await supabase
      .from("bookings")
      .select("full_name,email,consultation_type,appointment_date,appointment_time_uk,duration_minutes,transaction_id")
      .eq("id", id)
      .single();
    if (data) {
      const seed = data.transaction_id && data.transaction_id !== "manual" ? data.transaction_id : id;
      try { await sendPatientEmail("update", { ...data, reference: bookingRef(seed) }); } catch (e) { console.error(e); }
    }
  }
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}

export interface ManualBookingInput {
  consultation_type: string;
  appointment_date: string;
  appointment_time_uk: string;
  duration_minutes: number;
  price_gbp: number;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  treatment: string;
  notes: string | null;
  payment_status: string; // 'paid' | 'unpaid'
}

export async function createManualBooking(p: ManualBookingInput, notify = false) {
  const supabase = await createClient();
  const paid = p.payment_status === "paid";
  const { data: inserted, error } = await supabase.from("bookings").insert({
    consultation_type: p.consultation_type,
    appointment_date: p.appointment_date,
    appointment_time_uk: p.appointment_time_uk,
    duration_minutes: p.duration_minutes,
    price_gbp: p.price_gbp,
    full_name: p.full_name,
    email: p.email,
    phone: p.phone,
    country: p.country,
    treatment: p.treatment,
    notes: p.notes,
    status: "upcoming",
    payment_status: p.payment_status,
    amount_paid: paid ? p.price_gbp : null,
    paid_at: paid ? new Date().toISOString() : null,
    transaction_id: paid ? "manual" : null,
    staff_notes: "Added manually by staff",
  }).select("id").single();
  if (error) return { ok: false, error: error.message };
  if (notify && p.email) {
    try {
      await sendPatientEmail("confirmation", {
        full_name: p.full_name,
        email: p.email,
        consultation_type: p.consultation_type,
        appointment_date: p.appointment_date,
        appointment_time_uk: p.appointment_time_uk,
        duration_minutes: p.duration_minutes,
        reference: inserted ? bookingRef(inserted.id) : undefined,
      });
    } catch (e) {
      console.error(e);
    }
  }
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}

export async function addTimeBlock(date: string, start_time: string, end_time: string, note: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("time_blocks").insert({ date, start_time, end_time, note: note || null });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/calendar");
  return { ok: true };
}

export async function removeTimeBlock(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("time_blocks").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/calendar");
  return { ok: true };
}

export async function updateTimeBlock(id: string, date: string, start_time: string, end_time: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("time_blocks").update({ date, start_time, end_time }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/calendar");
  return { ok: true };
}

// Refunds the Stripe payment for a booking and marks it refunded + cancelled.
export async function refundBooking(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  const { data: b } = await supabase
    .from("bookings")
    .select("transaction_id,payment_status")
    .eq("id", id)
    .single();
  if (!b) return { ok: false as const, error: "Booking not found" };
  if (b.payment_status !== "paid" || !b.transaction_id || b.transaction_id === "manual") {
    return { ok: false as const, error: "This booking has no online card payment to refund." };
  }
  try {
    await stripe.refunds.create({ payment_intent: b.transaction_id });
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Refund failed" };
  }
  const { error } = await supabase
    .from("bookings")
    .update({ payment_status: "refunded", status: "cancelled" })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function deleteBooking(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true as const };
}

// Marks any still-"upcoming" booking whose end time has passed (UK) as completed.
export async function autoCompletePast() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, completed: 0 };
  const nowUk = DateTime.now().setZone("Europe/London");
  const today = nowUk.toFormat("yyyy-LL-dd");
  const { data } = await supabase
    .from("bookings")
    .select("id,appointment_date,appointment_time_uk,duration_minutes")
    .eq("status", "upcoming")
    .lte("appointment_date", today);
  const ids = (data ?? [])
    .filter((b) => {
      const end = DateTime.fromISO(`${b.appointment_date}T${b.appointment_time_uk}`, {
        zone: "Europe/London",
      }).plus({ minutes: b.duration_minutes || 0 });
      return end < nowUk;
    })
    .map((b) => b.id);
  if (ids.length) {
    await supabase.from("bookings").update({ status: "completed" }).in("id", ids);
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
  }
  return { ok: true as const, completed: ids.length };
}

export async function syncFresha() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  return syncFreshaBlocks(supabase);
}

export async function resizeBooking(id: string, duration_minutes: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update({ duration_minutes }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/bookings");
  return { ok: true };
}
