"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }
    router.push(data.redirect);
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-lilac lg:flex lg:flex-col lg:justify-between lg:p-12">
        <p className="text-sm uppercase tracking-[0.25em] text-lilac-ink/70">
          Closed campus ecosystem
        </p>
        <div>
          <h1 className="max-w-md text-5xl font-semibold leading-tight text-lilac-ink">
            Share petrol. Skip the surge.
          </h1>
          <p className="mt-4 max-w-md text-lilac-ink/80">
            GrabStudent matches verified university drivers and passengers on a
            flat petrol-sharing rate.
          </p>
        </div>
        <p className="text-sm text-lilac-ink/70">Student-only · Admin verified</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12">
        <form
          onSubmit={onSubmit}
          className="glass-card w-full max-w-md rounded-lg p-8"
        >
          <p className="text-sm font-medium text-lilac-deep">GrabStudent</p>
          <h2 className="mt-1 text-2xl font-semibold text-lilac-ink">Sign in</h2>
          <p className="mt-1 text-sm text-lilac-ink/70">
            Use your approved student account.
          </p>
          <label className="mt-6 block text-sm font-medium">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-thistle bg-white px-3 py-2"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-thistle bg-white px-3 py-2"
            />
          </label>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-lg bg-lilac-deep py-2.5 font-semibold text-white"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-4 text-center text-sm">
            New student?{" "}
            <Link href="/register" className="font-semibold text-lilac-deep">
              Register
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
