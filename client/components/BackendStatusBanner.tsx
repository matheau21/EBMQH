import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { checkBackendAvailability } from "@/lib/api";

export function BackendStatusBanner() {
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const available = await checkBackendAvailability();
      setBackendStatus(available);
    } catch (error) {
      setBackendStatus(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't show banner if backend is available
  if (backendStatus === true) {
    return null;
  }

  // Don't show banner on first load while checking
  if (backendStatus === null && isChecking) {
    return null;
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800 flex items-center justify-between">
        <span>
          Backend API is not available. Using demo data and local storage.
          {backendStatus === false && " Admin features may be limited."}
        </span>
        <button
          onClick={checkStatus}
          disabled={isChecking}
          className="ml-4 p-1 hover:bg-orange-100 rounded"
          title="Retry connection"
        >
          <RefreshCw
            className={`h-4 w-4 text-orange-600 ${isChecking ? "animate-spin" : ""}`}
          />
        </button>
      </AlertDescription>
    </Alert>
  );
}
