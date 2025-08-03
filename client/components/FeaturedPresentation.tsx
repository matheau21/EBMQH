import { Button } from "@/components/ui/button";
import { ExternalLink, Presentation, Calendar, Upload } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

export function FeaturedPresentation() {
  const { isAdminMode } = useAdmin();

  const handleFeaturedClick = () => {
    // Handle featured presentation link click
    console.log("Featured presentation clicked");
  };

  const handleUploadFeatured = () => {
    // Handle upload to featured presentation
    console.log("Upload to featured presentation clicked");
  };

  return (
    <div className="bg-gradient-to-br from-white to-ucla-gold/5 border-2 border-ucla-gold/20 rounded-2xl p-8 shadow-lg">
      <div className="text-center">
        <div className="w-16 h-16 bg-ucla-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Presentation className="h-8 w-8 text-ucla-blue" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">Featured Presentation</h3>

        <div className="flex items-center justify-center mb-4 text-ucla-blue">
          <Calendar className="h-4 w-4 mr-2" />
          <p className="text-sm font-medium">
            Recently Presented at Noon Conference at Olive View
          </p>
        </div>

        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Access the latest landmark trial presentation from our noon conference series
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleFeaturedClick}
            className="bg-ucla-blue hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium border-2 border-ucla-gold/20 hover:border-ucla-gold/40 transition-all duration-300"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            View Featured Presentation
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
    </div>
  );
}
