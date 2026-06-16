import type { Metadata } from "next";
import { Fustat, Inter } from "next/font/google";
import "react-phone-number-input/style.css";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getLocale } from "@/lib/locale";

const fustat = Fustat({
  subsets: ["latin"],
  variable: "--font-fustat",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Luxury Dental Turkey · Book Your Consultation",
  description:
    "Book a face-to-face or online video dental consultation with Luxury Dental Turkey. Your new life is one consultation away.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${fustat.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <SiteChrome locale={locale}>{children}</SiteChrome>
      </body>
    </html>
  );
}
