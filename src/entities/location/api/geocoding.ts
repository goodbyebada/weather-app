import axios from "axios";
import type { Coordinates } from "@shared/types/location.types";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const GEOCODING_URL = "https://api.openweathermap.org/geo/1.0/direct";

interface GeocodingResponse {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/**
 * 주소(지역명) → 좌표 변환
 * OpenWeatherMap Geocoding API 사용
 */
export const fetchCoordinates = async (
  query: string,
): Promise<Coordinates | null> => {
  const { data } = await axios.get<GeocodingResponse[]>(GEOCODING_URL, {
    params: {
      q: `${query},KR`,
      limit: 1,
      appid: API_KEY,
    },
  });

  if (data.length === 0) return null;

  return {
    lat: data[0].lat,
    lon: data[0].lon,
  };
};
