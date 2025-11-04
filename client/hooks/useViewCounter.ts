import { useCallback, useState, useEffect } from "react";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export function useViewCounter(presentationId: string) {
  const [views, setViews] = useState<number>(0);

  const getStorageKey = (id: string) => `view_counter:${id}`;
  const getLastViewKey = (id: string) => `last_view:${id}`;

  useEffect(() => {
    // Load initial count from localStorage
    const key = getStorageKey(presentationId);
    const stored = localStorage.getItem(key);
    if (stored) {
      setViews(parseInt(stored, 10));
    }
  }, [presentationId]);

  const canIncrementView = useCallback(() => {
    const lastViewKey = getLastViewKey(presentationId);
    const lastView = localStorage.getItem(lastViewKey);
    
    if (!lastView) {
      return true; // First view
    }

    const lastViewTime = parseInt(lastView, 10);
    const now = Date.now();
    return now - lastViewTime >= THIRTY_MINUTES_MS;
  }, [presentationId]);

  const incrementView = useCallback(() => {
    if (!canIncrementView()) {
      return views;
    }

    const countKey = getStorageKey(presentationId);
    const lastViewKey = getLastViewKey(presentationId);
    const now = Date.now();

    const newCount = views + 1;
    localStorage.setItem(countKey, String(newCount));
    localStorage.setItem(lastViewKey, String(now));
    
    setViews(newCount);
    return newCount;
  }, [presentationId, views, canIncrementView]);

  return {
    views,
    canIncrementView,
    incrementView,
  };
}
