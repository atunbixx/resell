import { PageShell } from "../ui/PageShell";

export function StatsPage() {
  return (
    <PageShell
      eyebrow="Statistics"
      title="Useful trends without overbuilding analytics"
      description="V1 only needs the summaries that change user behavior: monthly profit, monthly revenue, and basic platform mix."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Jan", value: "£412 profit" },
          { label: "Feb", value: "£536 profit" },
          { label: "Mar", value: "£326 profit" },
        ].map((month) => (
          <div
            key={month.label}
            className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              {month.label}
            </p>
            <p className="mt-3 text-xl font-semibold text-stone-900">
              {month.value}
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
