import type { Coordinates } from './location.types';

export interface Favorite {
  id: string;
  name: string; // 별칭 (사용자가 수정 가능)
  originalName: string; // 원래 지역명 ("서울특별시-종로구-청운동")
  coord: Coordinates;
  createdAt: number;
}

export interface FavoriteStore {
  favorites: Favorite[];
  addFavorite: (favorite: Omit<Favorite, 'id' | 'createdAt'>) => boolean;
  removeFavorite: (id: string) => void;
  updateFavoriteName: (id: string, name: string) => void;
  isFavorite: (originalName: string) => boolean;
}
