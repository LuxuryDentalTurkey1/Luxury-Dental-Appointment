import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";

// Server-only: reads the chosen language from the `lang` cookie (set by the
// language switcher). Defaults to English.
export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get("lang")?.value;
  return v === "fr" || v === "es" ? v : "en";
}
