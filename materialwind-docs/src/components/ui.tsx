import type { ReactNode } from "react";

export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-outline-variant py-14">
      <h2 className="text-3xl font-semibold tracking-tight text-on-surface">
        <a href={`#${id}`} className="hover:text-primary">
          {title}
        </a>
      </h2>
      {lead ? <p className="mt-3 max-w-2xl text-on-surface-variant">{lead}</p> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function Code({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
      {lang ? (
        <div className="border-b border-outline-variant px-4 py-2 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
          {lang}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-on-surface">{children}</code>
      </pre>
    </div>
  );
}

export function Note({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "good" }) {
  const styles =
    tone === "good"
      ? "border-outline-variant bg-tertiary-container text-on-tertiary-container"
      : "border-outline-variant bg-surface-container text-on-surface-variant";
  return <div className={`rounded-xl border p-4 text-sm ${styles}`}>{children}</div>;
}

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-[0.85em] text-on-surface">
      {children}
    </code>
  );
}
