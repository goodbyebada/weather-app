import { useState, useEffect } from "react";
import type { Coordinates } from "@shared/types/weather.types";

interface GeolocationState {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  isPermissionDenied: boolean;
}

const supportsGeolocation =
  typeof navigator !== "undefined" && !!navigator.geolocation;

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    isLoading: supportsGeolocation,
    error: supportsGeolocation
      ? null
      : "브라우저가 위치 서비스를 지원하지 않습니다.",
    isPermissionDenied: false,
  });

  useEffect(() => {
    if (!supportsGeolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          isLoading: false,
          error: null,
          isPermissionDenied: false,
        });
      },
      (error) => {
        const isDenied = error.code === error.PERMISSION_DENIED;
        setState({
          coordinates: null,
          isLoading: false,
          error: isDenied
            ? "위치 권한이 거부되었습니다."
            : "위치 정보를 가져올 수 없습니다.",
          isPermissionDenied: isDenied,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 1000 * 60 * 30,
      },
    );
  }, []);

  return state;
};

export { useGeolocation };
