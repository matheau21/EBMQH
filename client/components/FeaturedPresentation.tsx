import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Presentation, Calendar, Upload } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeaturedUpload } from "./FeaturedUpload";

interface FeaturedPresentationData {
  title: string;
  description: string;
  presenter: string;
  file: File | null;
  originalArticleFile?: File | null;
  uploadedAt?: string;
  fileUrl?: string; // For presentations set from existing cards
  originalArticleUrl?: string; // For original articles
}

export function FeaturedPresentation() {
  const { isAdminMode } = useAdmin();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [featuredPresentation, setFeaturedPresentation] =
    useState<FeaturedPresentationData | null>(() => {
      const saved = localStorage.getItem("ebm-featured-presentation");
      return saved ? JSON.parse(saved) : null;
    });

  const handleFeaturedClick = () => {
    if (featuredPresentation?.file) {
      const url = URL.createObjectURL(featuredPresentation.file);
      window.open(url, "_blank");
    } else if (featuredPresentation?.fileUrl) {
      window.open(featuredPresentation.fileUrl, "_blank");
    } else {
      alert("No featured presentation available");
    }
  };

  const handleOriginalArticleClick = () => {
    if (featuredPresentation?.originalArticleFile) {
      const url = URL.createObjectURL(featuredPresentation.originalArticleFile);
      window.open(url, "_blank");
    } else if (featuredPresentation?.originalArticleUrl) {
      window.open(featuredPresentation.originalArticleUrl, "_blank");
    } else {
      alert("No original article available");
    }
  };

  const handleUploadFeatured = () => {
    setShowUploadModal(true);
  };

  const handleFeaturedUpload = (data: FeaturedPresentationData) => {
    const presentationWithDate = {
      ...data,
      uploadedAt: new Date().toISOString(),
    };

    // Save to localStorage for persistence
    localStorage.setItem(
      "ebm-featured-presentation",
      JSON.stringify(presentationWithDate),
    );
    setFeaturedPresentation(presentationWithDate);
    setShowUploadModal(false);

    console.log("Featured presentation uploaded:", presentationWithDate);
  };

  return (
    <div className="bg-gradient-to-br from-white to-ucla-gold/5 border-2 border-ucla-gold/20 rounded-2xl p-6 sm:p-8 shadow-lg">
      <div className="text-center">
        <div className="w-16 h-16 bg-ucla-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Presentation className="h-8 w-8 text-ucla-blue" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {featuredPresentation
            ? featuredPresentation.title
            : "Featured Presentation"}
        </h3>

        <div className="flex items-center justify-center mb-4 text-ucla-blue">
          <Calendar className="h-4 w-4 mr-2" />
          <p className="text-sm font-medium">
            {featuredPresentation
              ? `Presented by ${featuredPresentation.presenter} - ${new Date(featuredPresentation.uploadedAt || "").toLocaleDateString()}`
              : "Recently Presented in Noon Conference at Olive View Medical Center"}
          </p>
        </div>

        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {featuredPresentation
            ? featuredPresentation.description
            : "Access the latest landmark trial presentation from our noon conference"}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button
            onClick={handleFeaturedClick}
            disabled={
              !featuredPresentation ||
              (!featuredPresentation.file && !featuredPresentation.fileUrl)
            }
            className="bg-ucla-blue hover:bg-blue-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-medium border-2 border-ucla-gold/20 hover:border-ucla-gold/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            {featuredPresentation &&
            (featuredPresentation.file || featuredPresentation.fileUrl)
              ? "View Featured Presentation"
              : "No Presentation Available"}
          </Button>

          <Button
            onClick={handleOriginalArticleClick}
            variant="outline"
            disabled={
              !featuredPresentation ||
              (!featuredPresentation.originalArticleFile &&
                !featuredPresentation.originalArticleUrl)
            }
            className="border-ucla-blue text-ucla-blue hover:bg-blue-50 px-6 sm:px-8 py-3 text-base sm:text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            {featuredPresentation &&
            (featuredPresentation.originalArticleFile ||
              featuredPresentation.originalArticleUrl)
              ? "View Featured Original Article"
              : "No Article Available"}
          </Button>

          {isAdminMode && (
            <Button
              onClick={handleUploadFeatured}
              variant="outline"
              className="border-ucla-blue text-ucla-blue hover:bg-blue-50 px-8 py-3 text-lg font-medium"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload to Featured
            </Button>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-ucla-blue">
              <Upload className="h-5 w-5" />
              Upload Featured Presentation
            </DialogTitle>
          </DialogHeader>
          <FeaturedUpload onUpload={handleFeaturedUpload} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
