import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#c5a253">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const t = getDict(await getLocale()).reviews;
  return (
    <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-[150px]">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{t.kicker}</p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {t.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
          {t.sub}
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {t.items.map((r) => (
          <div key={r.name} className="flex flex-col rounded-2xl border border-black/10 bg-white p-6">
            <Stars />
            <p className="mt-3 flex-1 text-zinc-700">&ldquo;{r.text}&rdquo;</p>
            <div className="mt-4">
              <div className="font-heading font-bold text-ink">{r.name}</div>
              <div className="text-sm text-zinc-400">{r.place}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
