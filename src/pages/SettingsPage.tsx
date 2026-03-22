import { ChangeEvent, useRef, useState } from "react";
import {
  createBackupFile,
  parseBackupFile,
} from "../lib/storage";
import { useAppStore } from "../store/useAppStore";
import { PageShell } from "../ui/PageShell";

export function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inventory = useAppStore((state) => state.inventory);
  const expenses = useAppStore((state) => state.expenses);
  const sales = useAppStore((state) => state.sales);
  const replaceState = useAppStore((state) => state.replaceState);

  function handleExport() {
    const backup = createBackupFile({ inventory, expenses, sales });
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resell-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setError(null);
    setMessage("Backup exported.");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const nextState = parseBackupFile(raw);
      replaceState(nextState);
      setError(null);
      setMessage("Backup imported successfully.");
    } catch {
      setMessage(null);
      setError("Backup import failed. Use a valid Reseller Tracker backup file.");
    } finally {
      event.target.value = "";
    }
  }

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
          <button
            type="button"
            onClick={handleExport}
            className="rounded-2xl bg-stone-900 px-4 py-3 font-semibold text-white"
          >
            Export backup
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl bg-white px-4 py-3 font-semibold text-stone-700"
          >
            Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
          <p className="text-sm leading-6 text-stone-600">
            Backup and restore must be reliable before V1 ships.
          </p>
          {message ? (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
