"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NotificationsBell from "./NotificationsBell";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminTopNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center">
            <Image src="/logo-mark.png" alt="Luxury Dental Turkey" width={120} height={120} className="h-9 w-auto" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(n.href) ? "bg-ink text-white" : "text-zinc-600 hover:bg-black/[0.04]"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <NotificationsBell />
          <span className="hidden text-xs text-zinc-400 sm:block">{email}</span>
          <button
            onClick={signOut}
            className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/[0.04]"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-black/5 px-3 py-2 md:hidden">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
              isActive(n.href) ? "bg-ink text-white" : "text-zinc-600"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
