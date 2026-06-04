"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { formatApiErrorMessage } from "@/lib/api-error";
import { apiUrl } from "@/lib/api-url";
import { normalizeUzPhone } from "@/lib/phone";

gsap.registerPlugin(useGSAP);

type ForgotPasswordPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ForgotPasswordPanel({ open, onClose }: ForgotPasswordPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useGSAP(
    () => {
      if (!open || !panelRef.current || !backdropRef.current) return;

      gsap.set(panelRef.current, { display: "flex" });
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" }
      );
      gsap.fromTo(
        panelRef.current.querySelector(".reset-card"),
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "power3.out" }
      );
    },
    { dependencies: [open], scope: panelRef }
  );

  function handleClose() {
    if (!panelRef.current || !backdropRef.current) {
      onClose();
      return;
    }

    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
    });
    gsap.to(panelRef.current.querySelector(".reset-card"), {
      y: 24,
      opacity: 0,
      scale: 0.98,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(panelRef.current!, { display: "none" });
        setError(null);
        setSuccess(null);
        setPassword("");
        setConfirmPassword("");
        onClose();
      },
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizeUzPhone(phone),
          password,
          confirmPassword,
        }),
      });

      let data: { error?: string | Record<string, string[]>; message?: string };
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setError(`Server xatosi (${res.status}). Qayta urinib ko'ring.`);
        return;
      }

      if (!res.ok) {
        setError(formatApiErrorMessage(data, "Parolni tiklashda xatolik yuz berdi"));
        return;
      }

      setSuccess(data.message ?? "Parol yangilandi. Endi yangi parol bilan kirishingiz mumkin.");
    } catch (err) {
      console.error("[ForgotPassword]", err);
      setError("Serverga ulanib bo'lmadi. Internet va dev serverni tekshiring.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const inputClass =
    "w-full rounded-xl border border-[#2d3b2a] bg-[#141a14] px-4 py-3 text-[#f4ede3] outline-none transition focus:border-violet-400 focus:ring-1 focus:ring-violet-400";

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[100] hidden items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-title"
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div className="reset-card relative z-10 w-full max-w-md rounded-2xl border border-violet-500/30 bg-[#1a2218] p-6 shadow-2xl shadow-violet-900/40 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="reset-password-title"
              className="font-display text-xl font-semibold text-[#f4ede3]"
            >
              Parolni tiklash
            </h2>
            <p className="mt-1 text-sm text-[#9aab8f]">
              Ro&apos;yxatdan o&apos;tgan telefon raqamingiz va yangi parol
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-[#9aab8f] transition hover:bg-white/10 hover:text-white"
            aria-label="Yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
              Telefon
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(normalizeUzPhone(e.target.value))}
              className={inputClass}
              placeholder="+998901234567"
              pattern="\+998\d{9}"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
              Yangi parol
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
              Parolni tasdiqlang
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </label>

          {error && (
            <p className="rounded-xl border border-[#b84a4a]/50 bg-[#b84a4a]/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Saqlanmoqda…" : "Parolni yangilash"}
          </button>
        </form>
      </div>
    </div>
  );
}
