"use client";

import { useState } from "react";
import { StatusBadge } from "./StatusBadge";

type Ride = {
  id: string;
  from_zone: string;
  to_zone: string;
  departure_at: string;
  seats_available: number;
  seats_total: number;
  flat_rate: number;
  driver_name?: string;
  status: string;
};

export function RideCard({
  ride,
  onBooked,
}: {
  ride: Ride;
  onBooked?: () => void;
}) {
  const [payment, setPayment] = useState<"cash" | "qr">("cash");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const soldOut = Number(ride.seats_available) <= 0 || ride.status !== "open";

  async function book() {
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/rides/${ride.id}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_method: payment }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error ?? "Booking failed");
      return;
    }
    setMessage("Request sent. Pay the flat rate in cash or QR after the driver accepts.");
    onBooked?.();
  }

  return (
    <article className="glass-card rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-lilac-deep">Route</p>
          <h3 className="text-lg font-semibold text-lilac-ink">
            {ride.from_zone} → {ride.to_zone}
          </h3>
        </div>
        <StatusBadge status={soldOut ? "full" : ride.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-lilac-ink/60">Time</dt>
          <dd className="font-medium">
            {new Date(ride.departure_at).toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-lilac-ink/60">Flat rate</dt>
          <dd className="font-medium">RM {ride.flat_rate}</dd>
        </div>
        <div>
          <dt className="text-lilac-ink/60">Seats</dt>
          <dd className="font-medium">
            {ride.seats_available}/{ride.seats_total}
          </dd>
        </div>
        <div>
          <dt className="text-lilac-ink/60">Driver</dt>
          <dd className="font-medium">{ride.driver_name ?? "Student driver"}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-col gap-2">
        <select
          className="rounded-lg border border-thistle bg-white px-3 py-2 text-sm"
          value={payment}
          onChange={(e) => setPayment(e.target.value as "cash" | "qr")}
          disabled={soldOut}
        >
          <option value="cash">Pay offline: Cash</option>
          <option value="qr">Pay offline: QR</option>
        </select>
        {soldOut ? (
          <button
            type="button"
            disabled
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
          >
            Fully booked
          </button>
        ) : (
          <button
            type="button"
            onClick={book}
            disabled={busy}
            className="rounded-lg bg-lilac-deep px-4 py-2 text-sm font-semibold text-white shadow-md shadow-thistle/60"
          >
            {busy ? "Booking…" : "Book Now"}
          </button>
        )}
        {message ? <p className="text-xs text-lilac-ink/80">{message}</p> : null}
      </div>
    </article>
  );
}
