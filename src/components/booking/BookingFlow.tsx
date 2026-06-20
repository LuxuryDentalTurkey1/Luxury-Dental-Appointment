"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import PhoneInput from "react-phone-number-input";
import Calendar from "./Calendar";
import { createCheckoutSession } from "@/app/book/actions";
import { createClient } from "@/lib/supabase/client";
import {
  COUNTRY_SUGGESTIONS,
  buildConsultations,
  localZoneName,
  slotsFor,
  ukSlotView,
  weekdaysForType,
  type AppSettings,
  type ConsultationId,
} from "@/lib/booking";
import { getDict, type Locale } from "@/lib/i18n";

const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-zinc-400 focus:border-gold focus:ring-2 focus:ring-gold/20";

interface FormState {
  name: string;
  phone: string;
  email: string;
  country: string;
  notes: string;
  consent: boolean;
}

function fmtDate(d: Date, locale: string) {
  return d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookingFlow({
  settings,
  blockedDates,
  locale,
}: {
  settings: AppSettings;
  blockedDates: string[];
  locale: Locale;
}) {
  const dict = getDict(locale);
  const t = dict.book;
  const dateLocale = locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-GB";
  const [step, setStep] = useState(0);
  const [typeId, setTypeId] = useState<ConsultationId | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [ukTime, setUkTime] = useState<string | null>(null);
  const [taken, setTaken] = useState<{ s: number; e: number }[]>([]);
  const [form, setForm] = useState<FormState>({
    name: "", phone: "", email: "", country: "", notes: "", consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const consultations = useMemo(() => buildConsultations(settings), [settings]);
  const availableWeekdays = useMemo(
    () => (typeId ? weekdaysForType(typeId, settings) : []),
    [typeId, settings]
  );
  const zone = useMemo(() => localZoneName(), []);
  const consult = typeId ? consultations[typeId] : null;
  const isOnline = typeId === "online";
  const slots = useMemo(
    () => (typeId && consult && date ? slotsFor(typeId, consult.duration, date, settings) : []),
    [typeId, consult, date, settings]
  );

  // Load already-booked time intervals for the selected day (cross-type double-booking guard).
  useEffect(() => {
    if (!date) {
      setTaken([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.rpc("taken_intervals", { p_date: toISODate(date) });
      if (!cancelled) {
        setTaken(((data ?? []) as { start_min: number; end_min: number }[]).map((r) => ({ s: r.start_min, e: r.end_min })));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date]);

  function slotTaken(slot: string) {
    if (!consult) return false;
    const [h, m] = slot.split(":").map(Number);
    const start = h * 60 + m;
    const end = start + consult.duration;
    return taken.some((iv) => start < iv.e && end > iv.s);
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const detailsValid = Boolean(
    form.name.trim() && form.phone.trim() && emailValid && form.country.trim() && form.consent
  );

  const canNext =
    (step === 0 && !!typeId) ||
    (step === 1 && !!date && !!ukTime) ||
    (step === 2 && detailsValid) ||
    step === 3;

  function chooseType(id: ConsultationId) {
    setTypeId(id);
    setDate(null);
    setUkTime(null);
  }
  function chooseDate(d: Date) {
    setDate(d);
    setUkTime(null);
  }

  function timeText() {
    if (!date || !ukTime) return "";
    const v = ukSlotView(date, ukTime);
    if (!isOnline) return `${v.uk} ${t.ukParen}`;
    return v.differs ? `${v.local} ${t.yourTime} · ${v.uk} ${t.ukShort}` : v.local;
  }

  async function goToPayment() {
    if (!typeId || !date || !ukTime || !consult) return;
    setSubmitting(true);
    setSubmitError(null);
    const res = await createCheckoutSession({
      consultation_type: typeId,
      appointment_date: toISODate(date),
      appointment_time_uk: ukTime,
      full_name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      country: form.country.trim(),
      notes: form.notes.trim() || null,
    });
    if (res.url) {
      window.location.href = res.url;
      return;
    }
    setSubmitting(false);
    setSubmitError(res.error || "Could not start payment. Please try again.");
  }

  return (
    <div>
      {/* Stepper */}
      <ol className="mb-8 flex items-center justify-center gap-1 sm:gap-3">
        {t.steps.map((label, i) => (
          <li key={label} className="flex items-center gap-1 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  i < step ? "bg-gold text-white" : i === step ? "bg-ink text-white" : "bg-zinc-100 text-zinc-400",
                ].join(" ")}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className={`hidden text-sm font-medium sm:block ${i === step ? "text-ink" : "text-zinc-400"}`}>
                {label}
              </span>
            </div>
            {i < t.steps.length - 1 && <span className="h-px w-4 bg-zinc-200 sm:w-8" />}
          </li>
        ))}
      </ol>
      {/* On mobile only the step numbers fit, so name the current step here. */}
      <p className="-mt-5 mb-7 text-center text-sm font-semibold text-ink sm:hidden">{t.steps[step]}</p>

      <div className="rounded-3xl border border-black/10 bg-white/70 p-6 backdrop-blur-sm sm:p-8">
        {/* STEP 0 — type */}
        {step === 0 && (
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink">{t.chooseTitle}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t.chooseSub}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Object.values(consultations).map((c) => {
                const active = typeId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => chooseType(c.id)}
                    className={[
                      "flex flex-col rounded-2xl border p-5 text-left transition-all",
                      active ? "border-gold bg-gold/[0.06] ring-2 ring-gold/50" : "border-black/10 hover:border-gold/50",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-heading text-lg font-bold text-ink">
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${active ? "bg-gold text-white" : "border border-black/15 text-transparent"}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        </span>
                        {t.types[c.id].label}
                      </span>
                      <span className="shrink-0 rounded-full bg-ink px-3 py-1 text-sm font-bold text-white">£{c.price}</span>
                    </div>
                    <span className="mt-1 text-sm font-medium text-gold-deep">{c.duration} {t.minutes}</span>
                    <span className="mt-3 text-sm text-zinc-500">{t.types[c.id].blurb}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 rounded-xl bg-gold/[0.08] px-4 py-3 text-center text-sm text-zinc-600">
              {t.feePre}<span className="font-semibold text-gold-deep">{t.feeBold}</span>{t.feePost}
            </p>
          </div>
        )}

        {/* STEP 1 — date & time */}
        {step === 1 && consult && (
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink">{t.pickTitle}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {isOnline ? t.availOnline : t.availF2f}
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Calendar
                availableWeekdays={availableWeekdays}
                blockedDates={blockedDates}
                selected={date}
                onSelect={chooseDate}
              />
              <div>
                {!date ? (
                  <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-black/15 p-6 text-center text-sm text-zinc-400">
                    {t.selectDay}
                  </div>
                ) : (
                  <div>
                    <div className="mb-1 font-heading text-base font-bold text-ink">{fmtDate(date, dateLocale)}</div>
                    <p className="mb-4 text-xs text-zinc-500">
                      {isOnline ? (
                        <>{t.tzOnlinePre}(<span className="font-medium">{zone}</span>){t.tzOnlinePost}</>
                      ) : (
                        <>{t.tzF2f}</>
                      )}
                    </p>
                    {slots.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-black/15 p-6 text-center text-sm text-zinc-400">
                        {t.noTimes}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((s) => {
                          const v = ukSlotView(date, s);
                          const active = ukTime === s;
                          const isTaken = slotTaken(s);
                          const showUkHint = isOnline && v.differs;
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={isTaken}
                              onClick={() => !isTaken && setUkTime(s)}
                              className={[
                                "rounded-xl border px-2 py-2 text-center transition-colors",
                                isTaken
                                  ? "cursor-not-allowed border-black/5 bg-zinc-50 text-zinc-300"
                                  : active
                                    ? "border-ink bg-ink text-white"
                                    : "border-black/10 text-ink hover:border-gold/60 hover:bg-gold/[0.06]",
                              ].join(" ")}
                            >
                              <div className={`text-sm font-semibold ${isTaken ? "line-through" : ""}`}>{isOnline ? v.local : v.uk}</div>
                              {isTaken ? (
                                <div className="text-[10px] text-zinc-300">{t.booked}</div>
                              ) : (
                                showUkHint && <div className={`text-[10px] ${active ? "text-white/70" : "text-zinc-400"}`}>{t.ukShort} {v.uk}</div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — details */}
        {step === 2 && (
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink">{t.detailsTitle}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t.detailsSub}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label={t.fullName} required>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder={t.phName} />
              </Field>
              <Field label={t.emailLabel} required>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder={t.phEmail} />
              </Field>
              <Field label={t.phoneLabel} required>
                <div className="flex items-center rounded-xl border border-black/10 bg-white px-3.5 transition-colors focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
                  <PhoneInput
                    international
                    defaultCountry="GB"
                    countryCallingCodeEditable={false}
                    countryOptionsOrder={["GB", "US", "DE", "FR", "ES", "|", "..."]}
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v || "" })}
                    placeholder={t.phPhone}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {t.phHint}
                </p>
              </Field>
              <Field label={t.countryLabel} required>
                <input list="country-list" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputCls} placeholder={t.phCountry} />
                <datalist id="country-list">
                  {COUNTRY_SUGGESTIONS.map((c) => (<option key={c} value={c} />))}
                </datalist>
              </Field>
              <Field label={t.notesLabel}>
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} placeholder={t.phNotes} />
              </Field>
            </div>
            <label className="mt-5 flex items-start gap-2.5 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-[#c5a253]"
              />
              <span>
                {t.consentPre}
                <a href="/privacy" target="_blank" rel="noreferrer" className="font-medium text-gold-deep underline">{dict.footer.privacy}</a>
                {t.consentMid}
                <a href="/terms" target="_blank" rel="noreferrer" className="font-medium text-gold-deep underline">{dict.footer.terms}</a>
                {t.consentEnd}
              </span>
            </label>
            {form.email && !emailValid && (
              <p className="mt-2 text-xs text-red-500">{t.emailInvalid}</p>
            )}
          </div>
        )}

        {/* STEP 3 — review */}
        {step === 3 && consult && date && ukTime && (
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink">{t.reviewTitle}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t.reviewSub}</p>
            <dl className="mt-6 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/10">
              <Row k={t.rConsultation} v={`${isOnline ? t.types.online.label : t.types["face-to-face"].label} · ${consult.duration} ${t.minShort}`} />
              <Row k={t.rDate} v={fmtDate(date, dateLocale)} />
              <Row k={t.rTime} v={timeText()} />
              <Row k={t.rName} v={form.name} />
              <Row k={t.rEmail} v={form.email} />
              <Row k={t.rPhone} v={form.phone} />
              <Row k={t.rCountry} v={form.country} />
              {form.notes && <Row k={t.rNotes} v={form.notes} />}
              <Row k={t.rTotal} v={`£${consult.price}`} highlight />
            </dl>
            <p className="mt-3 text-center text-xs text-zinc-500">
              {t.reviewFeeNote}
            </p>
            {submitError && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{submitError}</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:text-ink disabled:invisible"
          >
            ← {t.back}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext}
              className="rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.continueBtn}
            </button>
          ) : (
            <button
              type="button"
              onClick={goToPayment}
              disabled={submitting}
              className="rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? t.redirecting : `${t.toPayment} · £${consult?.price ?? ""}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-gold-deep"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-sm text-zinc-500">{k}</dt>
      <dd className={`text-right text-sm ${highlight ? "font-bold text-ink" : "font-medium text-ink"}`}>{v}</dd>
    </div>
  );
}
