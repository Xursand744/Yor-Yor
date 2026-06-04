"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiUrl } from "@/lib/api-url";

export function SuccessActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function payRemainder() {
    setLoading(true);
    setError(null);

    const res = await fetch(apiUrl(`/api/bookings/${bookingId}/pay`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "online" }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "To'lov amalga oshmadi");
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-xl bg-amber-50 p-4">
      <p className="text-sm text-amber-900">
        Qolgan summani hozir to&apos;lashingiz mumkin (demo onlayn to&apos;lov).
      </p>
      <button
        type="button"
        onClick={payRemainder}
        disabled={loading}
        className="mt-3 w-full rounded-lg bg-[#b8860b] py-2.5 text-sm font-semibold text-white hover:bg-[#9a7209] disabled:opacity-50"
      >
        {loading ? "To'lanmoqda…" : "Qolganini to'lash"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
