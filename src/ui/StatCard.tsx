type StatCardProps = {
  label: string;
  value: string;
  note: string;
};

export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <article className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">
        {value}
      </p>
      <p className="mt-2 text-sm text-stone-600">{note}</p>
    </article>
  );
}
