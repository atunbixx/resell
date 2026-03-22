import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 md:text-base">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
