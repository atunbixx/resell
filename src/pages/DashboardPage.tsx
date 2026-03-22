import { PageShell } from "../ui/PageShell";
import { StatCard } from "../ui/StatCard";

export function DashboardPage() {
  return (
    <PageShell
      eyebrow="Dashboard"
      title="A compact business snapshot"
      description="The landing screen should answer the only questions that matter quickly: how much stock you have, how much you spent, how much you sold, and whether the month is improving."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Inventory" value="128" note="22 listed this month" />
        <StatCard label="Spent" value="£1,482" note="Buying pace is steady" />
        <StatCard label="Revenue" value="£3,960" note="Across 3 platforms" />
        <StatCard label="Profit" value="£1,274" note="Up 14% vs last month" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[24px] border border-stone-200 bg-[linear-gradient(135deg,#fff7e8_0%,#f8f1e2_55%,#f1eadb_100%)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
            Recent activity
          </p>
          <div className="mt-4 grid gap-3">
            {[
              "Vintage denim jacket added for £14.00",
              "Sony Walkman sold on eBay for £52.00",
              "Packaging expense logged for £8.50",
            ].map((entry) => (
              <div
                key={entry}
                className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-stone-700"
              >
                {entry}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-stone-200 bg-stone-950 p-5 text-stone-50">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Scope guard
          </p>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-stone-300">
            <li>Build the core workflows before advanced charts.</li>
            <li>Keep activation simple and supportable.</li>
            <li>Constrain photos to protect storage and backups.</li>
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
