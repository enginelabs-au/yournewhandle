import type { ReactNode } from "react";

type LegalSectionProps = {
  id?: string;
  title: string;
  children: ReactNode;
};

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 space-y-3">
      <h2 className="text-lg font-semibold text-zinc-200">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-dr-muted">{children}</div>
    </section>
  );
}
