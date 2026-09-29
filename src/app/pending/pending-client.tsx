"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/types";

export function PendingClient({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function checkStatus() {
    setBusy(true);
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return;
    if (data.user.status === "approved") {
      if (data.user.role === "driver") router.push("/driver");
      else router.push("/passenger");
      router.refresh();
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-lg rounded-lg p-8 text-center">
        <p className="text-sm uppercase tracking-widest text-lilac-deep">
          GrabStudent
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-lilac-ink">
          {user.status === "rejected"
            ? "Application declined"
            : "Awaiting admin approval"}
        </h1>
        <p className="mt-3 text-lilac-ink/75">
          Hi {user.name}. Your {user.role} account is{" "}
          <strong className="capitalize">{user.status}</strong>. You cannot book
          or create rides until an admin verifies your documents.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={checkStatus}
            disabled={busy}
            className="rounded-lg bg-lilac-deep px-5 py-2 font-medium text-white"
          >
            {busy ? "Checking…" : "Check status"}
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-white px-5 py-2 font-medium shadow-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
