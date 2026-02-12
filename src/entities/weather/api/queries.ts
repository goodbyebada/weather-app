import { useQuery } from "@tanstack/react-query";
import { fetchCurrentWeather, fetchForecast } from "@shared/api/weather.api";
import { parseApiError } from "@shared/api/error";
import type { WeatherResponse, ForecastResponse } from "@shared/types/weather.types";

// Query Keys
export const weatherKeys = {
  all: ["weather"] as const,
  current: (lat: number, lon: number) => [...weatherKeys.all, "current", lat, lon] as const,
  forecast: (lat: number, lon: number) => [...weatherKeys.all, "forecast", lat, lon] as const,
};

// 현재 날씨 조회 훅
export const useWeatherQuery = (lat: number, lon: number, enabled = true) => {
  return useQuery<WeatherResponse>({
    queryKey: weatherKeys.current(lat, lon),
    queryFn: () => fetchCurrentWeather(lat, lon),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    enabled,
    select: (data) => data,
    throwOnError: false,
    meta: { parseApiError },
  });
};

// 시간별 예보 조회 훅
export const useHourlyForecastQuery = (lat: number, lon: number, enabled = true) => {
  return useQuery<ForecastResponse>({
    queryKey: weatherKeys.forecast(lat, lon),
    queryFn: () => fetchForecast(lat, lon),
    staleTime: 1000 * 60 * 10, // 10분
    gcTime: 1000 * 60 * 15, // 15분
    enabled,
    throwOnError: false,
    meta: { parseApiError },
  });
};
