"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SuccessActions } from "@/components/mijoz/SuccessActions";
import { apiUrl } from "@/lib/api-url";
import { formatUzs } from "@/lib/format";
import type { BookingResponse } from "@/types/booking";

const SLOT_LABELS: Record<string, string> = {
  abetki_toy: "Abetki to'y",
  kechki_toy: "Kechki to'y",
  nahor_oshi: "Abetki to'y",
  kechki_bazm: "Kechki to'y",
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "To'lanmagan",
  advance_paid: "Avans to'langan",
  paid: "To'liq to'langan",
};

export function MuvaffaqiyatView() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? undefined;
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(!!bookingId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const res = await fetch(apiUrl(`/api/bookings/${bookingId}`));
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Bron yuklanmadi");
        }
        const data = (await res.json()) as BookingResponse;
        if (!cancelled) setBooking(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Xatolik");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (!bookingId) {
    return <p className="text-[#6b5d4d]">Bron identifikatori topilmadi.</p>;
  }

  if (loading) {
    return <p className="text-center text-[#6b5d4d]">Yuklanmoqda…</p>;
  }

  if (error) {
    return <p className="text-[#6b5d4d]">{error}</p>;
  }

  if (notFound || !booking) {
    return <p className="text-[#6b5d4d]">Bron topilmadi.</p>;
  }

  const isPending = booking.status === "pending";

  return (
    <div className="rounded-2xl border border-[#e8dcc8] bg-white p-8 shadow-sm">
      <div
        className={`mb-6 inline-flex rounded-full px-3 py-1 text-sm font-medium ${
          isPending
            ? "bg-amber-100 text-amber-900"
            : "bg-emerald-100 text-emerald-800"
        }`}
      >
        {isPending
          ? "Admin tasdiqlashini kutmoqda"
          : (PAYMENT_LABELS[booking.paymentStatus] ?? booking.paymentStatus)}
      </div>

      <h1 className="font-display text-2xl font-semibold">
        {isPending ? "Ariza yuborildi!" : "Bron tasdiqlandi!"}
      </h1>
      <p className="mt-2 text-[#6b5d4d]">
        {isPending
          ? "To'lov qabul qilindi. Admin tasdiqlagach kun qizil (band) holatda ko'rinadi va SMS/telefon orqali xabar beriladi."
          : "Sizning broningiz tasdiqlandi."}
      </p>
      <p className="mt-2 text-[#6b5d4d]">
        {booking.venueName} · {SLOT_LABELS[booking.slotName] ?? booking.slotName}
      </p>
      <p className="text-[#6b5d4d]">Sana: {booking.bookingDate}</p>

      <dl className="mt-6 space-y-3 border-t border-[#e8dcc8] pt-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-[#8a7a68]">Jami summa</dt>
          <dd className="font-medium">{formatUzs(booking.totalAmount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#8a7a68]">To&apos;langan</dt>
          <dd className="font-medium text-emerald-700">
            {formatUzs(booking.paidAmount)}
          </dd>
        </div>
        {booking.remainingAmount > 0 && (
          <div className="flex justify-between">
            <dt className="text-[#8a7a68]">Qolgan</dt>
            <dd className="font-medium text-amber-700">
              {formatUzs(booking.remainingAmount)}
            </dd>
          </div>
        )}
      </dl>

      {!isPending && booking.remainingAmount > 0 && (
        <div className="mt-6">
          <SuccessActions bookingId={booking.id} />
        </div>
      )}

      {isPending && booking.remainingAmount > 0 && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Qolgan {formatUzs(booking.remainingAmount)} admin tasdiqlagach
          to&apos;lanadi.
        </p>
      )}

      <Link
        href="/mijoz"
        className="mt-8 inline-block text-sm font-medium text-[#b8860b] hover:underline"
      >
        ← Boshqa to&apos;yxonalar
      </Link>
    </div>
  );
}
