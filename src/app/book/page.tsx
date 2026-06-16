import BookingFlow from "@/components/booking/BookingFlow";
import { getSettings, getBlockedDates } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";

export default async function BookPage() {
  const [settings, blockedDates, locale] = await Promise.all([getSettings(), getBlockedDates(), getLocale()]);
  const t = getDict(locale).book;

  return (
    <main className="mx-auto max-w-[920px] px-6 pb-24 pt-[140px]">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          {t.pageKicker}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {t.pageTitle}
        </h1>
        <p className="mt-3 text-zinc-600">{t.pageSub}</p>
      </div>
      <div className="mt-10">
        <BookingFlow settings={settings} blockedDates={blockedDates} locale={locale} />
      </div>
    </main>
  );
}
