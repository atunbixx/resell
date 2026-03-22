import { NavLink, Outlet } from "react-router-dom";
import { useActivationStore } from "../store/useActivationStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/inventory", label: "Inventory" },
  { to: "/add-item", label: "Add Item" },
  { to: "/sales", label: "Sales" },
  { to: "/expenses", label: "Expenses" },
  { to: "/statistics", label: "Stats" },
  { to: "/tax-summary", label: "Tax" },
  { to: "/settings", label: "Settings" },
];

export function AppLayout() {
  const clearActivation = useActivationStore((state) => state.clearActivation);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 md:px-6 md:py-6">
        <header className="rounded-[28px] border border-black/10 bg-white/85 px-5 py-5 shadow-[0_24px_80px_rgba(72,52,14,0.08)] backdrop-blur md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">
                Reseller Tracker
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
                Lean V1 foundation for fast, offline-first resale tracking.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 md:text-base">
                Narrow scope, low support overhead, and a product flow designed
                around Etsy discovery and PDF-based onboarding.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-3xl bg-stone-900 px-4 py-3 text-sm text-stone-100">
                Activation is now persisted locally. Data services come next.
              </div>
              <button
                type="button"
                onClick={clearActivation}
                className="rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700"
              >
                Reset activation
              </button>
            </div>
          </div>
        </header>

        <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-black/10 bg-white/80 p-3 shadow-[0_18px_60px_rgba(72,52,14,0.07)] backdrop-blur">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-stone-900 text-stone-50"
                        : "bg-stone-100/80 text-stone-700 hover:bg-amber-100",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="rounded-[28px] border border-black/10 bg-white/82 p-4 shadow-[0_18px_60px_rgba(72,52,14,0.07)] backdrop-blur md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
