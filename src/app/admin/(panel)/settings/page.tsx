import { getSettings, getBlockedDates } from "@/lib/settings";
import AdminSettings from "@/components/admin/AdminSettings";

export default async function AdminSettingsPage() {
  const [settings, blockedDates] = await Promise.all([getSettings(), getBlockedDates()]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Set your prices, durations, available days, and block specific dates.
      </p>
      <AdminSettings settings={settings} blockedDates={blockedDates} />
    </div>
  );
}
