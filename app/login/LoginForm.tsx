"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { getSession, signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { resolvePostAuthRedirect } from "@/lib/auth-redirect";
import { fullName, normalizeUzPhone } from "@/lib/phone";
import { ForgotPasswordPanel } from "./ForgotPasswordPanel";

gsap.registerPlugin(useGSAP);

export default function LoginForm() {
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  useGSAP(
    () => {
      gsap.from(".login-reveal", {
        y: 28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
    },
    { scope: formRef, dependencies: [], revertOnUpdate: false }
  );

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.role) return;
    router.replace(
      resolvePostAuthRedirect(session.user.role, callbackUrl)
    );
  }, [status, session?.user?.role, router, callbackUrl]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const displayName = fullName(firstName, lastName);
    const result = await signIn("credentials", {
      name: displayName,
      phone: normalizeUzPhone(phone),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        "Telefon, ism yoki parol noto'g'ri. Ma'lumotlarni tekshirib qayta urinib ko'ring."
      );
      return;
    }

    const freshSession = await getSession();
    const target = resolvePostAuthRedirect(
      freshSession?.user?.role,
      callbackUrl
    );
    router.replace(target);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-xl border border-[#2d3b2a] bg-[#141a14] px-4 py-3 text-[#f4ede3] outline-none transition focus:border-violet-400 focus:ring-1 focus:ring-violet-400";

  return (
    <>
      <div
        ref={formRef}
        className="login-reveal rounded-2xl border border-[#2d3b2a] bg-[#1a2218]/90 p-6 shadow-2xl shadow-black/30 sm:p-8"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="login-reveal block">
              <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                Ism
              </span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                placeholder="Ali"
                autoComplete="given-name"
                required
              />
            </label>
            <label className="login-reveal block">
              <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                Familiya
              </span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                placeholder="Valiyev"
                autoComplete="family-name"
                required
              />
            </label>
            <label className="login-reveal block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                Telefon raqami
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(normalizeUzPhone(e.target.value))}
                className={inputClass}
                placeholder="+998901234567"
                pattern="\+998\d{9}"
                autoComplete="tel"
                required
              />
            </label>
            <label className="login-reveal block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                Parol
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                minLength={6}
              />
            </label>
          </div>

          <p className="login-reveal mt-4 text-right">
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-sm font-medium text-violet-300 transition hover:text-violet-200 hover:underline"
            >
              Parolni unutdingizmi?
            </button>
          </p>

          {error && (
            <p className="login-reveal mt-4 rounded-xl border border-[#b84a4a]/50 bg-[#b84a4a]/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || status === "loading"}
            className="login-reveal mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Kirish…" : "Kirish"}
          </button>
        </form>

        <p className="login-reveal mt-6 text-center text-sm text-[#9aab8f]">
          Hisobingiz yo&apos;qmi?{" "}
          <Link
            href="/royxatdan-otish"
            className="font-medium text-violet-300 hover:underline"
          >
            Ro&apos;yxatdan o&apos;tish
          </Link>
        </p>
      </div>

      <ForgotPasswordPanel open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}
