import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface FileMatch {
  presentationId: string;
  presentationTitle: string;
  pdfFile?: string;
  pptFile?: string;
  existingPdfPath?: string;
  existingPptPath?: string;
}

interface PreviewResponse {
  totalPresentations: number;
  totalBucketFiles: number;
  matchedPresentations: number;
  matchesToUpdate: number;
  matches: FileMatch[];
  updates: FileMatch[];
}

interface ExecuteResponse {
  success: boolean;
  totalPresentations: number;
  successfulUpdates: number;
  failedUpdates: number;
  results: Array<{
    id: string;
    title: string;
    updated: boolean;
    changes: { pdf_path?: string; ppt_path?: string };
    error?: string;
  }>;
}

export default function AdminFileSyncPanel() {
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("authToken") || "";

  const handlePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      setPreview(null);
      setResult(null);

      const response = await fetch("/api/admin/sync-files/preview", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setPreview(data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch preview");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSync = async () => {
    try {
      setExecuting(true);
      setError(null);
      setResult(null);

      const response = await fetch("/api/admin/sync-files/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Failed to execute sync");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Sync Files from Bucket</h2>
          <p className="text-sm text-gray-600 mt-1">
            Automatically update presentation file paths based on files in your Supabase storage bucket.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handlePreview}
            disabled={loading || executing}
            variant="outline"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Preview Changes
          </Button>
          <Button
            onClick={handleExecuteSync}
            disabled={executing || loading || !preview || preview.matchesToUpdate === 0}
          >
            {executing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Execute Sync
          </Button>
        </div>
      </div>

      {/* Preview Results */}
      {preview && (
        <div className="border rounded-lg p-6 space-y-4 bg-blue-50">
          <h3 className="font-semibold text-blue-900">Preview Results</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded p-3">
              <div className="text-2xl font-bold text-gray-900">
                {preview.totalPresentations}
              </div>
              <div className="text-xs text-gray-600">Total Presentations</div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="text-2xl font-bold text-gray-900">
                {preview.totalBucketFiles}
              </div>
              <div className="text-xs text-gray-600">Bucket Files</div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="text-2xl font-bold text-gray-900">
                {preview.matchedPresentations}
              </div>
              <div className="text-xs text-gray-600">Matched</div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="text-2xl font-bold text-orange-600">
                {preview.matchesToUpdate}
              </div>
              <div className="text-xs text-gray-600">Need Update</div>
            </div>
          </div>

          {preview.updates.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Files to Update:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {preview.updates.map((update) => (
                  <div
                    key={update.presentationId}
                    className="bg-white rounded p-3 text-sm space-y-1"
                  >
                    <div className="font-medium">{update.presentationTitle}</div>
                    {update.pdfFile && (
                      <div className="text-xs text-gray-600">
                        📄 PDF: {update.pdfFile}
                      </div>
                    )}
                    {update.pptFile && (
                      <div className="text-xs text-gray-600">
                        🎯 PPT: {update.pptFile}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Execution Results */}
      {result && (
        <div className="border rounded-lg p-6 space-y-4 bg-green-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Sync Complete</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded p-3">
              <div className="text-2xl font-bold text-gray-900">
                {result.successfulUpdates}
              </div>
              <div className="text-xs text-gray-600">Successful</div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="text-2xl font-bold text-red-600">
                {result.failedUpdates}
              </div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="text-2xl font-bold text-gray-900">
                {result.totalPresentations}
              </div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>

          {result.results.filter((r) => r.updated).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-green-900">Updated:</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {result.results
                  .filter((r) => r.updated)
                  .map((r) => (
                    <div key={r.id} className="text-sm text-gray-700">
                      ✓ {r.title}
                      {r.changes.pdf_path && " (PDF)"}
                      {r.changes.ppt_path && " (PPT)"}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {result.results.filter((r) => r.error).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-900">Errors:</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {result.results
                  .filter((r) => r.error)
                  .map((r) => (
                    <div key={r.id} className="text-sm text-red-700">
                      ✗ {r.title}: {r.error}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
