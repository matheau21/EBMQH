import { useCallback, useState, useEffect } from "react";

const TWENTY_MINUTES_MS = 20 * 60 * 1000;

export function useViewCounter(presentationId: string, initialCount?: number) {
  const [views, setViews] = useState<number>(0);

  const getStorageKey = (id: string) => `view_counter:${id}`;
  const getLastViewKey = (id: string) => `last_view:${id}`;

  useEffect(() => {
    // Load initial count from localStorage for this specific presentation
    const key = getStorageKey(presentationId);
    const stored = localStorage.getItem(key);
    if (stored) {
      setViews(parseInt(stored, 10));
    } else if (initialCount !== undefined && initialCount > 0) {
      // Initialize with prop value if no localStorage entry exists
      setViews(initialCount);
      localStorage.setItem(key, String(initialCount));
    }
  }, [presentationId, initialCount]);

  const canIncrementView = useCallback(() => {
    const lastViewKey = getLastViewKey(presentationId);
    const lastView = localStorage.getItem(lastViewKey);

    if (!lastView) {
      return true; // First view for this trial
    }

    const lastViewTime = parseInt(lastView, 10);
    const now = Date.now();
    return now - lastViewTime >= TWENTY_MINUTES_MS;
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
    incrementView,
  };
}
