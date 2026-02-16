import { useState, useEffect } from "react";
import { useGeolocation } from "./useGeolocation";
import { fetchCoordinates } from "@entities/location/api/geocoding";
import { DEFAULT_LOCATION_QUERY } from "@shared/constants/location";
import type { Coordinates } from "@shared/types/weather.types";

export const useAppLocation = () => {
  const geoState = useGeolocation();
  const [fallbackState, setFallbackState] = useState<{
    coordinates: Coordinates | null;
    isLoading: boolean;
    error: string | null;
  }>({
    coordinates: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    // 지오코딩이 실패/거부/미지원으로 끝나고, 좌표가 없을 때만 폴백 실행
    if (!geoState.isLoading && !geoState.coordinates) {
      const fetchDefault = async () => {
        setFallbackState((prev) => ({ ...prev, isLoading: true }));
        try {
          const defaultCoords = await fetchCoordinates(DEFAULT_LOCATION_QUERY);
          if (defaultCoords) {
            setFallbackState({
              coordinates: defaultCoords,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error("Default location not found");
          }
        } catch {
          // 최후의 수단: 하드코딩된 서울 좌표
          setFallbackState({
            coordinates: { lat: 37.5665, lon: 126.978 },
            isLoading: false,
            error: "기본 위치 정보를 가져올 수 없습니다.",
          });
        }
      };

      fetchDefault();
    }
  }, [geoState.isLoading, geoState.coordinates]);

  // Derived State (파생 상태) 계산
  // 1. 지오코딩 로딩 중이면 전체 로딩
  if (geoState.isLoading) {
    return {
      coordinates: null,
      isLoading: true,
      error: null,
      isPermissionDenied: false,
      isDefaultLocation: false,
    };
  }

  // 2. 지오코딩 성공 시 해당 좌표 사용
  if (geoState.coordinates) {
    return {
      coordinates: geoState.coordinates,
      isLoading: false,
      error: null,
      isPermissionDenied: false,
      isDefaultLocation: false,
    };
  }

  // 3. 폴백 상태 반환
  return {
    coordinates: fallbackState.coordinates,
    isLoading: fallbackState.isLoading,
    error: fallbackState.error || geoState.error, // 폴백 에러가 없으면 기존 지오코딩 에러 표시
    isPermissionDenied: geoState.isPermissionDenied,
    isDefaultLocation: true, // 폴백을 사용했으므로 항상 true
  };
};
