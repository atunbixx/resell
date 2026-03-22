import { FormEvent, useState } from "react";
import { formatCurrency } from "../lib/sampleData";
import { parsePoundsToPence } from "../lib/sampleData";
import { useAppStore } from "../store/useAppStore";
import { PageShell } from "../ui/PageShell";

export function ExpensesPage() {
  const expenses = useAppStore((state) => state.expenses);
  const addExpense = useAppStore((state) => state.addExpense);
  const [category, setCategory] = useState<"Packaging" | "Storage" | "Shipping" | "Other">("Packaging");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDescription = description.trim();
    const trimmedDate = transactionDate.trim();
    if (!trimmedDescription || !trimmedDate) {
      return;
    }

    addExpense({
      category,
      description: trimmedDescription,
      amountPence: parsePoundsToPence(amount),
      transactionDate: trimmedDate,
    });

    setCategory("Packaging");
    setDescription("");
    setAmount("");
    setTransactionDate("");
  }

  return (
    <PageShell
      eyebrow="Expenses"
      title="Manual operating costs only"
      description="Recurring expense automation is intentionally out of scope. V1 keeps this screen narrow and dependable."
    >
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as "Packaging" | "Storage" | "Shipping" | "Other",
              )
            }
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          >
            <option>Packaging</option>
            <option>Storage</option>
            <option>Shipping</option>
            <option>Other</option>
          </select>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <input
            type="number"
            placeholder="Amount"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <input
            type="date"
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <button
            type="submit"
            disabled={!description.trim() || !transactionDate.trim()}
            className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add expense
          </button>
        </form>

        <div className="grid gap-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-700"
            >
              {expense.description} · {formatCurrency(expense.amountPence)} ·{" "}
              {expense.category}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
