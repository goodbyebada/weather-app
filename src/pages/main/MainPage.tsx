import { useEffect } from "react";
import { SearchBar } from "@widgets/search-bar";
import { WeatherCard } from "@widgets/weather-card";
import { FavoritesList } from "@widgets/favorites-list";
import { Loading, ErrorMessage, LocationIcon } from "@shared/ui";
import { useAppLocation } from "@shared/lib/hooks/useAppLocation";
import { DEFAULT_LOCATION_QUERY } from "@shared/constants/location";
import { toast } from "@shared/ui/toast";
import { useWeatherQuery } from "@entities/weather/api/queries";
import { mapWeatherResponseToData } from "@entities/weather/lib/weatherMapper";
import { useReverseGeocodeQuery } from "@entities/location/api/queries";

const MainPage = () => {
  const {
    coordinates,
    isLoading: isLocating,
    error: locationError,
    isDefaultLocation,
  } = useAppLocation();

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

  const { data: reverseGeocodeName } = useReverseGeocodeQuery(
    coordinates?.lat ?? 0,
    coordinates?.lon ?? 0,
    !!coordinates,
  );

  const isLoading = isLocating || isWeatherLoading;

  useEffect(() => {
    if (isDefaultLocation) {
      toast.info("위치 권한을 확인할 수 없어 기본 지역을 표시합니다.");
    }
  }, [isDefaultLocation]);

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
            {isDefaultLocation && (
              <span className="text-sm text-gray-400">
                (기본: {DEFAULT_LOCATION_QUERY})
              </span>
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

          {!isLoading && weatherResponse && reverseGeocodeName && (
            <div className="max-w-sm">
              <WeatherCard
                weather={mapWeatherResponseToData(
                  weatherResponse,
                  reverseGeocodeName,
                )}
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
