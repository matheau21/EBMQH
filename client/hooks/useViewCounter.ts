import { useCallback, useState, useEffect } from "react";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const USER_ID_KEY = "ebm_user_id";

function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export function useViewCounter(presentationId: string, initialCount?: number) {
  const [views, setViews] = useState<number>(0);

  const getStorageKey = (id: string) => `view_counter:${id}`;
  const getLastViewKey = (id: string, userId: string) => `last_view:${id}:${userId}`;

  useEffect(() => {
    const key = getStorageKey(presentationId);
    const stored = localStorage.getItem(key);
    if (stored) {
      setViews(parseInt(stored, 10));
    } else if (initialCount !== undefined && initialCount > 0) {
      setViews(initialCount);
      localStorage.setItem(key, String(initialCount));
    }
  }, [presentationId, initialCount]);

  const canIncrementView = useCallback(() => {
    const userId = getUserId();
    const lastViewKey = getLastViewKey(presentationId, userId);
    const lastView = localStorage.getItem(lastViewKey);

    if (!lastView) {
      return true;
    }

    const lastViewTime = parseInt(lastView, 10);
    const now = Date.now();
    return now - lastViewTime >= THIRTY_MINUTES_MS;
  }, [presentationId]);

  const incrementView = useCallback(() => {
    if (!canIncrementView()) {
      return false;
    }

    const userId = getUserId();
    const countKey = getStorageKey(presentationId);
    const lastViewKey = getLastViewKey(presentationId, userId);
    const now = Date.now();

    const currentCount = localStorage.getItem(countKey);
    const newCount = (currentCount ? parseInt(currentCount, 10) : 0) + 1;

    localStorage.setItem(countKey, String(newCount));
    localStorage.setItem(lastViewKey, String(now));

    setViews(newCount);
    return true;
  }, [presentationId, canIncrementView]);

  return {
    views,
    incrementView,
  };
}
