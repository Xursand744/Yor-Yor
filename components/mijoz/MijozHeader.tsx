"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function MijozHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-[#e8dcc8] bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/mijoz" className="group">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8860b]">
            Yor Yor
          </p>
          <p className="font-display text-lg font-semibold text-[#2c2418] group-hover:text-[#b8860b]">
            To&apos;yxona bron
          </p>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {status === "authenticated" && session?.user ? (
            <>
              <span className="hidden text-[#6b5d4d] sm:inline">
                {session.user.name}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/mijoz" })}
                className="text-[#6b5d4d] hover:text-[#b8860b]"
              >
                Chiqish
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login?callbackUrl=%2Fmijoz"
                className="text-[#6b5d4d] hover:text-[#b8860b]"
              >
                Kirish
              </Link>
              <Link
                href="/royxatdan-otish"
                className="rounded-lg bg-[#b8860b] px-3 py-1.5 font-medium text-white hover:bg-[#9a7209]"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </>
          )}
          <Link
            href="/login"
            className="text-xs text-[#8a7a68] hover:text-[#b8860b]"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
