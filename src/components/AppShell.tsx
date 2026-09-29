"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/types";

const NAV: Record<string, { href: string; label: string }[]> = {
  passenger: [
    { href: "/passenger", label: "Available Rides" },
    { href: "/history", label: "Ride History" },
  ],
  driver: [
    { href: "/driver", label: "Driver Hub" },
    { href: "/history", label: "Ride History" },
  ],
  admin: [
    { href: "/admin", label: "User Approvals" },
    { href: "/admin/logs", label: "System Logs" },
  ],
};

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = NAV[user.role] ?? NAV.passenger;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <header className="flex items-center justify-between border-b border-thistle/60 bg-white/80 px-4 py-3 md:hidden">
        <p className="font-semibold text-lilac-ink">GrabStudent</p>
        <button
          type="button"
          className="rounded-lg bg-lilac px-3 py-1.5 text-sm"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </header>

      <aside
        className={`sidebar-shadow z-20 bg-white/90 p-5 ${
          open ? "block" : "hidden"
        } md:block`}
      >
        <div className="mb-8 hidden md:block">
          <p className="text-xs uppercase tracking-[0.2em] text-lilac-deep">
            University Carpool
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-lilac-ink">
            GrabStudent
          </h1>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-lilac text-lilac-ink"
                    : "text-lilac-ink/80 hover:bg-lilac/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 rounded-lg bg-lilac/50 p-3 text-sm">
          <p className="font-medium text-lilac-ink">{user.name}</p>
          <p className="capitalize text-lilac-ink/70">{user.role}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full rounded-lg bg-white px-3 py-1.5 text-sm shadow-sm"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
