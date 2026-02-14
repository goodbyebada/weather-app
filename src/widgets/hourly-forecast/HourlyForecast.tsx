import Card from "@shared/ui/card/Card";
import type { HourlyWeather } from "@shared/types/weather.types";

interface HourlyForecastProps {
  items: HourlyWeather[];
}

const HourlyForecast = ({ items }: HourlyForecastProps) => {
  const formatTime = (dt: number) => {
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "numeric",
      hour12: true,
    }).format(dt * 1000);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-primary rounded-full" />
        시간별 예보
      </h3>

      <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide">
        {items.map((item) => (
          <div
            key={item.dt}
            className="flex flex-col items-center min-w-[70px] py-4 rounded-2xl transition-colors hover:bg-gray-50"
          >
            <span className="text-xs font-medium text-gray-500 mb-3">
              {formatTime(item.dt)}
            </span>
            <img
              src={`https://openweathermap.org/img/wn/${item.icon}.png`}
              alt={item.description}
              className="w-12 h-12 mb-2 drop-shadow-sm"
            />
            <span className="text-lg font-bold text-gray-900">
              {Math.round(item.temp)}°
            </span>
            <div className="mt-2 flex flex-col items-center">
              {item.pop > 0 && (
                <span className="text-[10px] font-bold text-blue-500">
                  {Math.round(item.pop * 100)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default HourlyForecast;
