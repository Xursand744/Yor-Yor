"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronDown, LogOut, Sparkles } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = status === "authenticated" && session?.user;

  useGSAP(
    () => {
      gsap.from(".nav-anim", {
        y: -24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      });
    },
    { scope: navRef }
  );

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (navRef.current && !navRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 border-b border-violet-200/40 bg-white/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link
          href="/"
          className="nav-anim group flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-violet-950"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 transition group-hover:shadow-violet-500/50">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          Yor Yor
        </Link>

        <nav className="nav-anim hidden items-center gap-6 text-sm font-medium text-violet-900/70 sm:flex">
          <Link href="/mijoz" className="transition hover:text-violet-950">
            To&apos;yxonalar
          </Link>
        </nav>

        <div className="nav-anim flex items-center gap-2 sm:gap-3">
          {status === "loading" ? (
            <span className="h-9 w-24 animate-pulse rounded-full bg-violet-100" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-2xl border border-violet-200/80 bg-gradient-to-r from-white to-violet-50/80 px-3 py-2 text-left shadow-sm transition hover:border-violet-300 hover:shadow-md sm:gap-3 sm:px-4"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate text-sm font-semibold text-violet-950">
                    {session.user.name}
                  </span>
                  <span className="block truncate text-xs text-violet-600/80">
                    {session.user.phone ?? "—"}
                  </span>
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-400 text-xs font-bold text-white sm:hidden">
                  {session.user.name?.charAt(0) ?? "?"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-violet-500 transition ${menuOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-violet-100 bg-white py-1 shadow-xl shadow-violet-900/10"
                >
                  <div className="border-b border-violet-50 px-4 py-3 sm:hidden">
                    <p className="text-sm font-semibold text-violet-950">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-violet-600">
                      {session.user.phone ?? "—"}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-violet-900 transition hover:bg-violet-50"
                  >
                    <LogOut className="h-4 w-4 text-fuchsia-500" aria-hidden />
                    Chiqish
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-50"
              >
                Kirish
              </Link>
              <Link
                href="/royxatdan-otish"
                className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition hover:brightness-110 hover:shadow-lg"
              >
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
