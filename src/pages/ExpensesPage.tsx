import { PageShell } from "../ui/PageShell";

export function ExpensesPage() {
  return (
    <PageShell
      eyebrow="Expenses"
      title="Manual operating costs only"
      description="Recurring expense automation is intentionally out of scope. V1 keeps this screen narrow and dependable."
    >
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="grid gap-4">
          <select className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none">
            <option>Category</option>
            <option>Packaging</option>
            <option>Storage</option>
            <option>Shipping</option>
            <option>Other</option>
          </select>
          <input
            type="text"
            placeholder="Description"
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <input
            type="number"
            placeholder="Amount"
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <input
            type="date"
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <button className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white">
            Add expense
          </button>
        </form>

        <div className="grid gap-3">
          {[
            "Packaging supplies · £8.50",
            "Shelf storage box · £14.00",
            "Shipping labels · £11.20",
          ].map((expense) => (
            <div
              key={expense}
              className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-700"
            >
              {expense}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
