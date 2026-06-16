"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getDict, type Locale } from "@/lib/i18n";

export default function Navbar({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = getDict(locale).nav;
  const links = [
    { href: "/", label: t.home },
    { href: "/book", label: t.book },
    { href: "/how-it-works", label: t.how },
    { href: "/reviews", label: t.reviews },
    { href: "/contact", label: t.contact },
  ];

  return (
    <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-1.5rem)] max-w-[1140px] -translate-x-1/2 sm:top-[30px]">
      <nav className="flex items-center justify-between gap-4 rounded-[16px] border border-black/10 bg-white/40 px-4 py-2.5 shadow-[inset_0px_4px_4px_0px_rgba(255,255,255,0.25),0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-[50px] sm:gap-6">
        <Link href="/" onClick={() => setOpen(false)} className="flex shrink-0 items-center">
          <Image
            src="/logo-dark.png"
            alt="Luxury Dental Turkey"
            width={233}
            height={41}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-gold" : "text-zinc-700 hover:text-gold"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <Link
            href="/book"
            className="hidden items-center gap-2 rounded-[12px] bg-ink px-4 py-2 text-sm font-semibold text-white shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.15)] transition-transform hover:scale-[1.03] sm:flex"
          >
            {t.bookNow}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>

          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-black/10 bg-white/40 text-zinc-800 lg:hidden"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mt-2 overflow-hidden rounded-[16px] border border-black/10 bg-white/85 p-2 shadow-lg backdrop-blur-[50px] lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-[10px] px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-gold/10 hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-[10px] bg-ink px-4 py-3 text-center text-sm font-semibold text-white"
          >
            {t.bookNow}
          </Link>
        </div>
      )}
    </header>
  );
}
