"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings, addBlockedDate, removeBlockedDate } from "@/app/admin/actions";
import type { AppSettings } from "@/lib/booking";

const numInput =
  "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20";

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function AdminSettings({
  settings,
  blockedDates,
}: {
  settings: AppSettings;
  blockedDates: string[];
}) {
  const router = useRouter();
  const [s, setS] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
    setSavedMsg(null);
  }

  async function onSave() {
    setSaving(true);
    setSavedMsg(null);
    const res = await saveSettings({
      face_to_face_price: Number(s.face_to_face_price),
      face_to_face_duration: Number(s.face_to_face_duration),
      online_price: Number(s.online_price),
      online_duration: Number(s.online_duration),
      thursday_enabled: s.thursday_enabled,
      friday_enabled: s.friday_enabled,
      f2f_start_hour: Number(s.f2f_start_hour),
      f2f_last_hour: Number(s.f2f_last_hour),
      online_start_hour: Number(s.online_start_hour),
      online_last_hour: Number(s.online_last_hour),
      online_thu_fri_from_hour: Number(s.online_thu_fri_from_hour),
    });
    setSaving(false);
    setSavedMsg(res.ok ? "Saved ✓" : `Error: ${res.error}`);
    if (res.ok) router.refresh();
  }

  async function onAddDate() {
    if (!newDate) return;
    setBusy(true);
    await addBlockedDate(newDate, newReason);
    setBusy(false);
    setNewDate("");
    setNewReason("");
    router.refresh();
  }

  async function onRemove(d: string) {
    setBusy(true);
    await removeBlockedDate(d);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {/* Pricing & availability */}
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-ink">Pricing &amp; availability</h2>

        <div className="mt-5 space-y-5">
          <div>
            <div className="text-sm font-semibold text-ink">Face-to-Face Consultation</div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-zinc-500">
                Price (£)
                <input type="number" min={0} step="1" value={s.face_to_face_price} onChange={(e) => set("face_to_face_price", Number(e.target.value))} className={`mt-1 ${numInput}`} />
              </label>
              <label className="text-xs font-medium text-zinc-500">
                Duration (min)
                <input type="number" min={5} step="5" value={s.face_to_face_duration} onChange={(e) => set("face_to_face_duration", Number(e.target.value))} className={`mt-1 ${numInput}`} />
              </label>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-ink">Online Video Consultation</div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-zinc-500">
                Price (£)
                <input type="number" min={0} step="1" value={s.online_price} onChange={(e) => set("online_price", Number(e.target.value))} className={`mt-1 ${numInput}`} />
              </label>
              <label className="text-xs font-medium text-zinc-500">
                Duration (min)
                <input type="number" min={5} step="5" value={s.online_duration} onChange={(e) => set("online_duration", Number(e.target.value))} className={`mt-1 ${numInput}`} />
              </label>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-ink">Available days</div>
            <div className="mt-2 flex gap-3">
              <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm">
                <input type="checkbox" checked={s.thursday_enabled} onChange={(e) => set("thursday_enabled", e.target.checked)} className="accent-[#c5a253]" />
                Thursdays
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm">
                <input type="checkbox" checked={s.friday_enabled} onChange={(e) => set("friday_enabled", e.target.checked)} className="accent-[#c5a253]" />
                Fridays
              </label>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-ink">Working hours (UK, 24h)</div>
            <p className="mt-1 text-xs text-zinc-400">First slot starts at the start hour; the last slot starts at the last hour.</p>
            <div className="mt-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-zinc-500">Face-to-Face start<input type="number" min={0} max={23} value={s.f2f_start_hour} onChange={(e) => set("f2f_start_hour", Number(e.target.value))} className={`mt-1 ${numInput}`} /></label>
                <label className="text-xs font-medium text-zinc-500">Face-to-Face last<input type="number" min={0} max={23} value={s.f2f_last_hour} onChange={(e) => set("f2f_last_hour", Number(e.target.value))} className={`mt-1 ${numInput}`} /></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-zinc-500">Online start<input type="number" min={0} max={23} value={s.online_start_hour} onChange={(e) => set("online_start_hour", Number(e.target.value))} className={`mt-1 ${numInput}`} /></label>
                <label className="text-xs font-medium text-zinc-500">Online last<input type="number" min={0} max={23} value={s.online_last_hour} onChange={(e) => set("online_last_hour", Number(e.target.value))} className={`mt-1 ${numInput}`} /></label>
              </div>
              <label className="block text-xs font-medium text-zinc-500">
                On Thu/Fri, online opens from (hour)
                <input type="number" min={0} max={23} value={s.online_thu_fri_from_hour} onChange={(e) => set("online_thu_fri_from_hour", Number(e.target.value))} className={`mt-1 ${numInput}`} />
                <span className="mt-1 block text-[11px] text-zinc-400">Thu/Fri daytime is kept for face-to-face, so online starts in the evening from this hour.</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={onSave} disabled={saving} className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save settings"}
          </button>
          {savedMsg && <span className="text-sm text-zinc-500">{savedMsg}</span>}
        </div>
      </div>

      {/* Blocked dates */}
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-ink">Blocked dates</h2>
        <p className="mt-1 text-xs text-zinc-500">Close specific days (holidays / time off). Patients can&apos;t book these.</p>

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-zinc-500">
            Date
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={`mt-1 ${numInput}`} />
          </label>
          <label className="flex-1 text-xs font-medium text-zinc-500">
            Reason (optional)
            <input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="e.g. Holiday" className={`mt-1 ${numInput}`} />
          </label>
          <button onClick={onAddDate} disabled={busy || !newDate} className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Block
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {blockedDates.length === 0 ? (
            <p className="text-sm text-zinc-400">No blocked dates.</p>
          ) : (
            blockedDates.map((d) => (
              <div key={d} className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2">
                <span className="text-sm text-ink">{prettyDate(d)}</span>
                <button onClick={() => onRemove(d)} disabled={busy} className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50">
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
