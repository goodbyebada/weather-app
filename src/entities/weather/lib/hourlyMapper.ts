import type { ForecastResponse, HourlyWeather } from "@shared/types/weather.types";

export const mapForecastToHourly = (response: ForecastResponse): HourlyWeather[] => {
  return response.list.slice(0, 10).map((item) => ({
    dt: item.dt,
    temp: item.main.temp,
    icon: item.weather[0]?.icon || "01d",
    description: item.weather[0]?.description || "",
    pop: item.pop, // 강수 확률
  }));
};
