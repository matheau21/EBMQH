import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, CheckCircle, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedUploadProps {
  onUpload: (data: FeaturedPresentationData) => void;
}

interface FeaturedPresentationData {
  title: string;
  description: string;
  presenter: string;
  file: File | null;
}

export function FeaturedUpload({ onUpload }: FeaturedUploadProps) {
  const [formData, setFormData] = useState<FeaturedPresentationData>({
    title: "",
    description: "",
    presenter: "",
    file: null,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(
      (file) =>
        file.type ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        file.type === "application/vnd.ms-powerpoint",
    );

    if (validFile) {
      setFormData((prev) => ({ ...prev, file: validFile }));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.presenter ||
      !formData.file
    ) {
      return;
    }

    setIsLoading(true);

    // Submit immediately
    onUpload(formData);
    setFormData({
      title: "",
      description: "",
      presenter: "",
      file: null,
    });
    setIsLoading(false);
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-ucla-gold/5 border-2 border-ucla-gold/20 rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-ucla-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-ucla-blue" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Submit Featured Presentation
        </h3>
        <p className="text-gray-600">
          Share your landmark trial presentation with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Presentation Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., SPRINT Trial: Intensive Blood Pressure Control"
              required
              className="focus:border-ucla-blue focus:ring-ucla-blue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="presenter" className="text-sm font-medium">
              Presenter Name *
            </Label>
            <Input
              id="presenter"
              value={formData.presenter}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, presenter: e.target.value }))
              }
              placeholder="Dr. John Smith"
              required
              className="focus:border-ucla-blue focus:ring-ucla-blue"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Brief Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Provide a concise summary of the trial's key findings and clinical significance..."
            rows={3}
            required
            className="focus:border-ucla-blue focus:ring-ucla-blue"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            PowerPoint File (PPTX) *
          </Label>
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
              isDragOver
                ? "border-ucla-blue bg-blue-50"
                : "border-gray-300 hover:border-ucla-blue hover:bg-gray-50",
              formData.file && "border-ucla-gold bg-ucla-gold/5",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {formData.file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-ucla-gold/20 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-ucla-blue" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {formData.file.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag and drop your PowerPoint file here
                </p>
                <p className="text-gray-500 mb-4">or</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-ucla-blue text-ucla-blue hover:bg-blue-50"
                >
                  Choose PPTX File
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  Supports PowerPoint files (max 50MB)
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.ppt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            disabled={
              isLoading ||
              !formData.title ||
              !formData.description ||
              !formData.presenter ||
              !formData.file
            }
            className="bg-ucla-blue hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium"
          >
            {isLoading ? "Uploading..." : "Submit Presentation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
