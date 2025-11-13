import { useCallback, useState, useEffect } from "react";

const TWENTY_MINUTES_MS = 20 * 60 * 1000;
const GLOBAL_VIEW_COUNT_KEY = "ebm_global_view_count";
const GLOBAL_LAST_VIEW_KEY = "ebm_global_last_view_timestamp";

export function useViewCounter(presentationId: string, initialCount?: number) {
  const [views, setViews] = useState<number>(0);

  useEffect(() => {
    // Load global count from localStorage
    const storedCount = localStorage.getItem(GLOBAL_VIEW_COUNT_KEY);
    if (storedCount) {
      setViews(parseInt(storedCount, 10));
    } else if (initialCount !== undefined && initialCount > 0) {
      // Initialize with prop value if no localStorage entry exists
      setViews(initialCount);
      localStorage.setItem(GLOBAL_VIEW_COUNT_KEY, String(initialCount));
    } else {
      // Start at 0 if neither stored nor prop provided
      setViews(0);
      localStorage.setItem(GLOBAL_VIEW_COUNT_KEY, "0");
    }
  }, [initialCount]);

  const canIncrementGlobalView = useCallback(() => {
    const lastViewTimestamp = localStorage.getItem(GLOBAL_LAST_VIEW_KEY);

    if (!lastViewTimestamp) {
      return true; // First view ever
    }

    const lastViewTime = parseInt(lastViewTimestamp, 10);
    const now = Date.now();
    return now - lastViewTime >= TWENTY_MINUTES_MS;
  }, []);

  const incrementView = useCallback(() => {
    if (!canIncrementGlobalView()) {
      return views;
    }

    const now = Date.now();
    const newCount = views + 1;

    localStorage.setItem(GLOBAL_VIEW_COUNT_KEY, String(newCount));
    localStorage.setItem(GLOBAL_LAST_VIEW_KEY, String(now));

    setViews(newCount);
    return newCount;
  }, [views, canIncrementGlobalView]);

  return {
    views,
    incrementView,
  };
}
