import { FormEvent, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  isActivationCodeFormatValid,
  normalizeActivationCode,
} from "../lib/activation";
import { useActivationStore } from "../store/useActivationStore";

export function ActivationPage() {
  const location = useLocation();
  const activation = useActivationStore((state) => state.activation);
  const status = useActivationStore((state) => state.status);
  const error = useActivationStore((state) => state.error);
  const activate = useActivationStore((state) => state.activate);
  const [code, setCode] = useState("");

  if (activation) {
    const from = location.state?.from;
    return <Navigate to={typeof from === "string" ? from : "/dashboard"} replace />;
  }

  const normalizedCode = normalizeActivationCode(code);
  const isValid = isActivationCodeFormatValid(normalizedCode);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await activate(normalizedCode);
  }

  return (
    <main className="min-h-screen bg-stone-950 px-4 py-6 text-stone-50 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 rounded-[32px] bg-[linear-gradient(135deg,#22170d_0%,#111111_55%,#1f1208_100%)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
        <section className="flex flex-col justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              Activation
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
              Minimal onboarding for an Etsy-to-app handoff.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-300">
              The goal is a short, supportable first-run flow: URL from the PDF,
              one activation code, one clear result.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Open the URL from your PDF or scan the QR code.",
              "Enter the activation code exactly once.",
              "Land in the app and use it offline afterwards.",
            ].map((step, index) => (
              <div
                key={step}
                className="rounded-[24px] border border-white/10 bg-white/5 p-4"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-amber-300">
                  Step {index + 1}
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-200">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur md:p-6">
          <p className="text-sm font-medium text-stone-300">
            Enter activation code
          </p>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm text-stone-300">Code</span>
              <input
                type="text"
                placeholder="RSLR-XXXX-XXXX"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base outline-none placeholder:text-stone-500"
              />
            </label>
            <div className="rounded-2xl bg-black/20 px-4 py-3 text-sm text-stone-300">
              Demo codes for local development: `RSLR-2026-START`,
              `RSLR-DEMO-0001`, `RSLR-ETSY-TEST`
            </div>
            {error ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={!isValid || status === "activating"}
              className="rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-stone-950 transition hover:bg-amber-200"
            >
              {status === "activating" ? "Activating..." : "Activate app"}
            </button>
          </form>

          <div className="mt-6 rounded-[24px] bg-black/20 p-4 text-sm leading-6 text-stone-300">
            Internet is only needed for first activation. If a user clears
            browser data, reactivation is required.
          </div>

          <a
            href="mailto:support@example.com"
            className="mt-4 inline-flex text-sm text-amber-300 underline underline-offset-4"
          >
            Need help? Contact support
          </a>
        </section>
      </div>
    </main>
  );
}
