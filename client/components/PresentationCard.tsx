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
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-gray-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <Badge
            variant="outline"
            className={`${specialtyColors[specialty] || specialtyColors["General Internal Medicine"]} font-medium`}
          >
            {specialty}
          </Badge>
          <div className="flex items-center gap-2 text-gray-400">
            {isAdminMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-gray-100"
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
          {thumbnail ? (
            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
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

        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-ucla-blue transition-colors">
          {title}
        </h3>

        {(journal || year) && (
          <div className="text-sm text-gray-600 mb-3">
            {journal ? journal : ""}{year ? `${journal ? " / " : ""}${year}` : ""}
          </div>
        )}

        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{summary}</p>

        {authors && (
          <div className="text-xs text-gray-500 mb-4">
            <p className="font-medium">{authors}</p>
          </div>
        )}

        {/* Viewer Count */}
        <div className="flex items-center justify-end mb-3">
          <div className="flex items-center gap-1 text-gray-500">
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
            className="w-full bg-ucla-blue hover:bg-blue-700 text-white group-hover:bg-blue-700 transition-all duration-300"
          >
            <Presentation className="h-4 w-4 mr-2" />
            View Files
          </Button>

          {/* Original Article Button */}
          <Button
            onClick={() => setShowFilesViewer(true)}
            variant="outline"
            className="w-full border-ucla-blue text-ucla-blue hover:bg-blue-50 transition-all duration-300"
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
