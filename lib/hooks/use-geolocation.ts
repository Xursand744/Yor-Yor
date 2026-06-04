"use client";

import { useCallback, useEffect, useState } from "react";
import type { Coordinates } from "@/lib/geo";

type GeolocationState = {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  denied: boolean;
};

export function useGeolocation(enabled: boolean): GeolocationState & {
  retry: () => void;
} {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const [tick, setTick] = useState(0);

  const retry = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) {
      setCoords(null);
      setLoading(false);
      setError(null);
      setDenied(false);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Brauzeringiz joylashuvni qo'llab-quvvatlamaydi");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setDenied(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setDenied(true);
          setError("Joylashuv ruxsati berilmagan");
        } else {
          setError("Joylashuv aniqlanmadi");
        }
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 }
    );
  }, [enabled, tick]);

  return { coords, loading, error, denied, retry };
}
