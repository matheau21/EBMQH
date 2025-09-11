import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Presentation, Calendar, Upload, Pause, Play } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useQuery } from "@tanstack/react-query";
import { presentationsAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
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
  const [paused, setPaused] = useState(false);
  const [api, setApi] = useState<CarouselApi | null>(null);

  const { data } = useQuery({
    queryKey: ["featured-recent"],
    queryFn: () => presentationsAPI.getPresentations({ limit: 3 }),
    staleTime: 30000,
  });
  const items = (data?.presentations || []).slice(0, 3);

  useEffect(() => {
    if (!api || paused || items.length <= 1) return;
    const id = setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => clearInterval(id);
  }, [api, paused, items.length]);

  const handleFeaturedClick = () => {
    // Intentionally noop: public list doesn't include file URLs.
    // Could navigate to All Presentations instead.
    window.location.href = "/presentations";
  };

  const handleOriginalArticleClick = () => {
    window.location.href = "/presentations";
  };

  const handleUploadFeatured = () => {
    setShowUploadModal(true);
  };

  const handleFeaturedUpload = (data: FeaturedPresentationData) => {
    const presentationWithDate = {
      ...data,
      uploadedAt: new Date().toISOString(),
    };
    localStorage.setItem("ebm-featured-presentation", JSON.stringify(presentationWithDate));
    setShowUploadModal(false);
  };

  return (
    <div className="bg-gradient-to-br from-white to-ucla-gold/5 border-2 border-ucla-gold/20 rounded-2xl p-6 sm:p-8 shadow-lg">
      <div className="text-center relative">
        <div className="w-16 h-16 bg-ucla-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Presentation className="h-8 w-8 text-ucla-blue" />
        </div>

        <div className="absolute right-0 top-0 flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setPaused(!paused)} title={paused ? "Play" : "Pause"}>
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          {isAdminMode && (
            <Button onClick={handleUploadFeatured} variant="outline" className="border-ucla-blue text-ucla-blue">
              <Upload className="h-4 w-4 mr-2" /> Upload
            </Button>
          )}
        </div>

        <Carousel setApi={setApi} className="max-w-3xl mx-auto">
          <CarouselContent>
            {items.length === 0 ? (
              <CarouselItem>
                <div className="text-center py-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Featured Presentation</h3>
                  <p className="text-gray-600">Access the latest landmark trial presentation from our noon conference</p>
                </div>
              </CarouselItem>
            ) : (
              items.map((p: any) => (
                <CarouselItem key={p.id}>
                  <div className="px-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{p.title}</h3>
                    <div className="flex items-center justify-center mb-3 text-ucla-blue">
                      <Calendar className="h-4 w-4 mr-2" />
                      <p className="text-sm font-medium">{p.journal ? `${p.journal}${p.year ? ` • ${p.year}` : ""}` : p.year || ""}</p>
                    </div>
                    <p className="text-gray-600 mb-5 max-w-xl mx-auto">{p.summary}</p>
                    <div className="flex justify-center gap-3">
                      <Button className="bg-ucla-blue" onClick={handleFeaturedClick}>
                        <ExternalLink className="h-4 w-4 mr-2" /> View
                      </Button>
                      <Button variant="outline" onClick={handleOriginalArticleClick} className="border-ucla-blue text-ucla-blue">
                        <ExternalLink className="h-4 w-4 mr-2" /> Original Article
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <CarouselPrevious className="-left-4 sm:-left-8" />
          <CarouselNext className="-right-4 sm:-right-8" />
        </Carousel>
      </div>

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
