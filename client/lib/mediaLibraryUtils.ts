import { MediaFile } from "@/components/MediaLibrary";

export const addFileToMediaLibrary = (
  file: File,
  category: string = "Presentations",
  metadata?: { title?: string; description?: string }
): void => {
  try {
    // Get existing files from localStorage
    const savedFiles = localStorage.getItem("ebm-media-library");
    const existingFiles: MediaFile[] = savedFiles ? JSON.parse(savedFiles) : [];

    // Create new media file entry
    const newMediaFile: MediaFile = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: `${Date.now()}-${file.name}`,
      originalName: file.name,
      type: getFileType(file),
      url: URL.createObjectURL(file),
      size: file.size,
      uploadDate: new Date().toISOString(),
      category,
      tags: [category.toLowerCase(), "auto-uploaded"],
      metadata,
    };

    // Add to existing files and save
    const updatedFiles = [newMediaFile, ...existingFiles];
    localStorage.setItem("ebm-media-library", JSON.stringify(updatedFiles));

    console.log(`File "${file.name}" added to media library`);
  } catch (error) {
    console.error("Failed to add file to media library:", error);
  }
};

const getFileType = (file: File): "pdf" | "image" | "document" => {
  const mimeType = file.type.toLowerCase();
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  return "document";
};

export const addPresentationFilesToMediaLibrary = (
  presentationFile?: File | null,
  originalArticleFile?: File | null,
  title?: string
): void => {
  if (presentationFile) {
    addFileToMediaLibrary(
      presentationFile,
      "Presentations",
      {
        title: title ? `${title} - Presentation` : "Presentation",
        description: "Auto-uploaded presentation file",
      }
    );
  }

  if (originalArticleFile) {
    addFileToMediaLibrary(
      originalArticleFile,
      "Medical Articles",
      {
        title: title ? `${title} - Original Article` : "Original Article",
        description: "Auto-uploaded original article PDF",
      }
    );
  }
};
