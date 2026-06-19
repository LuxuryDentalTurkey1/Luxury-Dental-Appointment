"use client";

import { useEffect, useState } from "react";

type Variant = "primary" | "danger" | "ghost";
export interface ConfirmAction {
  label: string;
  value: string;
  variant?: Variant;
}
export interface ConfirmOptions {
  title: string;
  message?: string;
  actions: ConfirmAction[];
}

// Promise-based, in-app replacement for window.confirm(). Mount <ConfirmHost/>
// once, then call confirmDialog(...) anywhere; it resolves to the clicked
// action's `value` (or null if dismissed).
let openFn: ((opts: ConfirmOptions) => Promise<string | null>) | null = null;

export function confirmDialog(opts: ConfirmOptions): Promise<string | null> {
  return openFn ? openFn(opts) : Promise.resolve(null);
}

const btnCls: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink/90",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "border border-black/10 text-zinc-700 hover:bg-black/[0.04]",
};

export default function ConfirmHost() {
  const [pending, setPending] = useState<{ opts: ConfirmOptions; resolve: (v: string | null) => void } | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    openFn = (opts) => new Promise((resolve) => setPending({ opts, resolve }));
    return () => {
      openFn = null;
    };
  }, []);

  useEffect(() => {
    if (pending) requestAnimationFrame(() => setShow(true));
    else setShow(false);
  }, [pending]);

  function choose(v: string | null) {
    pending?.resolve(v);
    setPending(null);
  }

  if (!pending) return null;
  const { opts } = pending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={() => choose(null)}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-150 ${show ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl transition-all duration-150 ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <div className="px-6 pt-6">
          <h3 className="font-heading text-lg font-bold text-ink">{opts.title}</h3>
          {opts.message && <p className="mt-2 text-sm leading-relaxed text-zinc-600">{opts.message}</p>}
        </div>
        <div className="mt-5 flex flex-col gap-2 p-4">
          {opts.actions.map((a) => (
            <button
              key={a.value}
              onClick={() => choose(a.value)}
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${btnCls[a.variant || "primary"]}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
