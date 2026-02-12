import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Favorite, FavoriteStore } from "@shared/types/favorite.types";

const MAX_FAVORITES = 6;

export const useFavoriteStore = create<FavoriteStore>()(
  devtools(
    persist(
      (set, get) => ({
      favorites: [],

      addFavorite: (favorite) => {
        const { favorites } = get();
        if (favorites.length >= MAX_FAVORITES) return false;
        if (favorites.some((f) => f.originalName === favorite.originalName))
          return false;

        const newFavorite: Favorite = {
          ...favorite,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };

        set({ favorites: [...favorites, newFavorite] });
        return true;
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        }));
      },

      updateFavoriteName: (id, name) => {
        set((state) => ({
          favorites: state.favorites.map((f) =>
            f.id === id ? { ...f, name } : f,
          ),
        }));
      },

      isFavorite: (originalName) => {
        return get().favorites.some((f) => f.originalName === originalName);
      },
      }),
      {
        name: "weather-favorites",
      },
    ),
    { name: "FavoriteStore" },
  ),
);
