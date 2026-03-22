import { PageShell } from "../ui/PageShell";

export function AddItemPage() {
  return (
    <PageShell
      eyebrow="Add Item"
      title="Fast entry while sourcing"
      description="This screen should be optimized for speed on a phone. The first version should avoid overloading the form."
    >
      <form className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Item title"
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none md:col-span-2"
        />
        <input
          type="number"
          placeholder="Purchase price"
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
        />
        <input
          type="date"
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
        />
        <select className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none">
          <option>Platform</option>
          <option>eBay</option>
          <option>Vinted</option>
          <option>Depop</option>
          <option>Other</option>
        </select>
        <select className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none">
          <option>Condition</option>
          <option>New</option>
          <option>Like new</option>
          <option>Good</option>
          <option>Fair</option>
        </select>
        <textarea
          placeholder="Notes"
          rows={5}
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none md:col-span-2"
        />
        <div className="rounded-[24px] border border-dashed border-stone-300 bg-white px-4 py-6 text-sm text-stone-500 md:col-span-2">
          Photo upload placeholder. V1 should keep photo support constrained and
          storage-safe.
        </div>
        <button className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white md:col-span-2">
          Save item
        </button>
      </form>
    </PageShell>
  );
}
