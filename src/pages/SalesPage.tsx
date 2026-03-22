import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatCurrency, parsePoundsToPence } from "../lib/sampleData";
import { useAppStore } from "../store/useAppStore";
import { PageShell } from "../ui/PageShell";

export function SalesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inventory = useAppStore((state) => state.inventory);
  const addSale = useAppStore((state) => state.addSale);
  const availableItems = inventory.filter((item) => item.status !== "Sold");
  const initialItemId =
    searchParams.get("itemId") && availableItems.some((item) => item.id === searchParams.get("itemId"))
      ? (searchParams.get("itemId") as string)
      : availableItems[0]?.id ?? "";
  const [itemId, setItemId] = useState(initialItemId);
  const [salePrice, setSalePrice] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [platform, setPlatform] = useState<"eBay" | "Vinted" | "Depop">("eBay");
  const [postageCost, setPostageCost] = useState("");
  const [notes, setNotes] = useState("");

  const selectedItem = availableItems.find((item) => item.id === itemId) ?? null;
  const salePricePence = parsePoundsToPence(salePrice);
  const postageCostPence = parsePoundsToPence(postageCost);
  const feePercent = platform === "eBay" ? 12.8 : platform === "Vinted" ? 5 : 10;
  const feePence = Math.round(salePricePence * (feePercent / 100));
  const profitPence = selectedItem
    ? salePricePence - feePence - postageCostPence - selectedItem.costPence
    : 0;
  const canSubmit = Boolean(selectedItem && saleDate.trim() && salePricePence > 0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedItem || !canSubmit) {
      return;
    }

    addSale({
      itemId: selectedItem.id,
      salePricePence,
      saleDate,
      platform,
      postageCostPence,
      notes: notes.trim(),
    });
    navigate("/dashboard");
  }

  return (
    <PageShell
      eyebrow="Mark as Sold"
      title="Keep the profit workflow explicit"
      description="The sale form should make fees, postage, and resulting profit obvious before the user saves anything."
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <select
            value={itemId}
            onChange={(event) => setItemId(event.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none md:col-span-2"
          >
            {availableItems.length === 0 ? <option>No available inventory</option> : null}
            {availableItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Sale price"
            min="0"
            step="0.01"
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <input
            type="date"
            value={saleDate}
            onChange={(event) => setSaleDate(event.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <select
            value={platform}
            onChange={(event) =>
              setPlatform(event.target.value as "eBay" | "Vinted" | "Depop")
            }
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          >
            <option>eBay</option>
            <option>Vinted</option>
            <option>Depop</option>
          </select>
          <input
            type="number"
            placeholder="Postage cost"
            min="0"
            step="0.01"
            value={postageCost}
            onChange={(event) => setPostageCost(event.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <textarea
            rows={4}
            placeholder="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none md:col-span-2"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
          >
            Save sale
          </button>
        </form>

        <aside className="rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,#fff7e8_0%,#f6efe0_100%)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
            Profit preview
          </p>
          <div className="mt-4 grid gap-3 text-sm text-stone-700">
            <div className="flex justify-between">
              <span>Sale price</span>
              <span>{formatCurrency(salePricePence)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform fee</span>
              <span>{formatCurrency(feePence)}</span>
            </div>
            <div className="flex justify-between">
              <span>Postage</span>
              <span>{formatCurrency(postageCostPence)}</span>
            </div>
            <div className="flex justify-between">
              <span>Purchase price</span>
              <span>{formatCurrency(selectedItem?.costPence ?? 0)}</span>
            </div>
            <div className="mt-2 border-t border-amber-900/10 pt-3 text-base font-semibold text-stone-900">
              Net profit: {formatCurrency(profitPence)}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
