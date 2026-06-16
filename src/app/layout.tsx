import type { Metadata } from "next";
import { Fustat, Inter } from "next/font/google";
import "react-phone-number-input/style.css";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getLocale } from "@/lib/locale";
import { siteUrl } from "@/lib/site";

const fustat = Fustat({
  subsets: ["latin"],
  variable: "--font-fustat",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Luxury Dental Turkey · Book Your Consultation",
    template: "%s · Luxury Dental Turkey",
  },
  description:
    "Book a face-to-face or online video dental consultation with Luxury Dental Turkey. Your new life is one consultation away.",
  keywords: [
    "dental consultation",
    "online dental consultation",
    "dental tourism Turkey",
    "veneers",
    "dental implants",
    "smile makeover",
    "Bournemouth dental consultation",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Luxury Dental Turkey",
    title: "Luxury Dental Turkey · Book Your Consultation",
    description:
      "Book a face-to-face or online video dental consultation. Your new life is one consultation away.",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Dental Turkey",
    description:
      "Book a face-to-face or online video dental consultation. Your new life is one consultation away.",
  },
  robots: { index: true, follow: true },
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
