import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Zap,
  Syringe,
  Stethoscope,
  Wind,
  Shield,
  Activity,
  Droplets,
  Utensils
} from "lucide-react";

interface SpecialtyFiltersProps {
  selectedSpecialties: string[];
  onSpecialtyToggle: (specialty: string) => void;
}

const specialtyConfig = [
  {
    name: "Cardiology",
    icon: Heart,
    color: "bg-specialty-cardiology/10 text-specialty-cardiology border-specialty-cardiology/20 hover:bg-specialty-cardiology/20",
    activeColor: "bg-specialty-cardiology text-white border-specialty-cardiology"
  },
  {
    name: "Heme/Onc",
    icon: Zap,
    color: "bg-specialty-hemeonc/10 text-specialty-hemeonc border-specialty-hemeonc/20 hover:bg-specialty-hemeonc/20",
    activeColor: "bg-specialty-hemeonc text-white border-specialty-hemeonc"
  },
  {
    name: "Endocrinology",
    icon: Syringe,
    color: "bg-specialty-endocrinology/10 text-specialty-endocrinology border-specialty-endocrinology/20 hover:bg-specialty-endocrinology/20",
    activeColor: "bg-specialty-endocrinology text-white border-specialty-endocrinology"
  },
  {
    name: "General Internal Medicine",
    icon: Stethoscope,
    color: "bg-specialty-generalinternal/10 text-specialty-generalinternal border-specialty-generalinternal/20 hover:bg-specialty-generalinternal/20",
    activeColor: "bg-specialty-generalinternal text-white border-specialty-generalinternal"
  },
  {
    name: "Pulmonary/Critical Care",
    icon: Wind,
    color: "bg-specialty-pulmonarycritical/10 text-specialty-pulmonarycritical border-specialty-pulmonarycritical/20 hover:bg-specialty-pulmonarycritical/20",
    activeColor: "bg-specialty-pulmonarycritical text-white border-specialty-pulmonarycritical"
  },
  {
    name: "Infectious Disease",
    icon: Shield,
    color: "bg-specialty-infectious/10 text-specialty-infectious border-specialty-infectious/20 hover:bg-specialty-infectious/20",
    activeColor: "bg-specialty-infectious text-white border-specialty-infectious"
  },
  {
    name: "Rheumatology",
    icon: Activity,
    color: "bg-specialty-rheumatology/10 text-specialty-rheumatology border-specialty-rheumatology/20 hover:bg-specialty-rheumatology/20",
    activeColor: "bg-specialty-rheumatology text-white border-specialty-rheumatology"
  },
  {
    name: "Nephrology",
    icon: Droplets,
    color: "bg-specialty-nephrology/10 text-specialty-nephrology border-specialty-nephrology/20 hover:bg-specialty-nephrology/20",
    activeColor: "bg-specialty-nephrology text-white border-specialty-nephrology"
  },
  {
    name: "Gastroenterology",
    icon: Utensils,
    color: "bg-specialty-gastroenterology/10 text-specialty-gastroenterology border-specialty-gastroenterology/20 hover:bg-specialty-gastroenterology/20",
    activeColor: "bg-specialty-gastroenterology text-white border-specialty-gastroenterology"
  },
];

export function SpecialtyFilters({ selectedSpecialties, onSpecialtyToggle }: SpecialtyFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Specialty</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {specialtyConfig.map((specialty) => {
          const Icon = specialty.icon;
          const isSelected = selectedSpecialties.includes(specialty.name);
          
          return (
            <Badge
              key={specialty.name}
              variant="outline"
              className={`
                h-20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 text-center p-3
                ${isSelected ? specialty.activeColor : specialty.color}
              `}
              onClick={() => onSpecialtyToggle(specialty.name)}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium leading-tight">{specialty.name}</span>
            </Badge>
          );
        })}
      </div>
      
      {selectedSpecialties.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedSpecialties.length} specialties selected
            </span>
            <button
              onClick={() => selectedSpecialties.forEach(onSpecialtyToggle)}
              className="text-sm text-olive-600 hover:text-olive-700 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
