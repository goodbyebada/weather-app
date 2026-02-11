import axios from 'axios';
import type { WeatherResponse, ForecastResponse } from '../types/weather.types';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const weatherClient = axios.create({
  baseURL: BASE_URL,
  params: {
    appid: API_KEY,
    units: 'metric',
    lang: 'kr',
  },
});

// 좌표 기반 현재 날씨 조회
export const fetchCurrentWeather = async (
  lat: number,
  lon: number
): Promise<WeatherResponse> => {
  const { data } = await weatherClient.get<WeatherResponse>('/weather', {
    params: { lat, lon },
  });
  return data;
};

// 좌표 기반 5일 / 3시간 간격 예보 조회
export const fetchForecast = async (
  lat: number,
  lon: number
): Promise<ForecastResponse> => {
  const { data } = await weatherClient.get<ForecastResponse>('/forecast', {
    params: { lat, lon },
  });
  return data;
};
