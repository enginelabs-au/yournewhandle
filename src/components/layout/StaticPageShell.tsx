import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

type StaticPageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function StaticPageShell({ title, description, children }: StaticPageShellProps) {
  return (
    <div className="dr-page flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 lg:px-6">
        <header className="mb-8 border-b border-dr-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">{title}</h1>
          {description ? (
            <p className="mt-3 text-sm leading-relaxed text-dr-muted">{description}</p>
          ) : null}
        </header>
        <article className="legal-prose pb-12">{children}</article>
      </main>
      <SiteFooter />
    </div>
  );
}
