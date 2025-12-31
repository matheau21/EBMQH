import { useCallback, useState, useEffect } from "react";
import { presentationsAPI } from "@/lib/api";

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
  const [views, setViews] = useState<number>(initialCount || 0);

  const getLastViewKey = (id: string, userId: string) => `last_view:${id}:${userId}`;

  useEffect(() => {
    if (initialCount !== undefined && initialCount > 0) {
      setViews(initialCount);
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

  const incrementView = useCallback(async () => {
    if (!canIncrementView()) {
      return false;
    }

    try {
      const userId = getUserId();
      const lastViewKey = getLastViewKey(presentationId, userId);
      const now = Date.now();

      // Call backend to increment view count
      const response = await presentationsAPI.incrementViewCount(presentationId);

      // Update local state with the response from backend
      if (response.viewerCount !== undefined) {
        setViews(response.viewerCount);
      }

      // Record this user's view timestamp for the 30-minute lockout
      localStorage.setItem(lastViewKey, String(now));

      return true;
    } catch (error) {
      console.error("Error incrementing view count:", error);
      return false;
    }
  }, [presentationId, canIncrementView]);

  return {
    views,
    incrementView,
  };
}
