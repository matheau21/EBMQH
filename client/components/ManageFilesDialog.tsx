import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FileDropzone from "./FileDropzone";
import { presentationsAPI } from "@/lib/api";
import PresentationFilesViewer from "@/components/PresentationFilesViewer";

interface Props {
  presentationId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function middleEllipsis(path: string, max = 48) {
  if (!path) return "";
  if (path.length <= max) return path;
  const keep = Math.max(8, Math.floor((max - 1) / 2));
  return `${path.slice(0, keep)}…${path.slice(-keep)}`;
}

export default function ManageFilesDialog({ presentationId, open, onOpenChange }: Props) {
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [pptPath, setPptPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        if (!open) return;
        const res = await presentationsAPI.adminGet(presentationId);
        if (!ignore) {
          setPdfPath(res.presentation?.pdf_path || null);
          setPptPath(res.presentation?.ppt_path || null);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load files");
      }
    };
    load();
    return () => { ignore = true; };
  }, [presentationId, open]);

  const hasAny = !!pdfPath || !!pptPath;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="font-medium mb-2">PDF</div>
            {pdfPath ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 font-mono inline-block max-w-[60%] align-middle" title={pdfPath || undefined}>{middleEllipsis(pdfPath || "", 48)}</span>
                <Button variant="outline" size="sm" onClick={()=>setViewerOpen(true)}>View</Button>
                <Button variant="outline" size="sm" onClick={async ()=>{
                  try { await presentationsAPI.deleteFile(presentationId, "pdf"); setPdfPath(null);} catch(e:any){ setError(e?.message||"Failed to remove PDF"); }
                }}>Remove</Button>
              </div>
            ) : (
              <FileDropzone accept={["pdf"]} onFile={async (f) => {
                try {
                  const res = await presentationsAPI.uploadFile(presentationId, f);
                  setPdfPath(res.path);
                } catch (e: any) {
                  setError(e?.message || "Failed to upload PDF");
                }
              }} />
            )}
          </div>

          <div>
            <div className="font-medium mb-2">PPT/PPTX</div>
            {pptPath ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700 font-mono inline-block max-w-[60%] align-middle" title={pptPath || undefined}>{middleEllipsis(pptPath || "", 48)}</span>
                <Button variant="outline" size="sm" onClick={()=>setViewerOpen(true)}>View</Button>
                <Button variant="outline" size="sm" onClick={async ()=>{
                  try { await presentationsAPI.deleteFile(presentationId, "ppt"); setPptPath(null);} catch(e:any){ setError(e?.message||"Failed to remove PPT"); }
                }}>Remove</Button>
              </div>
            ) : (
              <FileDropzone accept={["ppt","pptx"]} onFile={async (f) => {
                try {
                  const res = await presentationsAPI.uploadFile(presentationId, f);
                  setPptPath(res.path);
                } catch (e: any) {
                  setError(e?.message || "Failed to upload PPT/PPTX");
                }
              }} />
            )}
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div />
          <div className="flex items-center gap-2">
            {hasAny && (
              <Button onClick={()=>setViewerOpen(true)} className="bg-ucla-blue text-white">View Files</Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogFooter>

        <PresentationFilesViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          presentationId={presentationId}
          title="Files"
        />
      </DialogContent>
    </Dialog>
  );
}
