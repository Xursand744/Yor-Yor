"use client";

import Link from "next/link";

type BookingLoginGateProps = {
  venueId: string;
  title?: string;
};

export function BookingLoginGate({
  venueId,
  title = "Bron qilish uchun ro'yxatdan o'ting",
}: BookingLoginGateProps) {
  const callbackUrl = `/mijoz/${venueId}`;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const registerHref = `/royxatdan-otish?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <section className="rounded-2xl border border-[#e8dcc8] bg-gradient-to-br from-[#fff9f0] to-white p-8 text-center shadow-sm">
      <p className="text-4xl" aria-hidden>
        🔐
      </p>
      <h2 className="mt-4 font-display text-xl font-semibold text-[#2c2418]">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#6b5d4d]">
        Buyurtma (bron) faqat ro&apos;yxatdan o&apos;tgan mijozlar uchun. Avval
        hisob oching yoki kiring — keyin sana va to&apos;lovni tanlaysiz.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={registerHref}
          className="inline-flex min-w-[10rem] justify-center rounded-xl bg-[#b8860b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#9a7209]"
        >
          Ro&apos;yxatdan o&apos;tish
        </Link>
        <Link
          href={loginHref}
          className="inline-flex min-w-[10rem] justify-center rounded-xl border border-[#d4a574] px-6 py-3 text-sm font-semibold text-[#b8860b] transition hover:bg-[#faf6f0]"
        >
          Kirish
        </Link>
      </div>
    </section>
  );
}
