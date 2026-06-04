"use client";

import { MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { distanceKm, formatDistanceKm, sortByDistance } from "@/lib/geo";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { formatUzs } from "@/lib/format";
import type { VenueResponse } from "@/types/venue";

type VenueWithDistance = VenueResponse & { distanceKm: number | null };

type MijozVenuesListProps = {
  venues: VenueResponse[];
};

function VenueCard({
  venue,
  distanceKm: dist,
  highlight,
}: {
  venue: VenueResponse;
  distanceKm: number | null;
  highlight?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/mijoz/${venue.id}`}
        className={`group block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
          highlight
            ? "border-[#b8860b] ring-1 ring-[#d4a574]/40"
            : "border-[#e8dcc8] hover:border-[#d4a574]"
        }`}
      >
        {venue.images[0] ? (
          <img
            src={venue.images[0].imageUrl}
            alt={`${venue.name} rasmi`}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="h-2 bg-gradient-to-r from-[#d4a574] to-[#b8860b]" />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-semibold group-hover:text-[#b8860b]">
              {venue.name}
            </h2>
            {dist != null && (
              <span className="shrink-0 rounded-full bg-[#faf6f0] px-2.5 py-1 text-xs font-medium text-[#b8860b]">
                {formatDistanceKm(dist)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[#6b5d4d]">
            {venue.capacity} kishi · {venue.address}
          </p>
          <p className="mt-2 text-sm text-[#6b5d4d]">
            Reyting: {venue.avgRating.toFixed(1)} / 5 ({venue.reviewCount} ta
            fikr)
          </p>
          <p className="mt-4 text-lg font-semibold text-[#2c2418]">
            {venue.basePrice > 0 ? formatUzs(venue.basePrice) : "Narx so'raladi"}
          </p>
          {venue.basePrice > 0 && (
            <p className="mt-1 text-xs text-[#8a7a68]">
              Avans: {venue.advancePercent}% (
              {formatUzs(
                Math.round((venue.basePrice * venue.advancePercent) / 100)
              )}
              )
            </p>
          )}
          <span className="mt-4 inline-block text-sm font-medium text-[#b8860b]">
            Bron qilish →
          </span>
        </div>
      </Link>
    </li>
  );
}

export function MijozVenuesList({ venues }: MijozVenuesListProps) {
  const { data: session, status } = useSession();
  const isClient =
    status === "authenticated" && session?.user?.role === "client";

  const { coords, loading: geoLoading, error: geoError, denied, retry } =
    useGeolocation(isClient);

  const sorted = useMemo((): VenueWithDistance[] => {
    const withDist: VenueWithDistance[] = venues.map((v) => {
      if (!coords || v.latitude == null || v.longitude == null) {
        return { ...v, distanceKm: null };
      }
      return {
        ...v,
        distanceKm: distanceKm(coords, {
          latitude: v.latitude,
          longitude: v.longitude,
        }),
      };
    });
    if (coords) return sortByDistance(withDist);
    return withDist;
  }, [venues, coords]);

  const nearby = sorted.filter((v) => v.distanceKm != null).slice(0, 4);
  const rest = sorted.filter(
    (v) => !nearby.some((n) => n.id === v.id)
  );

  if (venues.length === 0) {
    return (
      <p className="rounded-xl border border-[#e8dcc8] bg-white p-8 text-center text-[#6b5d4d]">
        Hozircha to&apos;yxonalar ro&apos;yxati bo&apos;sh.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {status === "unauthenticated" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Eslatma:</strong> buyurtma berish uchun{" "}
          <Link href="/royxatdan-otish" className="font-medium underline">
            ro&apos;yxatdan o&apos;ting
          </Link>{" "}
          yoki{" "}
          <Link href="/login" className="font-medium underline">
            kiring
          </Link>
          . Ro&apos;yxatdan keyin sizga yaqin to&apos;yxonalar tavsiya
          qilinadi.
        </div>
      )}

      {isClient && (
        <div className="rounded-xl border border-[#e8dcc8] bg-white px-4 py-3 text-sm text-[#6b5d4d]">
          <div className="flex flex-wrap items-center gap-2">
            <Navigation className="h-4 w-4 text-[#b8860b]" aria-hidden />
            {geoLoading && <span>Joylashuvingiz aniqlanmoqda…</span>}
            {coords && (
              <span>
                Sizga yaqin to&apos;yxonalar yuqorida ko&apos;rsatiladi
              </span>
            )}
            {denied && (
              <>
                <span>{geoError}</span>
                <button
                  type="button"
                  onClick={retry}
                  className="font-medium text-[#b8860b] hover:underline"
                >
                  Qayta urinish
                </button>
              </>
            )}
            {geoError && !denied && !geoLoading && !coords && (
              <span>{geoError}</span>
            )}
          </div>
        </div>
      )}

      {isClient && nearby.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-[#2c2418]">
            <MapPin className="h-5 w-5 text-[#b8860b]" aria-hidden />
            Sizga yaqin
          </h2>
          <ul className="grid gap-6 md:grid-cols-2">
            {nearby.map((v) => (
              <VenueCard
                key={v.id}
                venue={v}
                distanceKm={v.distanceKm}
                highlight
              />
            ))}
          </ul>
        </section>
      )}

      {(rest.length > 0 || nearby.length === 0) && (
        <section>
          {isClient && nearby.length > 0 && (
            <h2 className="mb-4 font-display text-xl font-semibold text-[#2c2418]">
              Boshqa to&apos;yxonalar
            </h2>
          )}
          <ul className="grid gap-6 md:grid-cols-2">
            {(nearby.length > 0 ? rest : sorted).map((v) => (
              <VenueCard
                key={v.id}
                venue={v}
                distanceKm={v.distanceKm}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
