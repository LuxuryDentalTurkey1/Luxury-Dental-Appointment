// Server-only: sends clinic + patient emails via Brevo.

import { DateTime } from "luxon";

const CLINIC_ADDRESS = "937 Wimborne Road, Moordown, Bournemouth BH9 2BN";

export interface BookingNotice {
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
}

function esc(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// "Fri, Jun 5 at 11:00am" from date "2026-06-05" + UK time "11:00".
function formatWhen(date: string, timeUk: string) {
  const dt = DateTime.fromISO(`${date}T${timeUk}`, { zone: "Europe/London" });
  if (!dt.isValid) return `${date} at ${timeUk}`;
  return dt.toFormat("ccc, LLL d 'at' h:mm") + dt.toFormat("a").toLowerCase();
}

export async function sendBookingNotification(b: BookingNotice) {
  const apiKey = process.env.BREVO_API_KEY;
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !to || !senderEmail) {
    console.log("[booking-email] skipped — Brevo env not fully set");
    return;
  }

  const typeLabel =
    b.consultation_type === "online"
      ? "Online Video Consultation"
      : "Face-to-Face Consultation";

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111">
      <h2 style="margin:0 0 12px">New appointment booked</h2>
      <table cellpadding="6" style="font-size:14px;border-collapse:collapse">
        <tr><td><b>Type</b></td><td>${esc(typeLabel)} (${b.duration_minutes} min)</td></tr>
        <tr><td><b>Date</b></td><td>${esc(b.appointment_date)}</td></tr>
        <tr><td><b>Time (UK)</b></td><td>${esc(b.appointment_time_uk)}</td></tr>
        <tr><td><b>Name</b></td><td>${esc(b.full_name)}</td></tr>
        <tr><td><b>Email</b></td><td>${esc(b.email)}</td></tr>
        <tr><td><b>Phone</b></td><td>${esc(b.phone)}</td></tr>
        <tr><td><b>Country</b></td><td>${esc(b.country)}</td></tr>
        <tr><td><b>Treatment</b></td><td>${esc(b.treatment)}</td></tr>
        <tr><td><b>Paid</b></td><td>£${b.price_gbp}</td></tr>
        ${b.notes ? `<tr><td><b>Notes</b></td><td>${esc(b.notes)}</td></tr>` : ""}
      </table>
    </div>
  `;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: process.env.BREVO_SENDER_NAME || "Luxury Dental Turkey",
      },
      to: [{ email: to }],
      subject: "New appointment booked",
      htmlContent: html,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    console.error("[booking-email] Brevo error", res.status, body);
    throw new Error(`Brevo ${res.status}`);
  }
  console.log("[booking-email] sent OK", res.status, body);
}

export interface PatientEmailBooking {
  full_name: string;
  email: string;
  consultation_type: string;
  appointment_date: string;
  appointment_time_uk: string;
  duration_minutes?: number;
  reference?: string;
}

// Short human-friendly booking reference from a stable seed (row id or
// Stripe payment id), e.g. "LDT-6A9902". Last 6 alphanumerics, uppercased.
export function bookingRef(seed: string) {
  const a = String(seed).replace(/[^A-Za-z0-9]/g, "");
  return "LDT-" + a.slice(-6).toUpperCase();
}

// Google Calendar link + a base64 .ics attachment for the appointment.
function calendarAssets(b: PatientEmailBooking) {
  const isOnline = b.consultation_type === "online";
  const startUk = DateTime.fromISO(`${b.appointment_date}T${b.appointment_time_uk}`, { zone: "Europe/London" });
  const dur = b.duration_minutes || (isOnline ? 30 : 60);
  const endUk = startUk.plus({ minutes: dur });
  const fmt = (d: DateTime) => d.toUTC().toFormat("yyyyLLdd'T'HHmmss'Z'");
  const dtStart = fmt(startUk);
  const dtEnd = fmt(endUk);
  const title = `${isOnline ? "Online Video Consultation" : "Consultation"} - Luxury Dental Turkey`;
  const location = isOnline ? "Online video call (WhatsApp)" : CLINIC_ADDRESS.replace(/\n/g, ", ");
  const details = isOnline
    ? "You will receive a WhatsApp video call from our team at the scheduled time."
    : "Your consultation will take place at the address shown.";
  const uid = `${b.reference || dtStart}-${b.email}`.replace(/[^a-zA-Z0-9@.-]/g, "") + "@luxurydentalturkey.com";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Luxury Dental Turkey//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(DateTime.utc())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const googleUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${dtStart}/${dtEnd}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(location)}`;
  return { googleUrl, icsBase64: Buffer.from(ics, "utf-8").toString("base64") };
}

// Sends the PATIENT a confirmation / update / reminder email. Best-effort.
// Wording mirrors the clinic's WhatsApp templates.
export async function sendPatientEmail(
  kind: "confirmation" | "update" | "reminder",
  b: PatientEmailBooking
) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail || !b.email) {
    console.log("[patient-email] skipped (missing config or patient email)");
    return;
  }

  const isOnline = b.consultation_type === "online";
  const firstName = b.full_name.split(" ")[0] || "there";
  const when = formatWhen(b.appointment_date, b.appointment_time_uk);
  // Online patients are often abroad, so we make the UK timezone explicit.
  const whenLabel = isOnline ? `${when} (UK time)` : when;

  let subject: string;
  let intro: string;
  let reschedule: string;
  let closing: string;

  if (kind === "confirmation") {
    subject = "Your consultation is confirmed";
    intro = isOnline
      ? "Your Online Video Consultation appointment with Luxury Dental Turkey is confirmed."
      : "Your Consultation appointment with Luxury Dental Turkey is confirmed.";
    reschedule = "If you need to reschedule your appointment, please let us know.";
    closing = isOnline ? "We look forward to speaking with you." : "We look forward to meeting you.";
  } else if (kind === "update") {
    subject = "Your consultation has been updated";
    intro = isOnline
      ? "Your Online Video Consultation appointment with Luxury Dental Turkey has been updated. Here are your new details."
      : "Your Consultation appointment with Luxury Dental Turkey has been updated. Here are your new details.";
    reschedule = "If you need to make any further changes, please let us know.";
    closing = isOnline ? "We look forward to speaking with you." : "We look forward to meeting you.";
  } else {
    subject = "Reminder: your consultation is tomorrow";
    intro = isOnline
      ? "We would like to remind you that your Online Video Consultation with Luxury Dental Turkey is scheduled for tomorrow."
      : "We would like to remind you that your Consultation with Luxury Dental Turkey is scheduled for tomorrow.";
    reschedule = "If you need to reschedule, please let us know as soon as possible.";
    closing = isOnline
      ? "We look forward to speaking with you."
      : "We look forward to welcoming you tomorrow.";
  }

  const goldLabel =
    "margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#c5a253";

  let detailBlock: string;
  if (isOnline) {
    detailBlock = `<p style="margin:20px 0 0;font-size:15px;line-height:1.65;color:#333">You will receive a WhatsApp video call from a member of our team at the scheduled time.</p>`;
  } else {
    const locIntro =
      kind === "reminder"
        ? `<p style="${goldLabel}">Location</p>`
        : `<p style="margin:20px 0 6px;font-size:15px;line-height:1.65;color:#333">Your consultation will take place at the following address:</p>`;
    detailBlock = `${locIntro}<p style="margin:0;font-size:15px;font-weight:600;line-height:1.6;color:#111">${esc(
      CLINIC_ADDRESS
    )}</p>`;
  }

  const cal = calendarAssets(b);
  const refLine = b.reference
    ? `<p style="margin:10px 0 0;font-size:13px;color:#888">Booking reference: <b style="color:#111">${esc(b.reference)}</b></p>`
    : "";

  const html = `
  <div style="background:#f5f5f4;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececec">
      <div style="background:#111111;padding:22px 28px;text-align:center">
        <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.02em">Luxury Dental <span style="color:#c5a253">Turkey</span></span>
      </div>
      <div style="padding:30px 28px">
        <p style="margin:0 0 14px;font-size:16px;color:#111">Hi ${esc(firstName)}!</p>
        <p style="margin:0;font-size:15px;line-height:1.65;color:#333">${intro}</p>
        <div style="margin:22px 0;padding:16px 18px;background:#faf7f0;border:1px solid #ecdfc4;border-radius:12px">
          <p style="${goldLabel}">Date and Time</p>
          <p style="margin:0;font-size:17px;font-weight:600;color:#111">${esc(whenLabel)}</p>
        </div>
        ${refLine}
        ${detailBlock}
        <div style="margin:22px 0 0">
          <a href="${cal.googleUrl}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 16px;border-radius:8px">Add to Google Calendar</a>
          <span style="display:block;margin-top:8px;font-size:12px;color:#888">Apple or Outlook users: open the attached <b>appointment.ics</b> file.</span>
        </div>
        <p style="margin:22px 0 0;font-size:14px;line-height:1.65;color:#666">${reschedule}</p>
        <p style="margin:22px 0 0;font-size:15px;line-height:1.65;color:#333">${closing}</p>
        <p style="margin:18px 0 0;font-size:15px;font-weight:600;color:#111">Luxury Dental Turkey</p>
      </div>
    </div>
  </div>`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || "Luxury Dental Turkey" },
      to: [{ email: b.email }],
      subject,
      htmlContent: html,
      attachment: [{ content: cal.icsBase64, name: "appointment.ics" }],
    }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error("[patient-email] error", res.status, body);
    return;
  }
  console.log("[patient-email] sent", kind, res.status);
}
