"use client";

import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";

// Sets the `lang` cookie and reloads so both server and client content
// re-render in the chosen language.
export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  function pick(l: Locale) {
    if (l === locale) return;
    document.cookie = `lang=${l}; path=/; max-age=31536000`;
    window.location.reload();
  }
  return (
    <div className="flex items-center gap-0.5 rounded-[10px] border border-black/10 bg-white/40 p-0.5">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => pick(l)}
          aria-label={`Switch language to ${LOCALE_LABELS[l]}`}
          className={`rounded-[8px] px-2 py-1 text-xs font-semibold transition-colors ${
            l === locale ? "bg-ink text-white" : "text-zinc-600 hover:text-ink"
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
