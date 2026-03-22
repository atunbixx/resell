import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../ui/PageShell";
import { formatCurrency } from "../lib/sampleData";
import { useAppStore } from "../store/useAppStore";

export function InventoryPage() {
  const navigate = useNavigate();
  const items = useAppStore((state) => state.inventory);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All statuses" | "Unlisted" | "Listed" | "Sold"
  >("All statuses");
  const [platformFilter, setPlatformFilter] = useState<
    "All platforms" | "eBay" | "Vinted" | "Depop"
  >("All platforms");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.notes.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "All statuses" || item.status === statusFilter;
      const matchesPlatform =
        platformFilter === "All platforms" || item.platform === platformFilter;

      return matchesQuery && matchesStatus && matchesPlatform;
    });
  }, [items, platformFilter, query, statusFilter]);

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
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as "All statuses" | "Unlisted" | "Listed" | "Sold",
            )
          }
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
        >
          <option>All statuses</option>
          <option>Unlisted</option>
          <option>Listed</option>
          <option>Sold</option>
        </select>
        <select
          value={platformFilter}
          onChange={(event) =>
            setPlatformFilter(
              event.target.value as "All platforms" | "eBay" | "Vinted" | "Depop",
            )
          }
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
        >
          <option>All platforms</option>
          <option>eBay</option>
          <option>Vinted</option>
          <option>Depop</option>
        </select>
      </div>

      <div className="mt-6 grid gap-3">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="grid gap-3 rounded-[24px] border border-stone-200 bg-stone-50 p-4 md:grid-cols-[1fr_auto_auto_auto]"
          >
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-stone-600">
                Cost {formatCurrency(item.costPence)} · {item.platform} ·{" "}
                {item.condition}
              </p>
              {item.notes ? (
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  {item.notes}
                </p>
              ) : null}
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
            <button
              type="button"
              onClick={() => navigate(`/add-item?itemId=${item.id}`)}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700"
            >
              Edit
            </button>
          </article>
        ))}
        {filteredItems.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-stone-300 bg-white px-4 py-8 text-sm text-stone-500">
            No items match the current filters.
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
