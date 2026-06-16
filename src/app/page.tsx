import Link from "next/link";
import HeroVisual from "@/components/HeroVisual";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#c5a253">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ArrowCircle() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-black">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

export default async function Home() {
  const t = getDict(await getLocale()).home;
  return (
    <main className="relative overflow-hidden">
      {/* Large soft gold ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 75% 80% at 12% 18%, rgba(231,206,140,0.55), transparent 60%), radial-gradient(ellipse 95% 95% at 0% 0%, rgba(197,162,83,0.40), transparent 58%), radial-gradient(ellipse 60% 70% at 42% -5%, rgba(231,206,140,0.32), transparent 65%)",
        }}
      />
      {/* Subtle gold dot texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(197,162,83,0.11) 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }}
      />

      <section className="mx-auto flex min-h-screen max-w-[1280px] flex-col items-center gap-10 px-6 pb-16 pt-[140px] lg:flex-row lg:gap-6 lg:pt-[150px]">
        {/* Left: content */}
        <div className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 py-2 backdrop-blur-sm">
            <Stars />
            <span className="text-sm font-medium text-zinc-700">
              {t.rating}
            </span>
          </div>

          <h1 className="font-heading text-[42px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[56px] lg:text-[64px]">
            {t.headline}
          </h1>

          <p className="mt-6 max-w-md text-[18px] leading-relaxed tracking-[-0.01em] text-zinc-600">
            {t.sub}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex items-center gap-3 rounded-[16px] bg-ink px-6 py-4 text-base font-semibold text-white shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.15)] transition-transform duration-200 hover:scale-[1.02]"
            >
              {t.cta}
              <ArrowCircle />
            </Link>
            <Link
              href="/how-it-works"
              className="text-base font-medium text-zinc-700 underline-offset-4 hover:text-gold hover:underline"
            >
              {t.howLink}
            </Link>
          </div>

          <div className="mt-9 flex items-center gap-3 text-sm text-zinc-500">
            <span>{t.faceBournemouth}</span>
            <span className="h-1 w-1 rounded-full bg-gold" />
            <span>{t.onlineWorldwide}</span>
          </div>
        </div>

        {/* Right: 3D tooth */}
        <div className="relative h-[300px] w-full sm:h-[420px] lg:h-[620px] lg:w-1/2">
          <HeroVisual />
        </div>
      </section>
    </main>
  );
}
