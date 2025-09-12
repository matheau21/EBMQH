import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Presentation, Maximize2, Minimize2, X } from "lucide-react";
import { presentationsAPI } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  presentationId: string;
  title: string;
  fallbackPdfUrl?: string;
  fallbackPptUrl?: string;
}

export default function PresentationFilesViewer({ isOpen, onClose, presentationId, title, fallbackPdfUrl, fallbackPptUrl }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [pptUrl, setPptUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!isOpen) return;
      setLoading(true);
      setError(null);
      try {
        const res = await presentationsAPI.getFileUrls(presentationId);
        if (!ignore) {
          setPdfUrl(res.pdfUrl || fallbackPdfUrl);
          setPptUrl(res.pptUrl || fallbackPptUrl);
        }
      } catch (e: any) {
        if (!ignore) {
          setPdfUrl(fallbackPdfUrl);
          setPptUrl(fallbackPptUrl);
          setError(e?.message || "Failed to load files");
        }
      } finally {
        !ignore && setLoading(false);
      }
    };
    run();
    return () => { ignore = true; };
  }, [isOpen, presentationId, fallbackPdfUrl, fallbackPptUrl]);

  const pptEmbedUrl = useMemo(() => {
    if (!pptUrl) return undefined;
    if (pptUrl.startsWith("blob:")) return pptUrl;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptUrl)}`;
  }, [pptUrl]);

  const toggleFullscreen = () => setIsFullscreen((v) => !v);

  const hasPdf = !!pdfUrl;
  const hasPpt = !!pptUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? "w-screen h-screen max-w-screen max-h-screen rounded-none p-0" : "sm:max-w-6xl w-[96vw] h-[88vh] p-0"} overflow-hidden`}>
        <DialogHeader className={`bg-ucla-blue text-white px-6 py-4 flex flex-row items-center justify-between space-y-0 ${isFullscreen ? "rounded-none" : "rounded-t-lg"}`}>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Presentation className="h-5 w-5" />
            {title}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20 h-8 w-8">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-gray-100 relative">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-600">Loading…</div>
          ) : !hasPdf && !hasPpt ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Presentation className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <div className="font-medium">No files available</div>
                {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
              </div>
            </div>
          ) : (
            <div className={`grid gap-3 h-full ${hasPdf && hasPpt ? (isFullscreen ? "grid-cols-1 md:grid-cols-5" : "grid-cols-1 md:grid-cols-2") : "grid-cols-1"}`}>
              {hasPpt && (
                <div className={`flex flex-col h-full ${hasPdf && hasPpt && isFullscreen ? "md:col-span-3" : ""}`}>
                  <div className="px-4 py-1.5 bg-white border-b text-sm font-medium flex items-center gap-2"><Presentation className="h-4 w-4" /> Presentation</div>
                  {pptUrl!.startsWith("blob:") ? (
                    <div className="flex-1 flex items-center justify-center bg-white">
                      <div className="text-center text-gray-700">
                        <Presentation className="h-12 w-12 mx-auto mb-3 text-ucla-blue" />
                        <div className="mb-3">PowerPoint file detected. Open in a new tab to view.</div>
                        <Button onClick={() => window.open(pptUrl!, "_blank")}>Open Presentation</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-h-0">
                      <iframe src={pptEmbedUrl} className="w-full h-full bg-white" title={`${title} - Presentation`} allow="fullscreen" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
                    </div>
                  )}
                </div>
              )}
              {hasPdf && (
                <div className={`flex flex-col h-full ${hasPdf && hasPpt && isFullscreen ? "md:col-span-2" : ""}`}>
                  <div className="px-4 py-1.5 bg-white border-b text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> PDF</div>
                  <div className="flex-1 min-h-0">
                    <iframe src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`} className="w-full h-full bg-white" title={`${title} - PDF`} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {(hasPdf || hasPpt) && (
          <div className="bg-gray-50 px-6 py-3 border-t flex items-center justify-end gap-2">
            {hasPpt && (
              <Button variant="outline" size="sm" onClick={() => window.open(pptUrl!, "_blank")} className="text-ucla-blue border-ucla-blue hover:bg-blue-50">Open PPT</Button>
            )}
            {hasPdf && (
              <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl!, "_blank")} className="text-ucla-blue border-ucla-blue hover:bg-blue-50">Open PDF</Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
