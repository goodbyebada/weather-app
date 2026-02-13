import { useFavoriteStore } from "@entities/favorite/model/store";
import { useFavoritesWeatherQuery } from "@entities/weather/api/queries";
import { mapWeatherResponseToData } from "@entities/weather/lib/weatherMapper";
import { WeatherCard } from "@widgets/weather-card";
import Loading from "@shared/ui/loading/Loading";

const FavoritesList = () => {
  const { favorites } = useFavoriteStore();

  // 즐겨찾기 목록의 좌표들만 추출
  const locations = favorites.map((f) => ({
    lat: f.coord.lat,
    lon: f.coord.lon,
  }));

  const weatherQueries = useFavoritesWeatherQuery(locations);

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <div className="text-4xl mb-4">⭐</div>
        <h3 className="text-xl font-bold text-gray-700">
          즐겨찾기가 비어있습니다
        </h3>
        <p className="mt-2 text-gray-500">
          날씨를 자주 확인하고 싶은 지역을
          <br />
          검색하여 즐겨찾기에 추가해보세요.
        </p>
      </div>
    );
  }

  const isLoading = weatherQueries.some((q) => q.isLoading);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((favorite, index) => {
        const query = weatherQueries[index];

        if (isLoading || !query.data) {
          return <Loading key={favorite.id} type="card" />;
        }

        const weatherData = mapWeatherResponseToData(
          query.data,
          favorite.originalName,
        );

        // 사용자가 설정한 별칭이 있으면 그것을 사용
        const displayData = {
          ...weatherData,
          locationName: favorite.name, // 별칭 적용
        };

        return <WeatherCard key={favorite.id} weather={displayData} />;
      })}
    </div>
  );
};

export default FavoritesList;
