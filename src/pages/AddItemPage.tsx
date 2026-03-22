import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parsePoundsToPence } from "../lib/sampleData";
import { useAppStore } from "../store/useAppStore";
import { PageShell } from "../ui/PageShell";

export function AddItemPage() {
  const navigate = useNavigate();
  const addInventoryItem = useAppStore((state) => state.addInventoryItem);
  const [title, setTitle] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [platform, setPlatform] = useState<"eBay" | "Vinted" | "Depop">("eBay");
  const [condition, setCondition] = useState<"New" | "Like new" | "Good" | "Fair">("Good");
  const [notes, setNotes] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDate = purchaseDate.trim();
    if (!trimmedTitle || !trimmedDate) {
      return;
    }

    addInventoryItem({
      title: trimmedTitle,
      costPence: parsePoundsToPence(purchasePrice),
      addedAt: trimmedDate,
      platform,
      condition,
      notes: notes.trim(),
    });

    navigate("/inventory");
  }

  return (
    <PageShell
      eyebrow="Add Item"
      title="Fast entry while sourcing"
      description="This screen should be optimized for speed on a phone. The first version should avoid overloading the form."
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Item title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none md:col-span-2"
        />
        <input
          type="number"
          placeholder="Purchase price"
          min="0"
          step="0.01"
          value={purchasePrice}
          onChange={(event) => setPurchasePrice(event.target.value)}
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
        />
        <input
          type="date"
          value={purchaseDate}
          onChange={(event) => setPurchaseDate(event.target.value)}
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
        <select
          value={condition}
          onChange={(event) =>
            setCondition(
              event.target.value as "New" | "Like new" | "Good" | "Fair",
            )
          }
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
        >
          <option>New</option>
          <option>Like new</option>
          <option>Good</option>
          <option>Fair</option>
        </select>
        <textarea
          placeholder="Notes"
          rows={5}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none md:col-span-2"
        />
        <div className="rounded-[24px] border border-dashed border-stone-300 bg-white px-4 py-6 text-sm text-stone-500 md:col-span-2">
          Photo upload placeholder. V1 should keep photo support constrained and
          storage-safe.
        </div>
        <button
          type="submit"
          disabled={!title.trim() || !purchaseDate.trim()}
          className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
        >
          Save item
        </button>
      </form>
    </PageShell>
  );
}
