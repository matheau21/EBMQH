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
    "Cardiology": "bg-red-100 text-red-800 border-red-200",
    "Oncology": "bg-purple-100 text-purple-800 border-purple-200",
    "Neurology": "bg-blue-100 text-blue-800 border-blue-200",
    "Endocrinology": "bg-green-100 text-green-800 border-green-200",
    "Psychiatry": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Surgery": "bg-orange-100 text-orange-800 border-orange-200",
    "Emergency Medicine": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Internal Medicine": "bg-gray-100 text-gray-800 border-gray-200",
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
            <div className="w-full h-32 bg-gradient-to-br from-ucla-blue/10 to-ucla-gold/10 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-ucla-blue/40" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-ucla-blue transition-colors">
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
          className="w-full bg-ucla-blue hover:bg-ucla-blue/90 text-white group-hover:bg-ucla-gold group-hover:text-gray-900 transition-all duration-300"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Summary
        </Button>
      </CardContent>
    </Card>
  );
}
