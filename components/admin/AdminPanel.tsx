"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ManageBookingsPanel } from "@/components/admin/ManageBookingsPanel";
import { apiUrl } from "@/lib/api-url";
import { getDayDisplayState } from "@/lib/calendar-display";
import type { VenueCalendarResponse } from "@/types/booking";
import type {
  EventSlotResponse,
  VenueImageResponse,
  VenueResponse,
} from "@/types/venue";

const SLOT_LABELS: Record<string, string> = {
  abetki_toy: "Abetki to'y",
  kechki_toy: "Kechki to'y",
  nahor_oshi: "Abetki to'y",
  kechki_bazm: "Kechki to'y",
};

const MONTH_NAMES = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function normalizeUzPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) {
    return `+${digits.slice(0, 12)}`;
  }
  return `+998${digits.slice(0, 9)}`;
}

export function AdminPanel() {
  const { data: session, status: sessionStatus } = useSession();
  const assignedVenueId = session?.user?.venueId ?? null;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [slots, setSlots] = useState<EventSlotResponse[]>([]);
  const [venueId, setVenueId] = useState("");
  const [calendar, setCalendar] = useState<VenueCalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookingDate, setBookingDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("+998");
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [venueName, setVenueName] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("");
  const [venuePrice, setVenuePrice] = useState("");
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);
  const [images, setImages] = useState<VenueImageResponse[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMsg, setImageMsg] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const effectiveVenueId = assignedVenueId ?? venueId;

  const loadMeta = useCallback(async () => {
    const [venuesRes, slotsRes] = await Promise.all([
      fetch(apiUrl("/api/venues")),
      fetch(apiUrl("/api/slots")),
    ]);

    if (!venuesRes.ok || !slotsRes.ok) {
      throw new Error("Ma'lumotlarni yuklab bo'lmadi");
    }

    const venuesData = (await venuesRes.json()) as VenueResponse[];
    const slotsData = (await slotsRes.json()) as EventSlotResponse[];

    let filtered = venuesData;
    if (assignedVenueId) {
      filtered = venuesData.filter((v) => v.id === assignedVenueId);
    }

    setVenues(filtered);
    setSlots(slotsData);

    if (assignedVenueId && filtered.some((v) => v.id === assignedVenueId)) {
      setVenueId(assignedVenueId);
    } else {
      setVenueId("");
    }
    setSlotId(
      (prev) =>
        prev ||
        slotsData.find((s) => s.slotName === "kechki_toy")?.id ||
        slotsData.find((s) => s.slotName === "kechki_bazm")?.id ||
        slotsData[0]?.id ||
        ""
    );
  }, [assignedVenueId]);

  useEffect(() => {
    const selectedVenue = venues.find((v) => v.id === effectiveVenueId);
    if (!selectedVenue) return;
    setVenueName(selectedVenue.name);
    setVenueCapacity(String(selectedVenue.capacity));
    setVenuePrice(String(selectedVenue.basePrice));
  }, [effectiveVenueId, venues]);

  const loadCalendar = useCallback(async () => {
    if (!effectiveVenueId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        apiUrl(
          `/api/venues/${effectiveVenueId}/calendar?year=${year}&month=${month}`
        )
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Kalendar yuklanmadi");
      }
      const data = (await res.json()) as VenueCalendarResponse;
      setCalendar(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
      setCalendar(null);
    } finally {
      setLoading(false);
    }
  }, [effectiveVenueId, year, month]);

  const loadImages = useCallback(async () => {
    if (!effectiveVenueId) {
      setImages([]);
      return;
    }
    const res = await fetch(apiUrl(`/api/venues/${effectiveVenueId}/images`));
    if (!res.ok) {
      throw new Error("Rasmlar yuklanmadi");
    }
    const data = (await res.json()) as VenueImageResponse[];
    setImages(data);
  }, [effectiveVenueId]);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    loadMeta().catch((e) =>
      setError(e instanceof Error ? e.message : "Xatolik")
    );
  }, [loadMeta, sessionStatus]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    loadImages().catch(() => setImages([]));
  }, [loadImages]);

  const bookedByDate = useMemo(() => {
    const map = new Map<string, VenueCalendarResponse["days"][0]["slots"]>();
    calendar?.days.forEach((day) => map.set(day.date, day.slots));
    return map;
  }, [calendar]);

  const totalSlots = slots.length || 2;

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMsg(null);

    const res = await fetch(apiUrl("/api/bookings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueId: effectiveVenueId,
        bookingDate,
        slotId,
        clientName,
        clientPhone,
        status: "confirmed",
      }),
    });

    const data = (await res.json()) as { error?: string; code?: string };

    if (!res.ok) {
      setSubmitMsg(data.error ?? "Bron qilinmadi");
      return;
    }

    setSubmitMsg("Bron muvaffaqiyatli qabul qilindi");
    setClientName("");
    setClientPhone("+998");
    setBookingDate("");
    loadCalendar();
  }

  async function handleVenueSettingsSave(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveVenueId) return;

    setSettingsMsg(null);
    const res = await fetch(apiUrl(`/api/venues/${effectiveVenueId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: venueName,
        capacity: Number(venueCapacity),
        basePrice: Number(venuePrice),
      }),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setSettingsMsg(data.error ?? "Saqlashda xatolik");
      return;
    }

    setSettingsMsg("To'yxona nomi, narxi va sig'imi yangilandi");
    await loadMeta();
  }

  async function handleImageUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveVenueId || !imageFile) return;
    setImageMsg(null);
    setImageBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      const res = await fetch(apiUrl(`/api/venues/${effectiveVenueId}/images`), {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Rasm yuklanmadi");
      }
      setImageFile(null);
      setImageMsg("Rasm muvaffaqiyatli yuklandi");
      await loadImages();
    } catch (error) {
      setImageMsg(error instanceof Error ? error.message : "Rasm yuklanmadi");
    } finally {
      setImageBusy(false);
    }
  }

  async function handleImageDelete(imageId: string) {
    if (!effectiveVenueId) return;
    setImageMsg(null);
    setImageBusy(true);
    try {
      const res = await fetch(
        apiUrl(`/api/venues/${effectiveVenueId}/images/${imageId}`),
        { method: "DELETE" }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Rasm o'chirilmadi");
      }
      setImageMsg("Rasm o'chirildi");
      await loadImages();
    } catch (error) {
      setImageMsg(error instanceof Error ? error.message : "Rasm o'chmadi");
    } finally {
      setImageBusy(false);
    }
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const startOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <div className="panel">
      <header className="hero">
        <p className="eyebrow">To&apos;y24 · Boshqaruv</p>
        <h1>Kalendar va bron</h1>
        <p className="subtitle">
          Mijoz bronlari avval sariq (tasdiqlash kutilmoqda), tasdiqlangach qizil
          (band). Double booking bazada bloklangan.
        </p>
      </header>

      <section className="toolbar card">
        <div>
          <p className="eyebrow">Sizning to&apos;yxonangiz</p>
          <p>
            {venues.find((v) => v.id === effectiveVenueId)?.name ?? "Biriktirilmagan"}
          </p>
        </div>
        <div className="month-nav">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Oldingi oy">
            ←
          </button>
          <span>
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Keyingi oy">
            →
          </button>
        </div>
      </section>

      <section className="card">
        <h2>To&apos;yxona sozlamalari</h2>
        {!effectiveVenueId && (
          <p className="alert error">
            Akkountingizga to&apos;yxona biriktirilmagan. Admin bilan bog&apos;laning.
          </p>
        )}
        <form onSubmit={handleVenueSettingsSave} className="settings-form">
          <label>
            To&apos;yxona nomi
            <input
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              minLength={2}
              maxLength={120}
              required
            />
          </label>
          <label>
            Sig&apos;imi (kishi)
            <input
              type="number"
              min={1}
              value={venueCapacity}
              onChange={(e) => setVenueCapacity(e.target.value)}
              required
            />
          </label>
          <label>
            Narxi (so&apos;m)
            <input
              type="number"
              min={0}
              step={1000}
              value={venuePrice}
              onChange={(e) => setVenuePrice(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary" disabled={!effectiveVenueId}>
            Saqlash
          </button>
        </form>
        {settingsMsg && <p className="submit-msg">{settingsMsg}</p>}
      </section>

      <section className="card">
        <h2>To&apos;yxona rasmlari</h2>
        {!effectiveVenueId && (
          <p className="alert error">
            Rasm yuklash uchun akkountga to&apos;yxona biriktirilgan bo&apos;lishi kerak.
          </p>
        )}
        <form onSubmit={handleImageUpload} className="settings-form">
          <label>
            Rasm tanlang
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              required
            />
          </label>
          <button type="submit" className="primary" disabled={!effectiveVenueId || !imageFile || imageBusy}>
            {imageBusy ? "Yuklanmoqda..." : "Rasm yuklash"}
          </button>
        </form>
        {imageMsg && <p className="submit-msg">{imageMsg}</p>}
        <div className="image-grid">
          {images.length === 0 && <p className="submit-msg">Hozircha rasm yo&apos;q</p>}
          {images.map((img) => (
            <div key={img.id} className="image-item">
              <img src={img.imageUrl} alt="To&apos;yxona rasmi" />
              <button
                type="button"
                className="danger"
                onClick={() => handleImageDelete(img.id)}
                disabled={imageBusy}
              >
                O&apos;chirish
              </button>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="alert error">{error}</p>}
      {loading && <p className="alert">Yuklanmoqda…</p>}

      {effectiveVenueId && (
        <ManageBookingsPanel venueId={effectiveVenueId} onUpdated={loadCalendar} />
      )}

      <section className="calendar card">
        <div className="weekdays">
          {["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="cell empty" />;
            }

            const iso = `${year}-${pad(month)}-${pad(day)}`;
            const booked = bookedByDate.get(iso);
            const state = getDayDisplayState(booked ?? [], totalSlots);

            return (
              <button
                key={iso}
                type="button"
                className={`cell day ${state}`}
                title={
                  booked?.length
                    ? booked
                        .map(
                          (s) =>
                            `${SLOT_LABELS[s.slotName] ?? s.slotName}: ${s.status}`
                        )
                        .join(", ")
                    : "Bo'sh"
                }
                onClick={() => setBookingDate(iso)}
              >
                <span className="num">{day}</span>
                {booked && booked.length > 0 && (
                  <span className="dots">
                    {booked.map((s) => (
                      <i key={s.bookingId} className={s.status} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="legend">
          <span><i className="swatch free" /> Bo&apos;sh</span>
          <span><i className="swatch pending" /> Tasdiqlash kutilmoqda</span>
          <span><i className="swatch partial" /> Qisman tasdiqlangan</span>
          <span><i className="swatch busy" /> To&apos;liq band</span>
        </div>
      </section>

      <section className="booking card">
        <h2>Yangi bron</h2>
        <form onSubmit={handleBooking}>
          <div className="form-row">
            <label>
              Sana
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
              />
            </label>
            <label>
              Slot
              <select
                value={slotId}
                onChange={(e) => setSlotId(e.target.value)}
                required
              >
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {SLOT_LABELS[s.slotName] ?? s.slotName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Mijoz
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ism familiya"
                minLength={2}
                required
              />
            </label>
            <label>
              Telefon
              <input
                value={clientPhone}
                onChange={(e) => setClientPhone(normalizeUzPhone(e.target.value))}
                placeholder="+998901234567"
                pattern="\+998\d{9}"
                required
              />
            </label>
          </div>
          <button type="submit" className="primary" disabled={!effectiveVenueId}>
            Bron qilish
          </button>
          {submitMsg && <p className="submit-msg">{submitMsg}</p>}
        </form>
      </section>

      <style jsx>{`
        .panel {
          --bg: #0f1410;
          --card: #1a2218;
          --border: #2d3b2a;
          --text: #f2ebe0;
          --muted: #9aab8f;
          --free: #3d8f5a;
          --partial: #c9a227;
          --busy: #b84a4a;
          --accent: #d4a574;
          max-width: 920px;
          margin: 0 auto;
          padding: 2rem 1.25rem 4rem;
          color: var(--text);
          font-family: "Segoe UI", system-ui, sans-serif;
        }
        .hero h1 {
          font-size: 2rem;
          font-weight: 600;
          margin: 0.25rem 0;
          letter-spacing: -0.02em;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.75rem;
          color: var(--accent);
          margin: 0;
        }
        .subtitle {
          color: var(--muted);
          max-width: 36rem;
          line-height: 1.5;
        }
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem;
          margin-top: 1.25rem;
        }
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: flex-end;
          justify-content: space-between;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--muted);
        }
        select,
        input {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 0.95rem;
        }
        .month-nav {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .month-nav button {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 8px;
          cursor: pointer;
        }
        .month-nav span {
          min-width: 8rem;
          text-align: center;
          font-weight: 500;
        }
        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 4px;
          font-size: 0.75rem;
          color: var(--muted);
          text-align: center;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .cell {
          min-height: 3.25rem;
          border-radius: 8px;
        }
        .cell.empty {
          background: transparent;
        }
        .cell.day {
          border: 1px solid var(--border);
          background: color-mix(in srgb, var(--free) 18%, var(--card));
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          transition: transform 0.12s ease;
        }
        .cell.day:hover {
          transform: scale(1.03);
        }
        .cell.day.pending {
          background: color-mix(in srgb, var(--partial) 40%, var(--card));
          border-color: var(--partial);
          color: #ffe9a8;
        }
        .cell.day.partial {
          background: color-mix(in srgb, var(--busy) 35%, var(--card));
          border-color: color-mix(in srgb, var(--busy) 70%, var(--border));
          color: #ffb4b4;
        }
        .cell.day.busy {
          background: color-mix(in srgb, var(--busy) 55%, var(--card));
          border-color: var(--busy);
          color: #ffe0e0;
        }
        .num {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .dots {
          display: flex;
          gap: 3px;
          margin-top: 2px;
        }
        .dots i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
        }
        .dots i.confirmed {
          background: var(--busy);
        }
        .dots i.pending {
          background: var(--partial);
        }
        .legend {
          display: flex;
          gap: 1.25rem;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: var(--muted);
        }
        .swatch {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 3px;
          margin-right: 6px;
          vertical-align: middle;
        }
        .swatch.free {
          background: var(--free);
        }
        .swatch.pending {
          background: var(--partial);
        }
        .swatch.partial {
          background: color-mix(in srgb, var(--busy) 70%, var(--card));
          border: 1px solid var(--busy);
        }
        .swatch.busy {
          background: var(--busy);
        }
        .booking h2 {
          font-size: 1.1rem;
          margin: 0 0 1rem;
        }
        .settings-form {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr auto;
          gap: 0.75rem;
          align-items: end;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        @media (max-width: 600px) {
          .settings-form,
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        .primary {
          background: var(--accent);
          color: #1a1208;
          border: none;
          padding: 0.65rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .alert {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: var(--card);
        }
        .alert.error {
          color: #ffb4b4;
          border: 1px solid var(--busy);
        }
        .submit-msg {
          margin-top: 0.75rem;
          color: var(--accent);
        }
        .image-grid {
          margin-top: 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.75rem;
        }
        .image-item {
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          background: var(--bg);
        }
        .image-item img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }
        .danger {
          width: 100%;
          border: none;
          background: #8d2f2f;
          color: #fff;
          padding: 0.45rem;
          cursor: pointer;
        }
        .danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
