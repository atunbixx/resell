import { PageShell } from "../ui/PageShell";

export function SalesPage() {
  return (
    <PageShell
      eyebrow="Mark as Sold"
      title="Keep the profit workflow explicit"
      description="The sale form should make fees, postage, and resulting profit obvious before the user saves anything."
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <form className="grid gap-4 md:grid-cols-2">
          <select className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none md:col-span-2">
            <option>Select inventory item</option>
          </select>
          <input
            type="number"
            placeholder="Sale price"
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
          </select>
          <input
            type="number"
            placeholder="Postage cost"
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <textarea
            rows={4}
            placeholder="Notes"
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none md:col-span-2"
          />
          <button className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white md:col-span-2">
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
              <span>£32.00</span>
            </div>
            <div className="flex justify-between">
              <span>Platform fee</span>
              <span>£4.10</span>
            </div>
            <div className="flex justify-between">
              <span>Postage</span>
              <span>£3.20</span>
            </div>
            <div className="flex justify-between">
              <span>Purchase price</span>
              <span>£8.00</span>
            </div>
            <div className="mt-2 border-t border-amber-900/10 pt-3 text-base font-semibold text-stone-900">
              Net profit: £16.70
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
