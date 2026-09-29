"use client";

import { useCallback, useEffect, useState } from "react";
import { RideCard } from "@/components/RideCard";
import { ZONES } from "@/lib/zones";

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

export default function PassengerDashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (date) params.set("date", date);
    const res = await fetch(`/api/rides?${params.toString()}`);
    const data = await res.json();
    setRides(data.rides ?? []);
  }, [from, to, date]);

  useEffect(() => {
    load();
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.acceptedBookings) {
          setNotice(
            `${d.acceptedBookings} accepted ride(s). Pay cash/QR to the driver. ${d.pendingRequests} still pending.`,
          );
        } else if (d.pendingRequests) {
          setNotice(`${d.pendingRequests} booking request(s) awaiting driver action.`);
        }
      });
  }, [load]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-lilac-ink">Available Rides</h1>
        <p className="text-sm text-lilac-ink/70">
          Flat petrol-sharing rates only. Book, then pay cash or QR offline.
        </p>
      </div>
      {notice ? (
        <div className="mb-4 rounded-lg bg-lilac px-4 py-3 text-sm text-lilac-ink">
          {notice}
        </div>
      ) : null}
      <div className="mb-6 grid gap-3 rounded-lg bg-white/80 p-4 shadow-sm md:grid-cols-4">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-thistle px-3 py-2 text-sm"
        >
          <option value="">From (all)</option>
          {ZONES.map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-thistle px-3 py-2 text-sm"
        >
          <option value="">To (all)</option>
          {ZONES.map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-thistle px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={load}
          className="rounded-lg bg-lilac-deep text-sm font-semibold text-white"
        >
          Filter
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rides.map((ride) => (
          <RideCard key={ride.id} ride={ride} onBooked={load} />
        ))}
      </div>
      {rides.length === 0 ? (
        <p className="mt-10 text-center text-lilac-ink/60">
          No upcoming rides match these filters.
        </p>
      ) : null}
    </div>
  );
}
