import { getLocale } from "@/lib/locale";
import { getDict } from "@/lib/i18n";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const t = getDict(await getLocale()).contact;

  const methods = [
    {
      label: t.email,
      value: "info@luxurydentalturkey.com",
      href: "mailto:info@luxurydentalturkey.com",
      sub: t.emailSub,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
      ),
    },
    {
      label: t.call,
      value: "+44 20 3488 9319",
      href: "tel:+442034889319",
      sub: t.callSub,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
      ),
    },
    {
      label: t.whatsapp,
      value: "+44 7869 556301",
      href: "https://wa.me/447869556301",
      sub: t.whatsappSub,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.043zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
      ),
    },
  ];

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-24 pt-[150px]">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{t.kicker}</p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {t.title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-zinc-600">
          {t.sub}
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {methods.map((m) => (
          <a
            key={m.label}
            href={m.href}
            target={m.href.startsWith("http") ? "_blank" : undefined}
            rel={m.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-5 transition-colors hover:border-gold/50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-deep">
              {m.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium uppercase tracking-wider text-zinc-400">{m.label}</span>
              <span className="block truncate font-heading text-lg font-bold text-ink">{m.value}</span>
              <span className="block text-sm text-zinc-500">{m.sub}</span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><path d="M9 18l6-6-6-6" /></svg>
          </a>
        ))}
      </div>
    </main>
  );
}
