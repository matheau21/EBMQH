import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye } from "lucide-react";

interface PresentationCardProps {
  title: string;
  specialty: string;
  thumbnail?: string;
  summary: string;
  authors?: string;
  journal?: string;
  year?: string;
  onViewSummary: () => void;
}

export function PresentationCard({
  title,
  specialty,
  thumbnail,
  summary,
  authors,
  journal,
  year,
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
    "Nephrology": "bg-specialty-nephrology/10 text-specialty-nephrology border-specialty-nephrology/20",
    "Gastroenterology": "bg-specialty-gastroenterology/10 text-specialty-gastroenterology border-specialty-gastroenterology/20",
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Badge 
            variant="outline" 
            className={`${specialtyColors[specialty] || specialtyColors["Internal Medicine"]} font-medium`}
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
            <div className="w-full h-32 bg-gradient-to-br from-olive-100 to-olive-200 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-olive-600/60" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-olive-700 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {summary}
        </p>

        {(authors || journal || year) && (
          <div className="text-xs text-gray-500 mb-4 space-y-1">
            {authors && <p className="font-medium">{authors}</p>}
            {journal && year && <p>{journal} ({year})</p>}
          </div>
        )}

        <Button
          onClick={onViewSummary}
          className="w-full bg-olive-600 hover:bg-olive-700 text-white group-hover:bg-olive-700 transition-all duration-300"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Summary
        </Button>
      </CardContent>
    </Card>
  );
}
