// Installs a global handler to ignore benign AbortError rejections that occur
// when fetch or other async tasks are intentionally cancelled (route changes, timeouts)
if (typeof window !== "undefined") {
  const onUnhandled = (e: PromiseRejectionEvent) => {
    const reason: any = e.reason;
    const name = reason?.name || "";
    const msg = String(reason?.message || reason || "").toLowerCase();
    const isAbort = name === "AbortError" || msg.includes("abort");
    const isFailedToFetch = reason instanceof TypeError && msg.includes("failed to fetch");
    if (isAbort || isFailedToFetch) {
      e.preventDefault();
    }
  };
  window.addEventListener("unhandledrejection", onUnhandled);
}
