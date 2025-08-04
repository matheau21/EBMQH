import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye, Edit3, Trash2, Copy, Star, MoreHorizontal } from "lucide-react";
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
} from "./ModernMedicalIcons";

interface PresentationCardProps {
  title: string;
  specialty: string;
  thumbnail?: string;
  summary: string;
  authors?: string;
  journal?: string;
  year?: string;
  presentationFileUrl?: string;
  originalArticleUrl?: string;
  onViewSummary: () => void;
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
    default:
      return null;
  }
};

export function PresentationCard({
  title,
  specialty,
  thumbnail,
  summary,
  authors,
  journal,
  year,
  presentationFileUrl,
  originalArticleUrl,
  onViewSummary,
}: PresentationCardProps) {
  const specialtyColors: Record<string, string> = {
    "Cardiology": "bg-specialty-cardiology/10 text-specialty-cardiology border-specialty-cardiology/20",
    "Heme/Onc": "bg-specialty-hemeonc/10 text-specialty-hemeonc border-specialty-hemeonc/20",
    "Endocrinology": "bg-specialty-endocrinology/10 text-specialty-endocrinology border-specialty-endocrinology/20",
    "General Internal Medicine": "bg-specialty-generalinternal/10 text-specialty-generalinternal border-specialty-generalinternal/20",
    "Pulmonary/Critical Care": "bg-specialty-pulmonarycritical/10 text-specialty-pulmonarycritical border-specialty-pulmonarycritical/20",
    "Infectious Disease": "bg-specialty-infectious/10 text-specialty-infectious border-specialty-infectious/20",
    "Rheumatology": "bg-specialty-rheumatology/10 text-specialty-rheumatology border-specialty-rheumatology/20",
    "Nephrology": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Gastroenterology/Hepatology": "bg-specialty-gastroenterology/10 text-specialty-gastroenterology border-specialty-gastroenterology/20",
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Badge 
            variant="outline" 
            className={`${specialtyColors[specialty] || specialtyColors["General Internal Medicine"]} font-medium`}
          >
            {specialty}
          </Badge>
          <div className="flex items-center text-gray-400">
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
            <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mb-4">
              {(() => {
                const SpecialtyIcon = getSpecialtyIcon(specialty);
                return SpecialtyIcon ? (
                  <div className="h-16 w-16 text-ucla-blue/80">
                    <SpecialtyIcon />
                  </div>
                ) : (
                  <FileText className="h-12 w-12 text-ucla-blue/60" />
                );
              })()}
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-ucla-blue transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {summary}
        </p>

        {(authors || journal) && (
          <div className="text-xs text-gray-500 mb-4 space-y-1">
            {authors && <p className="font-medium">{authors}</p>}
            {journal && <p>{journal}</p>}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              if (presentationFileUrl) {
                window.open(presentationFileUrl, '_blank');
              } else {
                onViewSummary();
              }
            }}
            className="w-full bg-ucla-blue hover:bg-blue-700 text-white group-hover:bg-blue-700 transition-all duration-300"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Summary
          </Button>

          {originalArticleUrl && (
            <Button
              onClick={() => window.open(originalArticleUrl, '_blank')}
              variant="outline"
              className="w-full border-ucla-blue text-ucla-blue hover:bg-blue-50 transition-all duration-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Original Article
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
