import { PageShell } from "../ui/PageShell";

export function TaxSummaryPage() {
  return (
    <PageShell
      eyebrow="Tax Summary"
      title="Bookkeeping summary, not tax advice"
      description="This screen should produce clear totals for a chosen period and make CSV export easy. It should not overclaim legal or tax accuracy."
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="date"
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <input
            type="date"
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none"
          />
          <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
            Revenue: £12,420
          </div>
          <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
            Costs: £7,126
          </div>
          <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4 md:col-span-2">
            Profit: £5,294
          </div>
        </div>

        <div className="rounded-[24px] border border-stone-200 bg-stone-950 p-5 text-stone-50">
          <p className="text-sm leading-6 text-stone-300">
            Export should produce a simple CSV that users can review themselves
            or send to an accountant.
          </p>
          <button className="mt-4 rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-stone-950">
            Export CSV
          </button>
        </div>
      </div>
    </PageShell>
  );
}
