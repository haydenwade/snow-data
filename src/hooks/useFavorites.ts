import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

const STORAGE_KEY = "snowd-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>(STORAGE_KEY, [], {
    initializeWithValue: false,
  });

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      );
    },
    [setFavorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, [setFavorites]);

  return { favorites, isFavorite, toggleFavorite, clearFavorites };
}
