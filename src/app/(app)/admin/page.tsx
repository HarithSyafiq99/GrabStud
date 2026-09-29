"use client";

import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

type UserRow = {
  id: string;
  name: string;
  email: string;
  student_number: string;
  role: string;
  status: string;
  student_id_doc: string | null;
  license_doc: string | null;
  created_at: string;
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/users?tab=${tab}`);
    const data = await res.json();
    setUsers(data.users ?? []);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(userId: string, action: "approve" | "reject") {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Failed");
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-lilac-ink">User Approvals</h1>
      <p className="mb-5 text-sm text-lilac-ink/70">
        Verify Student IDs and driving licenses before unlocking the platform.
      </p>
      <div className="mb-4 flex gap-2">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${
              tab === t ? "bg-lilac-deep text-white" : "bg-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-lilac/70 text-lilac-ink">
            <tr>
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">License</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-thistle/50">
                <td className="px-3 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-lilac-ink/60">
                    {u.email} · {u.student_number}
                  </p>
                </td>
                <td className="px-3 py-3 capitalize">{u.role}</td>
                <td className="px-3 py-3">
                  {u.student_id_doc ? (
                    <button
                      type="button"
                      onClick={() => setPreview(u.student_id_doc)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.student_id_doc}
                        alt="Student ID"
                        className="h-12 w-16 rounded object-cover"
                      />
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-3">
                  {u.license_doc ? (
                    <button
                      type="button"
                      onClick={() => setPreview(u.license_doc)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.license_doc}
                        alt="License"
                        className="h-12 w-16 rounded object-cover"
                      />
                    </button>
                  ) : (
                    <span className="text-lilac-ink/50">N/A</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-3 py-3">
                  {u.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => act(u.id, "approve")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => act(u.id, "reject")}
                        className="rounded-lg bg-slate-300 px-3 py-1.5 text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 ? (
          <p className="px-3 py-8 text-center text-lilac-ink/60">No users in this tab.</p>
        ) : null}
      </div>
      {preview ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Document" className="max-h-[80vh] rounded-lg" />
        </button>
      ) : null}
    </div>
  );
}
