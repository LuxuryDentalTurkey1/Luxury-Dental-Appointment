"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import type { Locale } from "@/lib/i18n";

export default function SiteChrome({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const pathname = usePathname();

  // The admin area has its own layout — no public navbar/footer/chat.
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar locale={locale} />
      {children}
      <Footer locale={locale} />
      <ChatWidget />
    </>
  );
}
