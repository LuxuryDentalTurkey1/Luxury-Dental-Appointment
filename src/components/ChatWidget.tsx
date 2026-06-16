"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-zinc-400 focus:border-gold focus:ring-2 focus:ring-gold/20";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState({ name: "", email: "", text: "" });

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("messages").insert({
      name: msg.name.trim(),
      email: msg.email.trim(),
      body: msg.text.trim(),
    });
    setSending(false);
    if (error) {
      setError("Sorry, your message couldn't be sent. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-[340px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-ink px-5 py-4 text-white">
            <div>
              <div className="font-heading text-base font-bold">Chat with us</div>
              <div className="text-xs text-white/60">We usually reply within a few hours</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/70 transition-colors hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-4">
            {sent ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <p className="font-medium text-ink">Thank you!</p>
                <p className="mt-1 text-sm text-zinc-500">
                  We&apos;ve received your message and will get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={send} className="space-y-3">
                <div className="rounded-xl bg-zinc-100 px-3 py-2.5 text-sm text-zinc-600">
                  👋 Hi! How can we help with your smile? Leave a message and we&apos;ll reply by email or WhatsApp.
                </div>
                <input required placeholder="Your name" value={msg.name} onChange={(e) => setMsg({ ...msg, name: e.target.value })} className={inputCls} />
                <input required type="email" placeholder="Your email" value={msg.email} onChange={(e) => setMsg({ ...msg, email: e.target.value })} className={inputCls} />
                <textarea required rows={3} placeholder="Your message" value={msg.text} onChange={(e) => setMsg({ ...msg, text: e.target.value })} className={`${inputCls} resize-none`} />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button type="submit" disabled={sending} className="w-full rounded-xl bg-ink py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:opacity-50">
                  {sending ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with us"
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-xl ring-1 ring-gold/40 transition-transform hover:scale-105"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        )}
      </button>
    </>
  );
}
