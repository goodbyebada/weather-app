import { useEffect } from "react";
import { SEO } from "@shared/ui/SEO/SEO";
import { useParams, useNavigate } from "react-router-dom";
import { HourlyForecast } from "@widgets/hourly-forecast";
import { Loading, ErrorMessage, StarIcon, Card } from "@shared/ui";
import {
  useWeatherQuery,
  useHourlyForecastQuery,
} from "@entities/weather/api/queries";
import { mapWeatherResponseToData } from "@entities/weather/lib/weatherMapper";
import { useFavoriteStore } from "@entities/favorite/model/store";
import {
  useGeocodeQuery,
  useReverseGeocodeQuery,
} from "@entities/location/api/queries";
import { parseDistrict } from "@entities/location/lib/searchDistricts";

const WeatherDetailPage = () => {
  const { districtName } = useParams<{ districtName: string }>();
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite, isFavorite } =
    useFavoriteStore();

  const decodedName = districtName ? decodeURIComponent(districtName) : "";
  const district = decodedName ? parseDistrict(decodedName) : null;
  const fullAddress = district
    ? `${district.city} ${district.district || ""} ${district.dong || ""}`.trim()
    : "";

  const { data: coords, isLoading: isCoordsLoading } = useGeocodeQuery(
    fullAddress,
    !!fullAddress,
  );

  const { data: officialName, isLoading: isOfficialNameLoading } =
    useReverseGeocodeQuery(coords?.lat ?? 0, coords?.lon ?? 0, !!coords);

  // URL의 지명이 공식 지명과 다를 경우 URL 업데이트 (보정)
  useEffect(() => {
    if (officialName && officialName !== decodedName) {
      console.log(`[상세] 주소 보정 시도: ${decodedName} -> ${officialName}`);
      navigate(`/weather/${encodeURIComponent(officialName)}`, {
        replace: true,
      });
    }
  }, [officialName, decodedName, navigate]);

  const {
    data: weatherResponse,
    isLoading: isWeatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useWeatherQuery(coords?.lat ?? 0, coords?.lon ?? 0, !!coords);

  const { data: hourlyData } = useHourlyForecastQuery(
    coords?.lat ?? 0,
    coords?.lon ?? 0,
    !!coords,
  );

  const isLoading =
    isCoordsLoading || isWeatherLoading || isOfficialNameLoading;
  const isNotFound = !isCoordsLoading && coords === null;

  const displayLocationName = officialName || decodedName;

  const weather =
    weatherResponse && displayLocationName
      ? mapWeatherResponseToData(weatherResponse, displayLocationName)
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
      <SEO
        title={`${displayLocationName || "지역 날씨"} 날씨`}
        description={`${displayLocationName}의 상세 날씨 정보를 확인하세요.`}
      />
      {/* 고정 헤더 - 항상 표시 */}
      <header className="sticky top-0 z-header border-b border-gray-100 bg-gray-50/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <nav className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
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
              <span className="font-medium">뒤로</span>
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
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* 지역을 찾을 수 없는 경우 */}
        {!decodedName || isNotFound ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ErrorMessage
              message={
                isNotFound
                  ? "해당 지역의 위치 정보를 찾을 수 없습니다. 주소를 정확히 입력하셨는지 확인해주세요."
                  : "잘못된 지역입니다."
              }
            />
            <button
              onClick={() => navigate("/")}
              className="mt-6 rounded-xl bg-primary px-6 py-2.5 font-medium text-white shadow-lg transition-all hover:bg-primary-dark active:scale-95"
            >
              홈으로 돌아가기
            </button>
          </div>
        ) : (
          <>
            {/* 로딩 */}
            {isLoading && (
              <>
                <Loading type="weather-main" />
                <Loading type="info-grid" />
                <Loading type="hourly" />
              </>
            )}

            {/* 에러 */}
            {!isLoading && weatherError && (
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
                {hourlyData && <HourlyForecast items={hourlyData} />}
              </>
            )}
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
