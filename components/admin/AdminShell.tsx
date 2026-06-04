"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "client") {
      router.replace("/mijoz");
    }
  }, [status, session?.user?.role, router]);

  if (status === "authenticated" && session?.user?.role === "client") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-toy-muted">
        <p>
          Admin panel faqat tadbirkorlar uchun.{" "}
          <Link href="/mijoz" className="text-toy-accent hover:underline">
            Mijoz bo&apos;limiga o&apos;tish
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-toy-border bg-toy-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-toy-accent">
              To&apos;y24 Admin
            </p>
            <p className="text-sm text-toy-muted">
              {session?.user?.name ?? "Foydalanuvchi"}
              {session?.user?.role && (
                <span className="ml-2 rounded bg-toy-bg px-2 py-0.5 text-xs">
                  {session.user.role}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg border border-toy-border px-3 py-1.5 text-sm text-toy-muted transition hover:border-toy-accent hover:text-toy-text"
          >
            Chiqish
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
