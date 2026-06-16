import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";

export default async function HowItWorksPage() {
  const t = getDict(await getLocale()).how;
  return (
    <main className="mx-auto max-w-[920px] px-6 pb-24 pt-[150px]">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{t.kicker}</p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {t.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
          {t.sub}
        </p>
      </div>

      {/* Fee-deducted highlight */}
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-gold/30 bg-gold/[0.06] px-6 py-5 text-center">
        <p className="text-base font-medium text-ink">
          {t.feeNotePre}
          <span className="font-bold text-gold-deep">{t.feeNoteBold}</span>
          {t.feeNotePost}
        </p>
      </div>

      <div className="mt-12 space-y-5">
        {t.steps.map((s, i) => (
          <div key={i} className="flex gap-5 rounded-2xl border border-black/10 bg-white p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink font-heading text-lg font-bold text-white">
              {i + 1}
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-ink">{s.title}</h2>
              <p className="mt-1 text-zinc-600">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/book"
          className="inline-flex items-center gap-3 rounded-[16px] bg-ink px-7 py-4 text-base font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          {t.cta}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-black">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </Link>
        <p className="mt-4 text-sm text-zinc-500">{t.ctaNote}</p>
      </div>
    </main>
  );
}
