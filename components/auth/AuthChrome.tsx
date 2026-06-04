import Link from "next/link";
import type { ReactNode } from "react";

type AuthChromeProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
};

export function AuthChrome({
  children,
  title,
  subtitle,
  backHref = "/",
  backLabel = "Bosh sahifa",
}: AuthChromeProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0f0a] text-[#f4ede3]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212, 165, 116, 0.35), transparent),
            radial-gradient(ellipse 40% 30% at 100% 50%, rgba(61, 143, 90, 0.12), transparent)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <Link
          href="/"
          className="font-display text-lg tracking-wide text-[#d4a574] transition hover:text-[#e8c9a0]"
        >
          Yor Yor
        </Link>
        <Link
          href={backHref}
          className="text-sm text-[#9aab8f] transition hover:text-[#f4ede3]"
        >
          ← {backLabel}
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-lg px-4 pb-16 pt-4">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#f4ede3] md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#9aab8f]">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
