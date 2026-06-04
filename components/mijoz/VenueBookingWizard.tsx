"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookingLoginGate } from "@/components/mijoz/BookingLoginGate";
import { VenueImage } from "@/components/VenueImage";
import { apiUrl } from "@/lib/api-url";
import { getDayDisplayState, isSlotTaken } from "@/lib/calendar-display";
import { calcAdvanceAmount, formatUzs } from "@/lib/format";
import type { VenueCalendarResponse } from "@/types/booking";
import type {
  EventSlotResponse,
  VenueResponse,
  VenueReviewResponse,
} from "@/types/venue";

const SLOT_LABELS: Record<string, string> = {
  abetki_toy: "Abetki to'y",
  kechki_toy: "Kechki to'y",
  nahor_oshi: "Abetki to'y",
  kechki_bazm: "Kechki to'y",
};

const MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

type Step = "calendar" | "details" | "payment";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function normalizeUzPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) {
    return `+${digits.slice(0, 12)}`;
  }
  return `+998${digits.slice(0, 9)}`;
}

export function VenueBookingWizard({ venue }: { venue: VenueResponse }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const canBook =
    status === "authenticated" && session?.user?.role === "client";
  const isStaff =
    status === "authenticated" &&
    (session?.user?.role === "admin" || session?.user?.role === "manager");
  const now = new Date();
  const [step, setStep] = useState<Step>("calendar");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [slots, setSlots] = useState<EventSlotResponse[]>([]);
  const [calendar, setCalendar] = useState<VenueCalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookingDate, setBookingDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("+998");
  const [paymentPlan, setPaymentPlan] = useState<"advance" | "full">("advance");
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<VenueReviewResponse[]>(venue.reviews);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  const advanceAmount = calcAdvanceAmount(venue.basePrice, venue.advancePercent);
  const payNow = paymentPlan === "full" ? venue.basePrice : advanceAmount;

  const sessionUser = session?.user;

  useEffect(() => {
    if (!canBook || !sessionUser) return;
    if (sessionUser.name) setClientName(sessionUser.name);
    if (sessionUser.phone) setClientPhone(sessionUser.phone);
  }, [canBook, sessionUser]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [slotsRes, calRes] = await Promise.all([
        fetch(apiUrl("/api/slots")),
        fetch(
          apiUrl(
            `/api/venues/${venue.id}/calendar?year=${year}&month=${month}`
          )
        ),
      ]);
      if (!slotsRes.ok || !calRes.ok) {
        throw new Error("Ma'lumot yuklanmadi");
      }
      const slotsData = (await slotsRes.json()) as EventSlotResponse[];
      const calData = (await calRes.json()) as VenueCalendarResponse;
      setSlots(slotsData);
      setCalendar(calData);
      setSlotId(
        (prev) =>
          prev ||
          slotsData.find((s) => s.slotName === "kechki_toy")?.id ||
          slotsData.find((s) => s.slotName === "kechki_bazm")?.id ||
          slotsData[0]?.id ||
          ""
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  }, [venue.id, year, month]);

  useEffect(() => {
    if (canBook) loadData();
  }, [loadData, canBook]);

  const bookedByDate = useMemo(() => {
    const map = new Map<string, VenueCalendarResponse["days"][0]["slots"]>();
    calendar?.days.forEach((d) => map.set(d.date, d.slots));
    return map;
  }, [calendar]);

  const totalSlots = slots.length || 2;

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    else if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  }

  function getBookedCount(iso: string): number {
    return bookedByDate.get(iso)?.length ?? 0;
  }

  function getSlotsOnDay(iso: string) {
    return bookedByDate.get(iso) ?? [];
  }

  function isDayFullyBooked(iso: string): boolean {
    return getBookedCount(iso) >= totalSlots;
  }

  function isSlotBookedOnDay(iso: string, sId: string): boolean {
    return isSlotTaken(getSlotsOnDay(iso), sId);
  }

  async function submitBooking() {
    if (!canBook) {
      setError("Bron qilish uchun mijoz sifatida kiring.");
      return;
    }
    if (venue.basePrice <= 0) {
      setError("To'yxona narxi belgilanmagan. Admin bilan bog'laning.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await fetch(apiUrl("/api/bookings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueId: venue.id,
        bookingDate,
        slotId,
        clientName,
        clientPhone,
        paymentPlan,
      }),
    });

    const data = (await res.json()) as { id?: string; error?: string };

    setSubmitting(false);

    if (!res.ok || !data.id) {
      setError(data.error ?? "Bron qilinmadi");
      return;
    }

    router.push(`/mijoz/muvaffaqiyat?bookingId=${data.id}`);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewMsg(null);
    setReviewBusy(true);
    try {
      const res = await fetch(apiUrl(`/api/venues/${venue.id}/reviews`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = (await res.json()) as VenueReviewResponse & { error?: string };
      if (!res.ok || !data.id) {
        throw new Error(data.error ?? "Fikr yuborilmadi");
      }

      setReviews((prev) => [data, ...prev]);
      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
      setReviewMsg("Fikringiz uchun rahmat!");
    } catch (error) {
      setReviewMsg(error instanceof Error ? error.message : "Xatolik");
    } finally {
      setReviewBusy(false);
    }
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const startOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedSlot = slots.find((s) => s.id === slotId);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : venue.avgRating.toFixed(1);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/mijoz" className="text-sm text-[#b8860b] hover:underline">
        ← Orqaga
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="font-display text-3xl font-semibold">{venue.name}</h1>
        <p className="mt-1 text-[#6b5d4d]">
          {venue.capacity} kishi · {venue.address}
        </p>
        <p className="mt-2 text-sm text-[#6b5d4d]">
          Reyting: <strong>{avgRating}</strong>/5 ({reviews.length} ta fikr)
        </p>
        {venue.basePrice > 0 && (
          <p className="mt-2 text-xl font-semibold text-[#2c2418]">
            {formatUzs(venue.basePrice)}
            <span className="ml-2 text-sm font-normal text-[#8a7a68]">
              (avans {venue.advancePercent}% — {formatUzs(advanceAmount)})
            </span>
          </p>
        )}
      </div>

      {venue.images.length > 0 && (
        <section className="mb-8 rounded-2xl border border-[#e8dcc8] bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">To&apos;yxona rasmlari</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {venue.images.map((image) => (
              <VenueImage
                key={image.id}
                src={image.imageUrl}
                alt={`${venue.name} rasmi`}
                containerClassName="h-32 rounded-xl"
              />
            ))}
          </div>
        </section>
      )}

      {status === "loading" && (
        <p className="mb-6 text-center text-sm text-[#6b5d4d]">
          Sessiya tekshirilmoqda…
        </p>
      )}

      {!canBook && status !== "loading" && (
        <div className="mb-8">
          {isStaff ? (
            <div className="rounded-2xl border border-[#e8dcc8] bg-white p-6 text-center text-sm text-[#6b5d4d]">
              Bron qilish faqat <strong>mijoz</strong> hisobi orqali mumkin.
              Tadbirkor paneli:{" "}
              <Link href="/admin" className="font-medium text-[#b8860b] hover:underline">
                Admin
              </Link>
            </div>
          ) : (
            <BookingLoginGate venueId={venue.id} />
          )}
        </div>
      )}

      {canBook && (
        <>
      <nav className="mb-8 flex gap-2 text-sm">
        {(["calendar", "details", "payment"] as Step[]).map((s, i) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1 ${
              step === s
                ? "bg-[#b8860b] text-white"
                : "bg-[#e8dcc8] text-[#6b5d4d]"
            }`}
          >
            {i + 1}.{" "}
            {s === "calendar" ? "Sana" : s === "details" ? "Ma'lumot" : "To'lov"}
          </span>
        ))}
      </nav>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === "calendar" && (
        <section className="rounded-2xl border border-[#e8dcc8] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Bo&apos;sh kunni tanlang</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="h-8 w-8 rounded-lg border border-[#e8dcc8]"
              >
                ←
              </button>
              <span className="min-w-[7rem] text-center text-sm font-medium">
                {MONTH_NAMES[month - 1]} {year}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="h-8 w-8 rounded-lg border border-[#e8dcc8]"
              >
                →
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-[#6b5d4d]">Yuklanmoqda…</p>
          ) : (
            <>
              <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-[#8a7a68]">
                {["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <div key={`e-${idx}`} className="h-10" />;
                  }
                  const iso = `${year}-${pad(month)}-${pad(day)}`;
                  const allTaken = isDayFullyBooked(iso);
                  const display = getDayDisplayState(getSlotsOnDay(iso), totalSlots);
                  const selected = bookingDate === iso;
                  const dayClass =
                    display === "busy"
                      ? "cursor-not-allowed border-red-700 bg-red-600 text-white"
                      : display === "partial"
                        ? selected
                          ? "border-[#b8860b] bg-red-400 text-white ring-2 ring-[#b8860b]"
                          : "border-red-400 bg-red-200 text-red-900 hover:bg-red-300"
                        : display === "pending"
                          ? selected
                            ? "border-[#b8860b] bg-amber-400 text-white ring-2 ring-[#b8860b]"
                            : "border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200"
                          : selected
                            ? "border-[#b8860b] bg-[#b8860b] text-white"
                            : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100";
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={allTaken}
                      onClick={() => setBookingDate(iso)}
                      className={`h-10 rounded-lg border text-sm font-medium transition ${dayClass}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#6b5d4d]">
                <span className="flex items-center gap-1.5">
                  <i className="inline-block h-3 w-3 rounded border border-emerald-200 bg-emerald-50" />
                  Bo&apos;sh
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="inline-block h-3 w-3 rounded border border-amber-400 bg-amber-100" />
                  Kutilmoqda
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="inline-block h-3 w-3 rounded border border-red-400 bg-red-200" />
                  Tasdiqlangan
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="inline-block h-3 w-3 rounded bg-red-600" />
                  To&apos;liq band
                </span>
              </div>

              {bookingDate && (
                <div className="mt-6">
                  <p className="mb-2 text-sm font-medium text-[#6b5d4d]">
                    Vaqt sloti — {bookingDate}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => {
                      const taken = isSlotBookedOnDay(bookingDate, s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          disabled={taken}
                          onClick={() => setSlotId(s.id)}
                          className={`rounded-lg px-4 py-2 text-sm ${
                            taken
                              ? "cursor-not-allowed border border-red-300 bg-red-100 text-red-600 line-through"
                              : slotId === s.id
                                ? "bg-[#b8860b] text-white"
                                : "border border-[#e8dcc8] hover:border-[#b8860b]"
                          }`}
                        >
                          {SLOT_LABELS[s.slotName] ?? s.slotName}
                          {taken && " (band)"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={
                  !bookingDate ||
                  !slotId ||
                  isSlotBookedOnDay(bookingDate, slotId)
                }
                onClick={() => setStep("details")}
                className="mt-6 w-full rounded-xl bg-[#b8860b] py-3 font-semibold text-white disabled:opacity-40"
              >
                Davom etish
              </button>
            </>
          )}
        </section>
      )}

      {step === "details" && (
        <section className="rounded-2xl border border-[#e8dcc8] bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Aloqa ma&apos;lumotlari</h2>
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="text-[#6b5d4d]">Ism familiya</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#e8dcc8] bg-[#faf6f0] px-3 py-2.5"
                value={clientName}
                readOnly
                required
                minLength={2}
              />
            </label>
            <label className="block text-sm">
              <span className="text-[#6b5d4d]">Telefon</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#e8dcc8] bg-[#faf6f0] px-3 py-2.5"
                value={clientPhone}
                readOnly
                required
              />
            </label>
            <p className="text-xs text-[#8a7a68]">
              Ma&apos;lumotlar profilingizdan olinadi.
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep("calendar")}
              className="flex-1 rounded-xl border border-[#e8dcc8] py-3"
            >
              Orqaga
            </button>
            <button
              type="button"
              disabled={clientName.length < 2 || !/^\+998\d{9}$/.test(clientPhone)}
              onClick={() => setStep("payment")}
              className="flex-1 rounded-xl bg-[#b8860b] py-3 font-semibold text-white disabled:opacity-40"
            >
              To&apos;lovga
            </button>
          </div>
        </section>
      )}

      {step === "payment" && (
        <section className="rounded-2xl border border-[#e8dcc8] bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">To&apos;lov usuli</h2>

          <div className="mb-4 rounded-xl bg-[#faf6f0] p-4 text-sm">
            <p>
              <strong>Sana:</strong> {bookingDate} ·{" "}
              {selectedSlot
                ? SLOT_LABELS[selectedSlot.slotName] ?? selectedSlot.slotName
                : ""}
            </p>
            <p className="mt-1">
              <strong>Jami:</strong> {formatUzs(venue.basePrice)}
            </p>
          </div>

          <div className="space-y-3">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                paymentPlan === "advance"
                  ? "border-[#b8860b] bg-amber-50"
                  : "border-[#e8dcc8]"
              }`}
            >
              <input
                type="radio"
                name="plan"
                checked={paymentPlan === "advance"}
                onChange={() => setPaymentPlan("advance")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Avans to&apos;lov ({venue.advancePercent}%)</p>
                <p className="text-sm text-[#6b5d4d]">
                  Hozir {formatUzs(advanceAmount)} · Qolgani keyinroq
                </p>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                paymentPlan === "full"
                  ? "border-[#b8860b] bg-amber-50"
                  : "border-[#e8dcc8]"
              }`}
            >
              <input
                type="radio"
                name="plan"
                checked={paymentPlan === "full"}
                onChange={() => setPaymentPlan("full")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">To&apos;liq to&apos;lov</p>
                <p className="text-sm text-[#6b5d4d]">
                  Bir martada {formatUzs(venue.basePrice)}
                </p>
              </div>
            </label>
          </div>

          <p className="mt-4 text-xs text-[#8a7a68]">
            To&apos;lovdan keyin admin broningizni tasdiqlaydi. Tasdiqlangach kun
            kalendarda qizil (band) ko&apos;rinadi. (Demo: Payme/Click keyin
            ulanadi.)
          </p>

          <div className="mt-6 rounded-xl border-2 border-dashed border-[#d4a574] bg-amber-50/50 p-4 text-center">
            <p className="text-sm text-[#6b5d4d]">To&apos;lanadi</p>
            <p className="text-2xl font-bold text-[#2c2418]">{formatUzs(payNow)}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="flex-1 rounded-xl border border-[#e8dcc8] py-3"
            >
              Orqaga
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={submitBooking}
              className="flex-1 rounded-xl bg-[#b8860b] py-3 font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "To'lanmoqda…" : "To'lash va bron qilish"}
            </button>
          </div>
        </section>
      )}
        </>
      )}

      <section className="mt-8 rounded-2xl border border-[#e8dcc8] bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Fikr va baholar</h2>
        <form onSubmit={submitReview} className="mt-4 space-y-3">
          <input
            className="w-full rounded-lg border border-[#e8dcc8] px-3 py-2"
            placeholder="Ismingiz"
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            required
            minLength={2}
          />
          <select
            className="w-full rounded-lg border border-[#e8dcc8] px-3 py-2"
            value={reviewRating}
            onChange={(e) => setReviewRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} yulduz
              </option>
            ))}
          </select>
          <textarea
            className="w-full rounded-lg border border-[#e8dcc8] px-3 py-2"
            rows={3}
            placeholder="To'yxona haqida fikringiz..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            required
            minLength={5}
          />
          <button
            type="submit"
            disabled={reviewBusy}
            className="rounded-xl bg-[#b8860b] px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {reviewBusy ? "Yuborilmoqda..." : "Fikr yuborish"}
          </button>
        </form>
        {reviewMsg && <p className="mt-3 text-sm text-[#6b5d4d]">{reviewMsg}</p>}

        <div className="mt-6 space-y-3">
          {reviews.length === 0 && (
            <p className="text-sm text-[#8a7a68]">Hozircha fikrlar yo&apos;q.</p>
          )}
          {reviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-[#efe3d2] p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{review.clientName}</p>
                <p className="text-sm text-[#b8860b]">{"★".repeat(review.rating)}</p>
              </div>
              <p className="mt-1 text-sm text-[#6b5d4d]">{review.comment}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
