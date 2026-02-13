import { SearchBar } from "@widgets/search-bar";
import { WeatherCard } from "@widgets/weather-card";
import { FavoritesList } from "@widgets/favorites-list";
import { Loading, ErrorMessage, LocationIcon } from "@shared/ui";
import { useGeolocation } from "@shared/lib/hooks/useGeolocation";
import { useWeatherQuery } from "@entities/weather/api/queries";
import { mapWeatherResponseToData } from "@entities/weather/lib/weatherMapper";

const MainPage = () => {
  const {
    coordinates,
    isLoading: isLocating,
    error: locationError,
    isPermissionDenied,
  } = useGeolocation();

  const {
    data: weatherResponse,
    isLoading: isWeatherLoading,
    error: weatherError,
    refetch,
  } = useWeatherQuery(
    coordinates?.lat ?? 0,
    coordinates?.lon ?? 0,
    !!coordinates,
  );

  const isLoading = isLocating || isWeatherLoading;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* 검색바 */}
        <section aria-label="지역 검색" className="mb-10">
          <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
            날씨
          </h1>
          <SearchBar />
        </section>

        {/* 현재 위치 날씨 */}
        <section aria-label="현재 위치 날씨" className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <LocationIcon className="text-primary" />
            <h2 className="text-xl font-bold text-gray-800">현재 위치</h2>
            {isPermissionDenied && (
              <span className="text-sm text-gray-400">(기본: 서울)</span>
            )}
          </div>

          {locationError && (
            <p className="mb-3 text-sm text-gray-500">{locationError}</p>
          )}

          {isLoading && <Loading type="card" />}

          {!isLoading && weatherError && (
            <ErrorMessage
              message="날씨 정보를 불러올 수 없습니다."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && weatherResponse && (
            <div className="max-w-sm">
              <WeatherCard
                weather={mapWeatherResponseToData(weatherResponse)}
              />
            </div>
          )}
        </section>

        {/* 즐겨찾기 */}
        <section aria-label="즐겨찾기 목록">
          <h2 className="mb-4 text-xl font-bold text-gray-800">즐겨찾기</h2>
          <FavoritesList />
        </section>
      </div>
    </main>
  );
};

export default MainPage;
