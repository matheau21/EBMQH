import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FileDropzone from "./FileDropzone";
import { presentationsAPI } from "@/lib/api";

interface Props {
  presentationId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function ManageFilesDialog({ presentationId, open, onOpenChange }: Props) {
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [pptPath, setPptPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="font-medium mb-2">PDF</div>
            <FileDropzone accept={["pdf"]} onFile={async (f) => {
              try {
                const res = await presentationsAPI.uploadFile(presentationId, f);
                setPdfPath(res.path);
              } catch (e: any) {
                setError(e?.message || "Failed to upload PDF");
              }
            }} />
            {pdfPath && <div className="text-xs text-green-600 mt-1">Uploaded: {pdfPath}</div>}
          </div>

          <div>
            <div className="font-medium mb-2">PPT/PPTX</div>
            <FileDropzone accept={["ppt","pptx"]} onFile={async (f) => {
              try {
                const res = await presentationsAPI.uploadFile(presentationId, f);
                setPptPath(res.path);
              } catch (e: any) {
                setError(e?.message || "Failed to upload PPT/PPTX");
              }
            }} />
            {pptPath && <div className="text-xs text-green-600 mt-1">Uploaded: {pptPath}</div>}
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
