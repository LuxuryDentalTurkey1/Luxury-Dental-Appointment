"use client";

import { useState } from "react";
import { createManualBooking } from "@/app/admin/actions";
import { COUNTRY_SUGGESTIONS, TREATMENTS, type AppSettings, type ConsultationId } from "@/lib/booking";

const fieldCls =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20";

export default function ManualBookingForm({
  settings,
  defaultDate,
  onClose,
  onCreated,
}: {
  settings: AppSettings;
  defaultDate: string;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
}) {
  const [type, setType] = useState<ConsultationId>("face-to-face");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("10:00");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [treatment, setTreatment] = useState("");
  const [price, setPrice] = useState(settings.face_to_face_price);
  const [duration, setDuration] = useState(settings.face_to_face_duration);
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notify, setNotify] = useState(true);

  function changeType(t: ConsultationId) {
    setType(t);
    if (t === "online") {
      setPrice(settings.online_price);
      setDuration(settings.online_duration);
    } else {
      setPrice(settings.face_to_face_price);
      setDuration(settings.face_to_face_duration);
    }
  }

  const valid = Boolean(name.trim() && date && time && treatment);

  async function submit() {
    setBusy(true);
    setErr(null);
    const res = await createManualBooking({
      consultation_type: type,
      appointment_date: date,
      appointment_time_uk: time,
      duration_minutes: Number(duration),
      price_gbp: Number(price),
      full_name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country: country.trim(),
      treatment,
      notes: notes.trim() || null,
      payment_status: paymentStatus,
    }, notify);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error || "Could not create the appointment.");
      return;
    }
    await onCreated();
    onClose();
  }

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/20" />
      <aside className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto bg-white shadow-2xl sm:w-[420px]">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <h3 className="font-heading text-lg font-bold text-ink">Add appointment</h3>
          <button onClick={onClose} aria-label="Close" className="text-zinc-400 hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-3 p-5">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => changeType("face-to-face")} className={`rounded-lg border px-3 py-2 text-sm font-medium ${type === "face-to-face" ? "border-gold bg-gold/[0.06] text-ink" : "border-black/10 text-zinc-600"}`}>Face-to-Face</button>
            <button onClick={() => changeType("online")} className={`rounded-lg border px-3 py-2 text-sm font-medium ${type === "online" ? "border-gold bg-gold/[0.06] text-ink" : "border-black/10 text-zinc-600"}`}>Online Video</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-medium text-zinc-500">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 ${fieldCls}`} /></label>
            <label className="text-xs font-medium text-zinc-500">Time (UK)<input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`mt-1 ${fieldCls}`} /></label>
          </div>

          <label className="block text-xs font-medium text-zinc-500">Full name *<input value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 ${fieldCls}`} placeholder="Patient name" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-medium text-zinc-500">Email<input value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-1 ${fieldCls}`} placeholder="optional" /></label>
            <label className="text-xs font-medium text-zinc-500">Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} className={`mt-1 ${fieldCls}`} placeholder="optional" /></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-medium text-zinc-500">Country<input list="mb-countries" value={country} onChange={(e) => setCountry(e.target.value)} className={`mt-1 ${fieldCls}`} placeholder="optional" /><datalist id="mb-countries">{COUNTRY_SUGGESTIONS.map((c) => (<option key={c} value={c} />))}</datalist></label>
            <label className="text-xs font-medium text-zinc-500">Treatment *<select value={treatment} onChange={(e) => setTreatment(e.target.value)} className={`mt-1 ${fieldCls}`}><option value="">Select…</option>{TREATMENTS.map((t) => (<option key={t} value={t}>{t}</option>))}</select></label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs font-medium text-zinc-500">Price (£)<input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className={`mt-1 ${fieldCls}`} /></label>
            <label className="text-xs font-medium text-zinc-500">Duration (min)<input type="number" min={5} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={`mt-1 ${fieldCls}`} /></label>
          </div>

          <label className="block text-xs font-medium text-zinc-500">Payment<select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={`mt-1 ${fieldCls}`}><option value="unpaid">Not paid yet</option><option value="paid">Paid (cash / manual)</option></select></label>

          <label className="block text-xs font-medium text-zinc-500">Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`mt-1 resize-none ${fieldCls}`} placeholder="Optional" /></label>

          <label className="flex items-center gap-2 rounded-lg bg-gold/[0.06] px-3 py-2 text-sm text-zinc-700">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-[#c5a253]" />
            Send a confirmation email to the patient
          </label>

          {err && <p className="text-sm text-red-500">{err}</p>}

          <button onClick={submit} disabled={!valid || busy} className="w-full rounded-xl bg-ink py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? "Saving…" : "Create appointment"}
          </button>
        </div>
      </aside>
    </>
  );
}
