import { PageShell } from "../ui/PageShell";

export function SettingsPage() {
  return (
    <PageShell
      eyebrow="Settings"
      title="Defaults, backup, and support information"
      description="This screen should focus on the settings that affect calculations and data safety. Everything else is secondary."
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="grid gap-4 rounded-[24px] border border-stone-200 bg-stone-50 p-4">
          <h3 className="text-base font-semibold text-stone-900">
            Platform fees
          </h3>
          <input
            type="number"
            defaultValue="12.8"
            className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none"
          />
          <input
            type="number"
            defaultValue="5.0"
            className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none"
          />
          <input
            type="number"
            defaultValue="10.0"
            className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none"
          />
        </section>

        <section className="grid gap-3 rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,#fff7e8_0%,#f6efe0_100%)] p-4">
          <h3 className="text-base font-semibold text-stone-900">
            Backup and restore
          </h3>
          <button className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white">
            Export backup
          </button>
          <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700">
            Import backup
          </button>
          <p className="text-sm leading-6 text-stone-600">
            Backup and restore must be reliable before V1 ships.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
