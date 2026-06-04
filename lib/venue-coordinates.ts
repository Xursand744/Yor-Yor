/** Seed to'yxonalar uchun taxminiy koordinatalar (Toshkent) */
export const VENUE_COORDINATES_BY_NAME: Record<
  string,
  { latitude: number; longitude: number }
> = {
  "Oltin Saroy": { latitude: 41.367, longitude: 69.29 },
  Billur: { latitude: 41.285, longitude: 69.204 },
  Fayz: { latitude: 41.338, longitude: 69.335 },
  Tantana: { latitude: 41.22, longitude: 69.22 },
  Odilbek: { latitude: 41.288, longitude: 69.268 },
  Istanbul: { latitude: 41.326, longitude: 69.248 },
  Decarat: { latitude: 41.355, longitude: 69.22 },
  Marvarid: { latitude: 41.288, longitude: 69.3 },
};

export const TASHKENT_CENTER = { latitude: 41.2995, longitude: 69.2401 };

export function resolveVenueCoordinates(
  name: string,
  latitude?: number | null,
  longitude?: number | null
): { latitude: number; longitude: number } | null {
  if (latitude != null && longitude != null) {
    return { latitude, longitude };
  }
  return VENUE_COORDINATES_BY_NAME[name] ?? null;
}
