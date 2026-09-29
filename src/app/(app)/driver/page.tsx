"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { MAX_SEATS, ZONES, getFlatRate } from "@/lib/zones";

type Booking = {
  id: string;
  passenger_name: string;
  passenger_email: string;
  passenger_student_number: string;
  from_zone: string;
  to_zone: string;
  departure_at: string;
  flat_rate: number;
  payment_method: string;
};

export default function DriverDashboard() {
  const [from_zone, setFrom] = useState<string>(ZONES[0]);
  const [to_zone, setTo] = useState<string>(ZONES[4]);
  const [departure_at, setDeparture] = useState("");
  const [seats_total, setSeats] = useState(2);
  const [message, setMessage] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const previewRate = getFlatRate(from_zone, to_zone);

  const load = useCallback(async () => {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(data.bookings ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createRide(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_zone,
        to_zone,
        departure_at,
        seats_total,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Could not create ride");
      return;
    }
    setMessage(`Ride posted at the system rate RM ${data.flat_rate}.`);
  }

  async function decide(id: string, action: "accept" | "reject") {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Action failed");
      return;
    }
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-lilac-ink">Driver Hub</h1>
        <p className="text-sm text-lilac-ink/70">
          Prices are locked by zone. Accepting a request deducts one seat.
        </p>
      </div>

      <section className="glass-card rounded-lg p-6">
        <h2 className="text-xl font-semibold text-lilac-ink">Create Ride</h2>
        <form onSubmit={createRide} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            From
            <select
              value={from_zone}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-thistle px-3 py-2"
            >
              {ZONES.map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            To
            <select
              value={to_zone}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-thistle px-3 py-2"
            >
              {ZONES.map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Date & time
            <input
              type="datetime-local"
              required
              value={departure_at}
              onChange={(e) => setDeparture(e.target.value)}
              className="mt-1 w-full rounded-lg border border-thistle px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Seats (max {MAX_SEATS})
            <input
              type="number"
              min={1}
              max={MAX_SEATS}
              value={seats_total}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-thistle px-3 py-2"
            />
          </label>
          <div className="rounded-lg bg-lilac/70 px-4 py-3 text-sm md:col-span-2">
            System flat rate: <strong>RM {previewRate}</strong>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-lilac-deep py-2.5 font-semibold text-white md:col-span-2"
          >
            Publish ride
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-lilac-ink">{message}</p> : null}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-lilac-ink">
          Booking Requests
        </h2>
        <div className="space-y-3">
          {bookings.map((b) => (
            <article
              key={b.id}
              className="glass-card flex flex-col gap-3 rounded-lg p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-lilac-ink">{b.passenger_name}</p>
                <p className="text-sm text-lilac-ink/70">
                  {b.passenger_student_number} · {b.passenger_email}
                </p>
                <p className="mt-1 text-sm">
                  {b.from_zone} → {b.to_zone} ·{" "}
                  {new Date(b.departure_at).toLocaleString()} · RM {b.flat_rate} ·{" "}
                  {b.payment_method.toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status="pending" />
                <button
                  type="button"
                  onClick={() => decide(b.id, "accept")}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => decide(b.id, "reject")}
                  className="rounded-lg bg-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
          {bookings.length === 0 ? (
            <p className="text-sm text-lilac-ink/60">No pending requests.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
