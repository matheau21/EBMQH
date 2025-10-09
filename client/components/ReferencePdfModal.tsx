import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Maximize2, Minimize2, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export default function ReferencePdfModal({
  isOpen,
  onClose,
  url,
  title = "EBM Reference Card",
}: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const iframeSrc = useMemo(() => {
    try {
      const u = new URL(url, window.location.origin);
      if (u.protocol === "http:" || u.protocol === "https:") {
        return `/api/presentations/proxy-pdf?src=${encodeURIComponent(u.toString())}`;
      }
      return url;
    } catch {
      return url;
    }
  }, [url]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${isFullscreen ? "w-screen h-screen max-w-screen max-h-screen rounded-none p-0" : "sm:max-w-5xl w-[96vw] h-[85vh] p-0"} overflow-hidden flex flex-col gap-0`}
      >
        <DialogHeader
          className={`bg-ucla-blue text-white dark:bg-card dark:text-foreground ${isFullscreen ? "px-2 py-2" : "px-3 py-2"} flex flex-row items-center justify-between space-y-0 ${isFullscreen ? "rounded-none" : "rounded-t-lg"}`}
        >
          <DialogTitle className="flex items-center gap-2 text-white dark:text-foreground">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen((v) => !v)}
              className="h-8 w-8 text-white hover:bg-white/20 dark:text-foreground dark:hover:bg-accent"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-white hover:bg-white/20 dark:text-foreground dark:hover:bg-accent"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 bg-background">
          <iframe
            src={`${iframeSrc}#toolbar=1&navpanes=0&scrollbar=1`}
            title={title}
            className="w-full h-full"
          />
        </div>

        <div className="bg-muted px-3 py-2 border-t border-border flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(url, "_blank")}
          >
            Open PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
