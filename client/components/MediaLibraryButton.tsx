import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaLibrary } from "./MediaLibrary";
import { FolderOpen } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

interface MediaLibraryButtonProps {
  onSelectFile?: (file: any) => void;
  allowedTypes?: ('pdf' | 'image' | 'document')[];
  mode?: 'select' | 'manage';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function MediaLibraryButton({
  onSelectFile,
  allowedTypes = ['pdf', 'image', 'document'],
  mode = 'manage',
  variant = 'outline',
  size = 'default',
  className = '',
}: MediaLibraryButtonProps) {
  const { isAdminMode } = useAdmin();
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  if (!isAdminMode) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowMediaLibrary(true)}
        className={`${className}`}
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        Media Library
      </Button>

      <MediaLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelectFile={onSelectFile}
        allowedTypes={allowedTypes}
        mode={mode}
      />
    </>
  );
}
