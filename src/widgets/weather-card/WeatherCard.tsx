import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@shared/ui/card/Card";
import { StarIcon } from "@shared/ui/icons";
import { EditNameButton } from "@features/edit-favorite-name";
import { useFavoriteStore } from "@entities/favorite/model/store";
import type { WeatherData } from "@shared/types/weather.types";

interface WeatherCardProps {
  weather: WeatherData;
  originalName?: string;
  onFavoriteToggle?: () => void;
  hideEditButton?: boolean;
}

const WeatherCard = ({
  weather,
  originalName,
  onFavoriteToggle,
  hideEditButton,
}: WeatherCardProps) => {
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite, isFavorite } =
    useFavoriteStore();

  // 수정 모달이 열려있는지 여부 (카드 크기 고정용)
  const [isEditing, setIsEditing] = useState(false);

  const lookupName = originalName || weather.locationName;
  const favorited = isFavorite(lookupName);
  const favoriteItem = favorites.find((f) => f.originalName === lookupName);

  const handleCardClick = () => {
    // 수정 중일 때는 카드 클릭 방지
    if (isEditing) return;
    const name = originalName || weather.locationName;
    navigate(`/weather/${encodeURIComponent(name)}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorited && favoriteItem) {
      removeFavorite(favoriteItem.id);
    } else {
      addFavorite({
        name: weather.locationName.split("-").pop() || weather.locationName,
        originalName: weather.locationName,
        coord: weather.coord,
      });
    }
    onFavoriteToggle?.();
  };

  // 날씨 상태에 따른 배경색/그라데이션 (Rich Aesthetics)
  const getBackgroundStyles = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("clear"))
      return "bg-gradient-to-br from-blue-400 to-blue-600 text-white";
    if (lower.includes("cloud"))
      return "bg-gradient-to-br from-gray-400 to-gray-600 text-white";
    if (lower.includes("rain"))
      return "bg-gradient-to-br from-indigo-500 to-indigo-800 text-white";
    if (lower.includes("snow"))
      return "bg-gradient-to-br from-blue-100 to-blue-300 text-gray-800";
    return "bg-gradient-to-br from-primary to-primary-dark text-white";
  };

  // 수정 중일 때는 scale-105 고정, 아닐 때는 hover 동작
  const scaleClass = isEditing
    ? "scale-[1.02]"
    : "transition-all hover:scale-[1.02] active:scale-[0.98]";

  return (
    <Card
      onClick={handleCardClick}
      className={`relative cursor-pointer overflow-hidden border-none p-6 ${scaleClass} ${getBackgroundStyles(weather.description)}`}
    >
      <div className="flex justify-between items-start">
        <div>
          {originalName ? (
            <>
              <h3 className="text-lg font-semibold opacity-90">
                {weather.locationName}
              </h3>
              <p className="text-[11px] opacity-50">
                {originalName.split("-").join(" ")}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold opacity-90">
                {weather.locationName.split("-").pop()}
              </h3>
              <p className="text-xs opacity-75">
                {weather.locationName.split("-").slice(0, -1).join(" ")}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {favorited && favoriteItem && !hideEditButton && (
            <EditNameButton
              favoriteId={favoriteItem.id}
              initialName={favoriteItem.name}
              onOpen={() => setIsEditing(true)}
              onClose={() => setIsEditing(false)}
            />
          )}
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full transition-all ${
              favorited
                ? "bg-yellow-400 text-white shadow-lg"
                : "bg-white/20 text-white hover:bg-white/40"
            }`}
            aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          >
            <StarIcon className={favorited ? "fill-current" : ""} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-4xl font-bold">{Math.round(weather.temp)}°</div>
          <div className="mt-1 text-sm font-medium opacity-90 capitalize">
            {weather.description}
          </div>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          className="w-16 h-16 drop-shadow-lg"
        />
      </div>

      <div className="mt-6 flex gap-4 text-sm font-medium opacity-80">
        <span>최고: {Math.round(weather.tempMax)}°</span>
        <span>최저: {Math.round(weather.tempMin)}°</span>
      </div>
    </Card>
  );
};

export default WeatherCard;
