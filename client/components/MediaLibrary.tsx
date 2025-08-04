import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Calendar,
  Tag,
  Download,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  type: "pdf" | "image" | "document";
  url: string;
  size: number;
  uploadDate: string;
  category?: string;
  tags?: string[];
  metadata?: {
    title?: string;
    description?: string;
  };
}

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile?: (file: MediaFile) => void;
  allowedTypes?: ("pdf" | "image" | "document")[];
  mode?: "select" | "manage";
}

const categories = [
  "Medical Articles",
  "Presentations",
  "Guidelines",
  "Research Papers",
  "Training Materials",
  "Other",
].filter(
  (category): category is string =>
    typeof category === "string" && category.trim().length > 0,
); // Ensure no null/undefined values and all are valid strings

export function MediaLibrary({
  isOpen,
  onClose,
  onSelectFile,
  allowedTypes = ["pdf", "image", "document"],
  mode = "manage",
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");

  // Load files from localStorage on mount
  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem("ebm-media-library");
      if (savedFiles && savedFiles !== "undefined" && savedFiles !== "null") {
        const parsedFiles = JSON.parse(savedFiles);
        if (Array.isArray(parsedFiles)) {
          setFiles(parsedFiles);
        } else {
          console.warn("Invalid media library data format, resetting");
          setFiles([]);
        }
      }
    } catch (error) {
      console.error("Error loading media library:", error);
      setFiles([]);
    }
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.url.startsWith("blob:")) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [files]);

  // Save files to localStorage with error handling
  const saveFiles = (updatedFiles: MediaFile[]) => {
    try {
      setFiles(updatedFiles);
      localStorage.setItem("ebm-media-library", JSON.stringify(updatedFiles));
    } catch (error) {
      console.error("Failed to save files to localStorage:", error);
      // Keep state updated even if localStorage fails
      setFiles(updatedFiles);
    }
  };

  // Improved file type detection
  const getFileType = (file: File): "pdf" | "image" | "document" => {
    const mimeType = file.type.toLowerCase();
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("image/")) return "image";
    return "document";
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !uploadCategory) return;

    try {
      const fileType = getFileType(uploadFile);

      const newFile: MediaFile = {
        id: Date.now().toString(),
        filename: `${Date.now()}-${uploadFile.name}`,
        originalName: uploadFile.name,
        type: fileType,
        url: URL.createObjectURL(uploadFile),
        size: uploadFile.size,
        uploadDate: new Date().toISOString(),
        category: uploadCategory,
        tags: uploadTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        metadata: {
          title: uploadTitle || uploadFile.name,
          description: uploadDescription,
        },
      };

      saveFiles([...files, newFile]);

      // Reset upload form
      setUploadFile(null);
      setUploadCategory("");
      setUploadTitle("");
      setUploadDescription("");
      setUploadTags("");
      setShowUpload(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    }
  };

  const handleDeleteFile = (id: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      const fileToDelete = files.find((f) => f.id === id);
      if (fileToDelete?.url.startsWith("blob:")) {
        URL.revokeObjectURL(fileToDelete.url);
      }
      saveFiles(files.filter((f) => f.id !== id));
    }
  };

  const filteredFiles = useMemo(() => {
    return (files || []).filter((file) => {
      if (!file || !file.type) return false;

      const matchesCategory =
        !selectedCategory || file.category === selectedCategory;
      const matchesSearch =
        !searchTerm ||
        (file.originalName &&
          file.originalName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (file.metadata?.title &&
          file.metadata.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (file.metadata?.description &&
          file.metadata.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));
      const matchesType = allowedTypes && allowedTypes.includes(file.type);

      return matchesCategory && matchesSearch && matchesType;
    });
  }, [files, selectedCategory, searchTerm, allowedTypes]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "image":
        return <FileText className="h-8 w-8 text-blue-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <Dialog open={!!isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl w-[95vw] h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Media Library
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full p-6 pt-0">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={selectedCategory || ""}
              onValueChange={(value) => setSelectedCategory(value || "")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.filter(Boolean).map((category, index) => (
                  <SelectItem
                    key={`category-${index}-${category}`}
                    value={category}
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-ucla-blue hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>

          {/* File Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <Card
                  key={file.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm truncate">
                            {file.metadata?.title || file.originalName}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {formatFileSize(file.size)}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFile(file.id)}
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {file.metadata?.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {file.metadata.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </div>

                    {file.category && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {file.category}
                      </Badge>
                    )}

                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {file.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{file.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(file.url, "_blank")}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {mode === "select" && onSelectFile && (
                        <Button
                          size="sm"
                          onClick={() => {
                            onSelectFile(file);
                            onClose();
                          }}
                          className="flex-1 bg-ucla-blue hover:bg-blue-700"
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFiles.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No files found
                </h3>
                <p className="text-gray-600">
                  Upload your first file to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Dialog */}
        <Dialog open={!!showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>

              <div>
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Custom title for the file"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={uploadCategory || ""}
                  onValueChange={(value) => setUploadCategory(value || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(Boolean).map((category, index) => (
                      <SelectItem
                        key={`upload-category-${index}-${category}`}
                        value={category}
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief description"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (optional)</Label>
                <Input
                  id="tags"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUpload(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || !uploadCategory}
                  className="flex-1 bg-ucla-blue hover:bg-blue-700"
                >
                  Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
