import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Star,
  MoreHorizontal,
  Presentation,
  BookOpen,
} from "lucide-react";
import { PresentationViewer } from "./PresentationViewer";
import PresentationFilesViewer from "./PresentationFilesViewer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAdmin } from "@/contexts/AdminContext";
import {
  ModernCardiologyIcon,
  ModernHemeOncIcon,
  ModernEndocrinologyIcon,
  ModernGeneralInternalIcon,
  ModernPulmonaryCriticalIcon,
  ModernInfectiousIcon,
  ModernRheumatologyIcon,
  ModernNephrologyIcon,
  ModernGastroenterologyIcon,
  ModernNeurologyIcon,
} from "./ModernMedicalIcons";

interface PresentationCardProps {
  id: string;
  title: string;
  specialty: string;
  thumbnail?: string;
  summary: string;
  authors?: string;
  journal?: string;
  year?: string;
  viewerCount?: number;
  presentationFileUrl?: string;
  originalArticleUrl?: string;
  onViewSummary: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleFeatured?: (id: string) => void;
}

const getSpecialtyIcon = (specialty: string) => {
  switch (specialty) {
    case "Cardiology":
      return ModernCardiologyIcon;
    case "Heme/Onc":
      return ModernHemeOncIcon;
    case "Endocrinology":
      return ModernEndocrinologyIcon;
    case "General Internal Medicine":
      return ModernGeneralInternalIcon;
    case "Pulmonary/Critical Care":
      return ModernPulmonaryCriticalIcon;
    case "Infectious Disease":
      return ModernInfectiousIcon;
    case "Rheumatology":
      return ModernRheumatologyIcon;
    case "Nephrology":
      return ModernNephrologyIcon;
    case "Gastroenterology/Hepatology":
      return ModernGastroenterologyIcon;
    case "Neurology":
      return ModernNeurologyIcon;
    default:
      return null;
  }
};

export function PresentationCard({
  id,
  title,
  specialty,
  thumbnail,
  summary,
  authors,
  journal,
  year,
  viewerCount = 0,
  presentationFileUrl,
  originalArticleUrl,
  onViewSummary,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFeatured,
}: PresentationCardProps) {
  const { isAdminMode } = useAdmin();
  const [showPresentationViewer, setShowPresentationViewer] = useState(false);
  const [showArticleViewer, setShowArticleViewer] = useState(false);
  const [showFilesViewer, setShowFilesViewer] = useState(false);
  const [views, setViews] = useState<number>(viewerCount || 0);
  const specialtyColors: Record<string, string> = {
    Cardiology:
      "bg-specialty-cardiology/10 text-specialty-cardiology border-specialty-cardiology/20",
    "Heme/Onc":
      "bg-specialty-hemeonc/10 text-specialty-hemeonc border-specialty-hemeonc/20",
    Endocrinology:
      "bg-specialty-endocrinology/10 text-specialty-endocrinology border-specialty-endocrinology/20",
    "General Internal Medicine":
      "bg-specialty-generalinternal/10 text-specialty-generalinternal border-specialty-generalinternal/20",
    "Pulmonary/Critical Care":
      "bg-specialty-pulmonarycritical/10 text-specialty-pulmonarycritical border-specialty-pulmonarycritical/20",
    "Infectious Disease":
      "bg-specialty-infectious/10 text-specialty-infectious border-specialty-infectious/20",
    Rheumatology:
      "bg-specialty-rheumatology/10 text-specialty-rheumatology border-specialty-rheumatology/20",
    Nephrology:
      "bg-specialty-nephrology/10 text-specialty-nephrology border-specialty-nephrology/20",
    "Gastroenterology/Hepatology":
      "bg-specialty-gastroenterology/10 text-specialty-gastroenterology border-specialty-gastroenterology/20",
    Neurology:
      "bg-specialty-neurology/10 text-specialty-neurology border-specialty-neurology/20",
  };

  const getSpecialtyThumbnailColors = (specialty: string) => {
    switch (specialty) {
      case "Cardiology":
        return "bg-specialty-cardiology/10 text-specialty-cardiology border-specialty-cardiology/20";
      case "Heme/Onc":
        return "bg-specialty-hemeonc/10 text-specialty-hemeonc border-specialty-hemeonc/20";
      case "Endocrinology":
        return "bg-specialty-endocrinology/10 text-specialty-endocrinology border-specialty-endocrinology/20";
      case "General Internal Medicine":
        return "bg-specialty-generalinternal/10 text-specialty-generalinternal border-specialty-generalinternal/20";
      case "Pulmonary/Critical Care":
        return "bg-specialty-pulmonarycritical/10 text-specialty-pulmonarycritical border-specialty-pulmonarycritical/20";
      case "Infectious Disease":
        return "bg-specialty-infectious/10 text-specialty-infectious border-specialty-infectious/20";
      case "Rheumatology":
        return "bg-specialty-rheumatology/10 text-specialty-rheumatology border-specialty-rheumatology/20";
      case "Nephrology":
        return "bg-specialty-nephrology/10 text-specialty-nephrology border-specialty-nephrology/20";
      case "Gastroenterology/Hepatology":
        return "bg-specialty-gastroenterology/10 text-specialty-gastroenterology border-specialty-gastroenterology/20";
      case "Neurology":
        return "bg-specialty-neurology/10 text-specialty-neurology border-specialty-neurology/20";
      default:
        return "bg-ucla-blue/10 text-ucla-blue border-ucla-blue/20";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <Badge
            variant="outline"
            className={`${specialtyColors[specialty] || specialtyColors["General Internal Medicine"]} font-medium`}
          >
            {specialty}
          </Badge>
          <div className="flex items-center gap-2 text-muted-foreground">
            {isAdminMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-accent"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEdit?.(id)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate?.(id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleFeatured?.(id)}>
                    <Star className="h-4 w-4 mr-2" />
                    Feature
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <FileText className="h-4 w-4" />
          </div>
        </div>

        <div className="mb-4">
          {specialty === "Cardiology" ? (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F680daab9a7e94e32bf8d9d95470129ce?format=webp&width=800"
                alt="Cardiology"
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : specialty === "Gastroenterology/Hepatology" ? (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2Fe34b80bdfe4d4ef5a10fd8577ada1e7e?format=webp&width=800"
                alt="Gastroenterology Hepatology"
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : specialty === "Nephrology" ? (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F395b535484c244d1b0f174eaf4b3411f?format=webp&width=800"
                alt="Nephrology"
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : specialty === "Pulmonary/Critical Care" ? (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2Fbef7ffd2adf349aaa7d9089ec800e478?format=webp&width=800"
                alt="Pulmonology & Critical Care"
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : specialty === "Neurology" ? (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F3e0fecf0b7ad488eafa45081f29d19fc?format=webp&width=800"
                alt="Neurology"
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : specialty === "Endocrinology" ? (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F139d3ec7c28c440e829b94eda60f5da9?format=webp&width=800"
                alt="Endocrinology"
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : specialty === "Heme/Onc" ? (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F0d93170d9d6c4c5c8fb0b485bf37d8f1?format=webp&width=800"
                alt="Heme Onc"
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : specialty === "Infectious Disease" ? (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F612876197a094a3d9ee2a30ba99b644f?format=webp&width=800"
                alt="Infectious Disease"
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : specialty === "General Internal Medicine" ? (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2Fcceb314abc3a43aea424fa02fb1735f0?format=webp&width=800"
                alt="General Internal Medicine"
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : specialty === "Rheumatology" ? (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2Fa6d6613fc86c450bade023bda5f4b6a6?format=webp&width=800"
                alt="Rheumatology"
                className="h-16 w-16 object-contain"
              />
            </div>
          ) : thumbnail ? (
            <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ) : (
            <div
              className={`w-full h-32 ${getSpecialtyThumbnailColors(specialty)} rounded-lg flex items-center justify-center mb-4 border`}
            >
              {(() => {
                const SpecialtyIcon = getSpecialtyIcon(specialty);
                return SpecialtyIcon ? (
                  <div className="h-16 w-16">
                    <SpecialtyIcon />
                  </div>
                ) : (
                  <FileText className="h-12 w-12 opacity-60" />
                );
              })()}
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {(journal || year) && (
          <div className="text-sm text-muted-foreground mb-3">
            {journal ? journal : ""}{year ? `${journal ? " / " : ""}${year}` : ""}
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{summary}</p>

        {authors && (
          <div className="text-xs text-muted-foreground mb-4">
            <p className="font-medium">{authors}</p>
          </div>
        )}

        {/* Viewer Count */}
        <div className="flex items-center justify-end mb-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">
              {views.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Quick Hits Button */}
          <Button
            onClick={() => setShowFilesViewer(true)}
            className="w-full"
          >
            <Presentation className="h-4 w-4 mr-2" />
            View Files
          </Button>

          {/* Original Article Button */}
          <Button
            onClick={() => setShowFilesViewer(true)}
            variant="outline"
            className="w-full"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Original Article
          </Button>
        </div>

        {/* Combined Files Viewer */}
        <PresentationFilesViewer
          isOpen={showFilesViewer}
          onClose={() => setShowFilesViewer(false)}
          presentationId={id}
          title={title}
          fallbackPdfUrl={originalArticleUrl}
          fallbackPptUrl={presentationFileUrl}
          onCountedView={(newCount)=> setViews(newCount || (views + 1))}
        />
      </CardContent>
    </Card>
  );
}
