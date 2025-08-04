import { Button } from "@/components/ui/button";
import { CloudUpload, Check } from "lucide-react";
import { usePublish } from "@/contexts/PublishContext";
import { useAdmin } from "@/contexts/AdminContext";

interface PublishButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function PublishButton({
  variant = "default",
  size = "default",
  className = "",
}: PublishButtonProps) {
  const { isAdminMode } = useAdmin();
  const { hasUnpublishedChanges, publishChanges } = usePublish();

  // Only show in admin mode
  if (!isAdminMode) {
    return null;
  }

  return (
    <Button
      onClick={publishChanges}
      disabled={!hasUnpublishedChanges}
      variant={variant}
      size={size}
      className={`${
        hasUnpublishedChanges
          ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
          : "bg-gray-400 text-gray-600 cursor-not-allowed"
      } transition-all duration-300 ${className}`}
    >
      {hasUnpublishedChanges ? (
        <>
          <CloudUpload className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Publish Changes</span>
          <span className="sm:hidden">Publish</span>
        </>
      ) : (
        <>
          <Check className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Published</span>
          <span className="sm:hidden">✓</span>
        </>
      )}
    </Button>
  );
}
