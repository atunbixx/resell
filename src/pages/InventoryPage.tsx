import { PageShell } from "../ui/PageShell";
import { formatCurrency } from "../lib/sampleData";
import { useAppStore } from "../store/useAppStore";
import { useNavigate } from "react-router-dom";

export function InventoryPage() {
  const navigate = useNavigate();
  const items = useAppStore((state) => state.inventory);

  return (
    <PageShell
      eyebrow="Inventory"
      title="Current stock with fast filtering"
      description="Inventory needs to stay quick to scan on mobile. Search, status filters, and a fast sell action matter more than dense data tables."
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
        <input
          type="search"
          placeholder="Search title or notes"
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
        />
        <select className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none">
          <option>All statuses</option>
          <option>Unlisted</option>
          <option>Listed</option>
          <option>Sold</option>
        </select>
        <select className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none">
          <option>All platforms</option>
          <option>eBay</option>
          <option>Vinted</option>
          <option>Depop</option>
        </select>
      </div>

      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid gap-3 rounded-[24px] border border-stone-200 bg-stone-50 p-4 md:grid-cols-[1fr_auto_auto_auto]"
          >
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-stone-600">
                Cost {formatCurrency(item.costPence)} · {item.platform}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-2 text-sm text-stone-700">
              {item.status}
            </span>
            <button
              type="button"
              onClick={() => navigate(`/sales?itemId=${item.id}`)}
              disabled={item.status === "Sold"}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark sold
            </button>
            <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700">
              Edit
            </button>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
