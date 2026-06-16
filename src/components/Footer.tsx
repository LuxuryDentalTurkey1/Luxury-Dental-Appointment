/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import { getDict, type Locale } from "@/lib/i18n";

const payments = [
  { src: "/payments/visa.svg", alt: "Visa" },
  { src: "/payments/mastercard.svg", alt: "Mastercard" },
  { src: "/payments/apple-pay.svg", alt: "Apple Pay" },
  { src: "/payments/google-pay.svg", alt: "Google Pay" },
];

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const links = [
    { href: "/", label: t.nav.home },
    { href: "/book", label: t.nav.book },
    { href: "/how-it-works", label: t.nav.how },
    { href: "/reviews", label: t.nav.reviews },
    { href: "/contact", label: t.nav.contact },
  ];
  return (
    <footer className="border-t border-black/10 bg-[#fafafa]">
      <div className="mx-auto max-w-[1280px] px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Image
              src="/logo-mark.png"
              alt="Luxury Dental Turkey"
              width={220}
              height={220}
              className="h-28 w-auto"
            />
            <p className="mt-2 max-w-xs text-sm text-zinc-500">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick links */}
          <div className="text-center md:text-left">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-ink">
              {t.footer.explore}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Consultations / contact */}
          <div className="text-center md:text-left">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-ink">
              {t.footer.consultations}
            </h4>
            <p className="mt-4 text-sm text-zinc-600">{t.footer.bournemouth}</p>
            <p className="text-sm text-zinc-600">{t.footer.onlineWorldwide}</p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:underline"
            >
              {t.footer.getInTouch}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Payments */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-black/10 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
            {t.footer.securePayments}
          </p>
          <div className="flex items-center gap-4">
            {payments.map((p) => (
              <img key={p.alt} src={p.src} alt={p.alt} className="h-8 w-auto" />
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center gap-2 text-xs text-zinc-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Luxury Dental Turkey. {t.footer.rights}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-gold">{t.footer.privacy}</Link>
            <Link href="/terms" className="transition-colors hover:text-gold">{t.footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
