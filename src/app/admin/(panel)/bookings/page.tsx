import { createClient } from "@/lib/supabase/server";
import type { BookingRow } from "@/lib/types";
import BookingCard from "@/components/admin/BookingCard";
import ExportBookings from "@/components/admin/ExportBookings";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  const bookings = (data ?? []) as BookingRow[];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink">Bookings</h1>
      <p className="mt-1 text-sm text-zinc-500">{bookings.length} total · change status or add private notes below.</p>

      <div className="mt-6">
        <ExportBookings />
      </div>

      <div className="mt-4 space-y-3">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white px-5 py-12 text-center text-sm text-zinc-400">
            No bookings yet.
          </div>
        ) : (
          bookings.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </div>
    </div>
  );
}
