"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/lib/api-url";
import { formatUzs } from "@/lib/format";
import type { BookingResponse } from "@/types/booking";

const SLOT_LABELS: Record<string, string> = {
  abetki_toy: "Abetki to'y",
  kechki_toy: "Kechki to'y",
  nahor_oshi: "Abetki to'y",
  kechki_bazm: "Kechki to'y",
};

export function ManageBookingsPanel({
  venueId,
  onUpdated,
}: {
  venueId: string;
  onUpdated: () => void;
}) {
  const [items, setItems] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/bookings?venueId=${venueId}`));
      if (res.ok) {
        setItems((await res.json()) as BookingResponse[]);
      }
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    load();
  }, [load]);

  const pending = useMemo(
    () => items.filter((b) => b.status === "pending"),
    [items]
  );
  const confirmed = useMemo(
    () => items.filter((b) => b.status === "confirmed"),
    [items]
  );

  async function handleConfirm(id: string) {
    if (!confirm("Bronni tasdiqlaysizmi?")) return;
    setActingId(id);
    const res = await fetch(apiUrl(`/api/bookings/${id}/confirm`), {
      method: "PATCH",
    });
    setActingId(null);
    if (res.ok) {
      await load();
      onUpdated();
    }
  }

  async function handleCancel(id: string, clientName: string) {
    if (
      !confirm(
        `"${clientName}" broni bekor qilinsinmi? Kun kalendarda yana bo'sh bo'ladi.`
      )
    ) {
      return;
    }
    setActingId(id);
    const res = await fetch(apiUrl(`/api/bookings/${id}/cancel`), {
      method: "PATCH",
    });
    setActingId(null);
    if (res.ok) {
      await load();
      onUpdated();
    }
  }

  if (loading && items.length === 0) {
    return (
      <section className="manage-card">
        <p className="manage-muted">Bronlar yuklanmoqda…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="manage-card">
      <h2 className="manage-title">Faol bronlar</h2>

      {pending.length > 0 && (
        <div className="manage-section">
          <h3 className="manage-subtitle">
            Tasdiqlash kutilmoqda
            <span className="manage-badge">{pending.length}</span>
          </h3>
          <ul className="manage-list">
            {pending.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                actingId={actingId}
                onConfirm={() => handleConfirm(b.id)}
                onCancel={() => handleCancel(b.id, b.clientName)}
                showConfirm
              />
            ))}
          </ul>
        </div>
      )}

      {confirmed.length > 0 && (
        <div className="manage-section">
          <h3 className="manage-subtitle">
            Tasdiqlangan
            <span className="manage-badge confirmed">{confirmed.length}</span>
          </h3>
          <ul className="manage-list">
            {confirmed.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                actingId={actingId}
                onCancel={() => handleCancel(b.id, b.clientName)}
              />
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .manage-card {
          background: #1a2218;
          border: 1px solid #2d3b2a;
          border-radius: 12px;
          padding: 1.25rem;
          margin-top: 1.25rem;
        }
        .manage-title {
          font-size: 1.1rem;
          margin: 0 0 1rem;
          color: #f2ebe0;
        }
        .manage-subtitle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          margin: 0 0 0.75rem;
          color: #9aab8f;
        }
        .manage-section {
          margin-bottom: 1.25rem;
        }
        .manage-section:last-child {
          margin-bottom: 0;
        }
        .manage-badge {
          background: #c9a227;
          color: #1a1208;
          font-size: 0.7rem;
          padding: 0.1rem 0.45rem;
          border-radius: 999px;
        }
        .manage-badge.confirmed {
          background: #b84a4a;
          color: #fff;
        }
        .manage-muted {
          color: #9aab8f;
          margin: 0;
          font-size: 0.9rem;
        }
        .manage-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
      `}</style>
    </section>
  );
}

function BookingRow({
  booking: b,
  actingId,
  onConfirm,
  onCancel,
  showConfirm,
}: {
  booking: BookingResponse;
  actingId: string | null;
  onConfirm?: () => void;
  onCancel: () => void;
  showConfirm?: boolean;
}) {
  return (
    <li className="row">
      <div className="row-info">
        <p className="row-name">{b.clientName}</p>
        <p className="row-meta">
          {b.bookingDate} · {SLOT_LABELS[b.slotName] ?? b.slotName} ·{" "}
          {b.clientPhone}
        </p>
        <p className="row-pay">
          To&apos;langan: {formatUzs(b.paidAmount)}
          {b.remainingAmount > 0 && (
            <> · Qolgan: {formatUzs(b.remainingAmount)}</>
          )}
        </p>
      </div>
      <div className="row-actions">
        {showConfirm && onConfirm && (
          <button
            type="button"
            disabled={actingId === b.id}
            onClick={onConfirm}
            className="btn-confirm"
          >
            Tasdiqlash
          </button>
        )}
        <button
          type="button"
          disabled={actingId === b.id}
          onClick={onCancel}
          className="btn-cancel"
        >
          {actingId === b.id ? "…" : "Bekor qilish"}
        </button>
      </div>
      <style jsx>{`
        .row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          background: #0f1410;
          border: 1px solid #2d3b2a;
          border-radius: 8px;
          padding: 0.85rem 1rem;
        }
        .row-name {
          font-weight: 600;
          margin: 0;
          color: #f2ebe0;
        }
        .row-meta {
          margin: 0.2rem 0 0;
          font-size: 0.8rem;
          color: #9aab8f;
        }
        .row-pay {
          margin: 0.15rem 0 0;
          font-size: 0.8rem;
          color: #d4a574;
        }
        .row-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .btn-confirm {
          background: #3d8f5a;
          color: white;
          border: none;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .btn-cancel {
          background: transparent;
          color: #ffb4b4;
          border: 1px solid #b84a4a;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .btn-confirm:disabled,
        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-confirm:hover:not(:disabled) {
          filter: brightness(1.1);
        }
        .btn-cancel:hover:not(:disabled) {
          background: color-mix(in srgb, #b84a4a 20%, transparent);
        }
      `}</style>
    </li>
  );
}
