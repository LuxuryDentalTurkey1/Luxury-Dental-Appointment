import CalendarView from "@/components/admin/CalendarView";
import { getSettings } from "@/lib/settings";

export default async function AdminCalendarPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink">Calendar</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Day view of appointments (UK time). Click an appointment to edit it.
      </p>
      <div className="mt-6">
        <CalendarView settings={settings} />
      </div>
    </div>
  );
}
