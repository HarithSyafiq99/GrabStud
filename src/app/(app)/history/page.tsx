"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

type Row = Record<string, string | number | null>;

export default function HistoryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [role, setRole] = useState("passenger");

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => {
        setRows(d.history ?? []);
        setRole(d.role ?? "passenger");
      });
  }, []);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-lilac-ink">Ride History</h1>
          <p className="text-sm text-lilac-ink/70">
            Audit trail of bookings for your {role} account.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/reports/history"
            className="rounded-lg bg-lilac-deep px-4 py-2 text-sm font-semibold text-white"
          >
            Download CSV
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-sm"
          >
            Print report
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm print:shadow-none">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-lilac/70">
            <tr>
              <th className="px-3 py-3">Route</th>
              <th className="px-3 py-3">When</th>
              <th className="px-3 py-3">Rate</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Pay</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.id)} className="border-t border-thistle/50">
                <td className="px-3 py-3">
                  {row.from_zone} → {row.to_zone}
                  <p className="text-xs text-lilac-ink/60">
                    {role === "driver"
                      ? String(row.passenger_name ?? "")
                      : String(row.driver_name ?? "")}
                  </p>
                </td>
                <td className="px-3 py-3">
                  {row.departure_at
                    ? new Date(String(row.departure_at)).toLocaleString()
                    : "—"}
                </td>
                <td className="px-3 py-3">RM {row.flat_rate}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={String(row.status)} />
                </td>
                <td className="px-3 py-3 uppercase">{row.payment_method}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-3 py-8 text-center text-lilac-ink/60">No history yet.</p>
        ) : null}
      </div>
    </div>
  );
}
