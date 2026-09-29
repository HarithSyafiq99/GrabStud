export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    accepted: "bg-emerald-100 text-emerald-800",
    rejected: "bg-slate-200 text-slate-600",
    cancelled: "bg-slate-200 text-slate-600",
    open: "bg-lilac text-lilac-ink",
    full: "bg-rose-100 text-rose-800",
    completed: "bg-sky-100 text-sky-800",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        map[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}
