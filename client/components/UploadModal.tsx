import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Image, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PresentationData) => void;
}

interface PresentationData {
  trialName: string;
  briefDescription: string;
  subspecialty: string;
  journalSource: string;
  file: File | null;
  originalArticle: File | null;
  thumbnail: File | null;
}

const subspecialties = [
  "Cardiology",
  "Heme/Onc",
  "Endocrinology",
  "General Internal Medicine",
  "Pulmonary/Critical Care",
  "Infectious Disease",
  "Rheumatology",
  "Nephrology",
  "Gastroenterology/Hepatology",
];

const journalSources = [
  "New England Journal of Medicine",
  "The Lancet",
  "JAMA",
  "Nature Medicine",
  "BMJ",
  "Circulation",
  "Journal of Clinical Oncology",
  "Annals of Internal Medicine",
  "The Lancet Oncology",
  "European Heart Journal",
  "Chest",
  "Critical Care Medicine",
  "Other",
];

export function UploadModal({ isOpen, onClose, onSubmit }: UploadModalProps) {
  const [formData, setFormData] = useState<PresentationData>({
    trialName: "",
    briefDescription: "",
    subspecialty: "",
    journalSource: "",
    file: null,
    originalArticle: null,
    thumbnail: null,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalArticleInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

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
    const validFile = files.find(file => 
      file.type === "application/pdf" || 
      file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      file.type === "application/vnd.ms-powerpoint"
    );

    if (validFile) {
      setFormData(prev => ({ ...prev, file: validFile }));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleOriginalArticleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFormData(prev => ({ ...prev, originalArticle: file }));
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trialName || !formData.briefDescription || !formData.subspecialty || !formData.journalSource) {
      return;
    }

    setIsLoading(true);

    try {
      // Save to localStorage for persistence
      const savedPresentations = JSON.parse(localStorage.getItem('ebm-presentations') || '[]');
      const newPresentation = {
        id: Date.now().toString(),
        title: formData.trialName,
        specialty: formData.subspecialty,
        summary: formData.briefDescription,
        journal: formData.journalSource,
        year: new Date().getFullYear().toString(),
        savedAt: new Date().toISOString(),
      };

      savedPresentations.push(newPresentation);
      localStorage.setItem('ebm-presentations', JSON.stringify(savedPresentations));

      // Simulate upload process
      setTimeout(() => {
        onSubmit(formData);
        setFormData({
          trialName: "",
          briefDescription: "",
          subspecialty: "",
          journalSource: "",
          file: null,
          originalArticle: null,
          thumbnail: null,
        });
        setIsLoading(false);
        onClose();

        // Show success message
        console.log('Presentation saved successfully!');
      }, 2000);
    } catch (error) {
      console.error('Error saving presentation:', error);
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeOriginalArticle = () => {
    setFormData(prev => ({ ...prev, originalArticle: null }));
    if (originalArticleInputRef.current) {
      originalArticleInputRef.current.value = "";
    }
  };

  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: null }));
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleSaveDraft = () => {
    if (!formData.trialName) {
      console.log('Trial name is required to save draft');
      return;
    }

    try {
      const drafts = JSON.parse(localStorage.getItem('ebm-drafts') || '[]');
      const draftData = {
        id: Date.now().toString(),
        ...formData,
        savedAt: new Date().toISOString(),
        isDraft: true,
      };

      drafts.push(draftData);
      localStorage.setItem('ebm-drafts', JSON.stringify(drafts));

      console.log('Draft saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-olive-800">
            <Upload className="h-5 w-5" />
            Upload New Presentation
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trial Name */}
          <div className="space-y-2">
            <Label htmlFor="trialName" className="text-sm font-medium">
              Trial Name *
            </Label>
            <Input
              id="trialName"
              value={formData.trialName}
              onChange={(e) => setFormData(prev => ({ ...prev, trialName: e.target.value }))}
              placeholder="e.g., SPRINT Trial: Intensive vs Standard Blood Pressure Control"
              required
              className="focus:border-olive-500 focus:ring-olive-500"
            />
          </div>

          {/* Brief Description */}
          <div className="space-y-2">
            <Label htmlFor="briefDescription" className="text-sm font-medium">
              Brief Description *
            </Label>
            <Textarea
              id="briefDescription"
              value={formData.briefDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, briefDescription: e.target.value }))}
              placeholder="Provide a concise summary of the trial's key findings and clinical significance..."
              rows={4}
              required
              className="focus:border-olive-500 focus:ring-olive-500"
            />
          </div>

          {/* Subspecialty */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Subspecialty *
            </Label>
            <Select
              value={formData.subspecialty}
              onValueChange={(value) => setFormData(prev => ({ ...prev, subspecialty: value }))}
              required
            >
              <SelectTrigger className="focus:border-olive-500 focus:ring-olive-500">
                <SelectValue placeholder="Select a medical subspecialty" />
              </SelectTrigger>
              <SelectContent>
                {subspecialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Journal Source */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Journal Source *
            </Label>
            <Select
              value={formData.journalSource}
              onValueChange={(value) => setFormData(prev => ({ ...prev, journalSource: value }))}
              required
            >
              <SelectTrigger className="focus:border-olive-500 focus:ring-olive-500">
                <SelectValue placeholder="Select the journal source" />
              </SelectTrigger>
              <SelectContent>
                {journalSources.map((journal) => (
                  <SelectItem key={journal} value={journal}>
                    {journal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Presentation File (PDF/PPTX)
            </Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                isDragOver 
                  ? "border-olive-500 bg-olive-50" 
                  : "border-gray-300 hover:border-olive-400",
                formData.file && "border-green-500 bg-green-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-green-800">{formData.file.name}</p>
                      <p className="text-sm text-green-600">
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
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your presentation file here, or
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-olive-500 text-olive-600 hover:bg-olive-50"
                  >
                    Choose File
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports PDF and PowerPoint files (max 50MB)
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Original Article PDF */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Original Article PDF
            </Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => originalArticleInputRef.current?.click()}
                className="border-ucla-blue text-ucla-blue hover:bg-blue-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                Choose Article PDF
              </Button>
              {formData.originalArticle && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">{formData.originalArticle.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeOriginalArticle}
                    className="h-6 w-6 text-gray-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <input
              ref={originalArticleInputRef}
              type="file"
              accept=".pdf"
              onChange={handleOriginalArticleSelect}
              className="hidden"
            />
          </div>

          {/* Optional Thumbnail */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Thumbnail Image (Optional)
            </Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-ucla-blue text-ucla-blue hover:bg-blue-50"
              >
                <Image className="h-4 w-4 mr-2" />
                Choose Thumbnail
              </Button>
              {formData.thumbnail && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">{formData.thumbnail.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeThumbnail}
                    className="h-6 w-6 text-gray-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSaveDraft()}
              disabled={isLoading || !formData.trialName}
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Save Draft
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-ucla-blue hover:bg-blue-700"
                disabled={isLoading || !formData.trialName || !formData.briefDescription || !formData.subspecialty || !formData.journalSource}
              >
                {isLoading ? "Uploading..." : "Upload Presentation"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
