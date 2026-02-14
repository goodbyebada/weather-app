import type { WeatherResponse, WeatherData } from "@shared/types/weather.types";

export const mapWeatherResponseToData = (
  response: WeatherResponse,
  locationName?: string,
): WeatherData => {
  return {
    locationName: locationName || response.name,
    temp: response.main.temp,
    tempMin: response.main.temp_min,
    tempMax: response.main.temp_max,
    feelsLike: response.main.feels_like,
    humidity: response.main.humidity,
    windSpeed: response.wind.speed,
    description: response.weather[0]?.description || "정보 없음",
    icon: response.weather[0]?.icon || "01d",
    coord: response.coord,
    dt: response.dt,
  };
};
