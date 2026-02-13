import { useState, useEffect } from "react";
import type { Coordinates } from "@shared/types/weather.types";

interface GeolocationState {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  isPermissionDenied: boolean;
}

const SEOUL_COORDINATES: Coordinates = { lat: 37.5683, lon: 126.9778 };

const supportsGeolocation =
  typeof navigator !== "undefined" && !!navigator.geolocation;

const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>(() => {
    if (!supportsGeolocation) {
      return {
        coordinates: SEOUL_COORDINATES,
        isLoading: false,
        error: "브라우저가 위치 서비스를 지원하지 않습니다.",
        isPermissionDenied: false,
      };
    }
    return {
      coordinates: null,
      isLoading: true,
      error: null,
      isPermissionDenied: false,
    };
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
          coordinates: SEOUL_COORDINATES,
          isLoading: false,
          error: isDenied
            ? "위치 권한이 거부되었습니다."
            : "위치 정보를 가져올 수 없습니다.",
          isPermissionDenied: isDenied,
        });
      },
      {
        //  GPS 대신 Wi-Fi/IP 기반 위치 사용
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 1000 * 60 * 30,
      },
    );
  }, []);

  return state;
};

export { useGeolocation, SEOUL_COORDINATES };
