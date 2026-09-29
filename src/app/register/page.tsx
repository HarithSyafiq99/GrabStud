"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Dropzone } from "@/components/Dropzone";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"passenger" | "driver">("passenger");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [student_number, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [student_id_doc, setStudentId] = useState<string | null>(null);
  const [license_doc, setLicense] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        student_number,
        role,
        student_id_doc,
        license_doc: role === "driver" ? license_doc : null,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      return;
    }
    router.push("/pending");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-thistle lg:flex lg:flex-col lg:justify-end lg:p-12">
        <h1 className="max-w-lg text-5xl font-semibold text-lilac-ink">
          Verify once. Ride with classmates.
        </h1>
        <p className="mt-4 max-w-md text-lilac-ink/80">
          Upload your Student ID. Drivers also upload a driving license. Admin
          review keeps the campus network closed and trusted.
        </p>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <form
          onSubmit={onSubmit}
          className="glass-card w-full max-w-lg space-y-4 rounded-lg p-8"
        >
          <h2 className="text-2xl font-semibold text-lilac-ink">Create account</h2>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-lilac/70 p-1">
            {(["passenger", "driver"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-md py-2 text-sm font-medium capitalize ${
                  role === r ? "bg-white shadow-sm" : "text-lilac-ink/70"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-thistle bg-white px-3 py-2"
          />
          <input
            required
            type="email"
            placeholder="University email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-thistle bg-white px-3 py-2"
          />
          <input
            required
            placeholder="Student number"
            value={student_number}
            onChange={(e) => setStudentNumber(e.target.value)}
            className="w-full rounded-lg border border-thistle bg-white px-3 py-2"
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-thistle bg-white px-3 py-2"
          />
          <Dropzone
            label="Student ID"
            required
            onFile={setStudentId}
          />
          {role === "driver" ? (
            <Dropzone
              label="Driving License"
              required
              hint="Required for driver approval"
              onFile={setLicense}
            />
          ) : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-lilac-deep py-2.5 font-semibold text-white"
          >
            {busy ? "Submitting…" : "Submit for approval"}
          </button>
          <p className="text-center text-sm">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-lilac-deep">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
