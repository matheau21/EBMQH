import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Maximize2, Minimize2, X, FileText, Presentation } from "lucide-react";

interface PresentationViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl?: string;
  type: "presentation" | "article";
}

export function PresentationViewer({
  isOpen,
  onClose,
  title,
  fileUrl,
  type,
}: PresentationViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getEmbedUrl = (url: string) => {
    if (type === "presentation") {
      // For PowerPoint files, we'll use Microsoft Office Online viewer
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    } else {
      // For PDF files, we'll use a PDF viewer
      return url; // Will be handled by browser's built-in PDF viewer
    }
  };

  const Icon = type === "presentation" ? Presentation : FileText;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          isFullscreen
            ? "w-screen h-screen max-w-screen max-h-screen rounded-none p-0"
            : "sm:max-w-4xl w-full h-[80vh] p-0"
        } overflow-hidden`}
      >
        {/* Header */}
        <DialogHeader
          className={`bg-ucla-blue text-white px-6 py-4 flex flex-row items-center justify-between space-y-0 ${
            isFullscreen ? "rounded-none" : "rounded-t-lg"
          }`}
        >
          <DialogTitle className="flex items-center gap-2 text-white">
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="text-white hover:bg-white/20 h-8 w-8"
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
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 bg-gray-100 relative">
          {fileUrl ? (
            <iframe
              src={type === "presentation" ? getEmbedUrl(fileUrl) : fileUrl}
              className="w-full h-full border-0"
              title={title}
              allow="fullscreen"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Icon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">
                  No File Available
                </h3>
                <p className="text-sm">
                  {type === "presentation"
                    ? "No presentation file has been uploaded for this trial."
                    : "No original article has been uploaded for this trial."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with file info */}
        {fileUrl && (
          <div className="bg-gray-50 px-6 py-3 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {type === "presentation"
                  ? "Presentation File"
                  : "Original Article"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, "_blank")}
                className="text-ucla-blue border-ucla-blue hover:bg-blue-50"
              >
                Open in New Tab
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
