import { createClient } from "@/lib/supabase/server";
import type { MessageRow } from "@/lib/types";

function timeAgo(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
  const messages = (data ?? []) as MessageRow[];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink">Messages</h1>
      <p className="mt-1 text-sm text-zinc-500">{messages.length} message{messages.length === 1 ? "" : "s"} from the website chat.</p>

      <div className="mt-6 space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white px-5 py-12 text-center text-sm text-zinc-400">
            No messages yet.
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-ink">{m.name}</span>
                  <a href={`mailto:${m.email}`} className="ml-2 text-sm text-gold hover:underline">{m.email}</a>
                </div>
                <span className="text-xs text-zinc-400">{timeAgo(m.created_at)}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{m.body}</p>
              <a
                href={`mailto:${m.email}?subject=Re:%20Your%20message%20to%20Luxury%20Dental%20Turkey`}
                className="mt-3 inline-block rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white"
              >
                Reply by email
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
