import { PageShell } from "../ui/PageShell";
import { StatCard } from "../ui/StatCard";
import { formatCurrency } from "../lib/sampleData";
import { useAppStore } from "../store/useAppStore";

export function DashboardPage() {
  const inventory = useAppStore((state) => state.inventory);
  const expenses = useAppStore((state) => state.expenses);
  const sales = useAppStore((state) => state.sales);
  const inventoryCount = inventory.filter((item) => item.status !== "Sold").length;
  const totalSpent = inventory.reduce((sum, item) => sum + item.costPence, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amountPence, 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePricePence, 0);
  const totalProfit =
    sales.reduce((sum, sale) => sum + sale.profitPence, 0) - totalExpenses;

  return (
    <PageShell
      eyebrow="Dashboard"
      title="A compact business snapshot"
      description="The landing screen should answer the only questions that matter quickly: how much stock you have, how much you spent, how much you sold, and whether the month is improving."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Inventory"
          value={String(inventoryCount)}
          note={`${inventory.filter((item) => item.status === "Listed").length} listed right now`}
        />
        <StatCard label="Spent" value={formatCurrency(totalSpent)} note="Purchase costs only" />
        <StatCard label="Revenue" value={formatCurrency(totalRevenue)} note={`${sales.length} sales recorded`} />
        <StatCard label="Profit" value={formatCurrency(totalProfit)} note="Sales profit less operating expenses" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[24px] border border-stone-200 bg-[linear-gradient(135deg,#fff7e8_0%,#f8f1e2_55%,#f1eadb_100%)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
            Recent activity
          </p>
          <div className="mt-4 grid gap-3">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-stone-700"
              >
                {item.title} · {item.status} · {formatCurrency(item.costPence)}
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
