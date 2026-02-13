import { useParams, useNavigate } from "react-router-dom";
import { HourlyForecast } from "@widgets/hourly-forecast";
import { Loading, ErrorMessage, StarIcon, Card } from "@shared/ui";
import {
  useWeatherQuery,
  useHourlyForecastQuery,
} from "@entities/weather/api/queries";
import { mapWeatherResponseToData } from "@entities/weather/lib/weatherMapper";
import { useFavoriteStore } from "@entities/favorite/model/store";

const WeatherDetailPage = () => {
  const { lat, lon } = useParams<{ lat: string; lon: string }>();
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite, isFavorite } =
    useFavoriteStore();

  const numLat = Number(lat);
  const numLon = Number(lon);
  const isValidCoords = !isNaN(numLat) && !isNaN(numLon);

  const {
    data: weatherResponse,
    isLoading: isWeatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useWeatherQuery(numLat, numLon, isValidCoords);

  const { data: hourlyData, isLoading: isHourlyLoading } =
    useHourlyForecastQuery(numLat, numLon, isValidCoords);

  if (!isValidCoords) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <ErrorMessage message="잘못된 좌표입니다." />
      </main>
    );
  }

  const weather = weatherResponse
    ? mapWeatherResponseToData(weatherResponse)
    : null;

  const favorited = weather ? isFavorite(weather.locationName) : false;
  const favoriteItem = weather
    ? favorites.find((f) => f.originalName === weather.locationName)
    : null;

  const handleFavoriteToggle = () => {
    if (!weather) return;
    if (favorited && favoriteItem) {
      removeFavorite(favoriteItem.id);
    } else {
      addFavorite({
        name: weather.locationName.split("-").pop() || weather.locationName,
        originalName: weather.locationName,
        coord: weather.coord,
      });
    }
  };

  const getBackgroundClass = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("clear")) return "from-blue-400 to-blue-600 text-white";
    if (lower.includes("cloud")) return "from-gray-400 to-gray-600 text-white";
    if (lower.includes("rain"))
      return "from-indigo-500 to-indigo-800 text-white";
    if (lower.includes("snow"))
      return "from-blue-100 to-blue-300 text-gray-800";
    return "from-primary to-primary-dark text-white";
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* 상단 네비게이션 */}
        <nav className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 rounded-xl px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="뒤로가기"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            뒤로
          </button>

          {weather && (
            <button
              onClick={handleFavoriteToggle}
              className={`rounded-xl px-4 py-2 transition-colors ${
                favorited
                  ? "bg-yellow-100 text-yellow-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              <StarIcon className={favorited ? "fill-current" : ""} />
            </button>
          )}
        </nav>

        {/* 로딩 */}
        {isWeatherLoading && <Loading type="card" count={2} />}

        {/* 에러 */}
        {!isWeatherLoading && weatherError && (
          <ErrorMessage
            message="날씨 정보를 불러올 수 없습니다."
            onRetry={() => refetchWeather()}
          />
        )}

        {/* 날씨 정보 */}
        {weather && (
          <>
            {/* 메인 날씨 카드 */}
            <Card
              className={`mb-6 overflow-hidden border-none bg-gradient-to-br p-8 ${getBackgroundClass(weather.description)}`}
            >
              <div className="text-center">
                <h1 className="text-2xl font-bold opacity-90">
                  {weather.locationName.split("-").pop()}
                </h1>
                <p className="mt-1 text-sm opacity-75">
                  {weather.locationName.split("-").slice(0, -1).join(" ")}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                  alt={weather.description}
                  className="mx-auto h-32 w-32 drop-shadow-lg"
                />
                <div className="text-6xl font-bold">
                  {Math.round(weather.temp)}°
                </div>
                <p className="mt-2 text-lg capitalize opacity-90">
                  {weather.description}
                </p>
                <div className="mt-3 flex justify-center gap-6 text-sm font-medium opacity-80">
                  <span>최고: {Math.round(weather.tempMax)}°</span>
                  <span>최저: {Math.round(weather.tempMin)}°</span>
                </div>
              </div>
            </Card>

            {/* 추가 정보 */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <InfoCard
                label="체감 온도"
                value={`${Math.round(weather.feelsLike)}°`}
              />
              <InfoCard label="습도" value={`${weather.humidity}%`} />
              <InfoCard label="풍속" value={`${weather.windSpeed} m/s`} />
              <InfoCard
                label="업데이트"
                value={new Intl.DateTimeFormat("ko-KR", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }).format(weather.dt * 1000)}
              />
            </div>

            {/* 시간별 예보 */}
            {isHourlyLoading && <Loading type="card" />}
            {hourlyData && <HourlyForecast items={hourlyData} />}
          </>
        )}
      </div>
    </main>
  );
};

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <Card className="p-4 text-center">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-lg font-bold text-gray-800">{value}</p>
  </Card>
);

export default WeatherDetailPage;
