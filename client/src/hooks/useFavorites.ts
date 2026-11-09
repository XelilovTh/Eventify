import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'eventify_favs';
const SYNC_EVENT = 'eventify_favs_updated';

const getStoredFavorites = (): number[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>(getStoredFavorites);

  useEffect(() => {
    const handleUpdate = () => {
      setFavorites(getStoredFavorites());
    };

    window.addEventListener(SYNC_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(SYNC_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const saveFavorites = useCallback((newFavs: number[]) => {
    setFavorites(newFavs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs));
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(SYNC_EVENT));
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (id: number) => {
      const current = getStoredFavorites();
      const updated = current.includes(id)
        ? current.filter((favId) => favId !== id)
        : [...current, id];
      saveFavorites(updated);
    },
    [saveFavorites]
  );

  const removeFavorite = useCallback(
    (id: number) => {
      const current = getStoredFavorites();
      const updated = current.filter((favId) => favId !== id);
      saveFavorites(updated);
    },
    [saveFavorites]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    favoritesCount: favorites.length,
  };
};
