"use client";

import { useEffect, useState } from "react";

type Log = {
  id: string;
  action: string;
  details: string;
  created_at: string;
  actor_name?: string;
  actor_email?: string;
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []));
  }, []);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-lilac-ink">System Logs</h1>
          <p className="text-sm text-lilac-ink/70">
            Audit trail for registrations, approvals, rides, and bookings.
          </p>
        </div>
        <a
          href="/api/reports/logs"
          className="rounded-lg bg-lilac-deep px-4 py-2 text-sm font-semibold text-white"
        >
          Export CSV
        </a>
      </div>
      <div className="space-y-2">
        {logs.map((log) => (
          <article key={log.id} className="glass-card rounded-lg p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-lilac-ink">{log.action}</p>
              <time className="text-xs text-lilac-ink/60">
                {new Date(log.created_at).toLocaleString()}
              </time>
            </div>
            <p className="mt-1 text-lilac-ink/80">{log.details}</p>
            <p className="mt-1 text-xs text-lilac-ink/60">
              {log.actor_name ?? "System"} {log.actor_email ? `· ${log.actor_email}` : ""}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
