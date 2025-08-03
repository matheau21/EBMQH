import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Zap, 
  Brain, 
  Syringe, 
  Users, 
  Scissors, 
  Stethoscope,
  Baby,
  ShieldCheck,
  Bone,
  ScanLine,
  Microscope
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
    name: "Oncology", 
    icon: Zap,
    color: "bg-specialty-oncology/10 text-specialty-oncology border-specialty-oncology/20 hover:bg-specialty-oncology/20",
    activeColor: "bg-specialty-oncology text-white border-specialty-oncology"
  },
  {
    name: "Neurology",
    icon: Brain,
    color: "bg-specialty-neurology/10 text-specialty-neurology border-specialty-neurology/20 hover:bg-specialty-neurology/20",
    activeColor: "bg-specialty-neurology text-white border-specialty-neurology"
  },
  {
    name: "Endocrinology",
    icon: Syringe,
    color: "bg-specialty-endocrinology/10 text-specialty-endocrinology border-specialty-endocrinology/20 hover:bg-specialty-endocrinology/20",
    activeColor: "bg-specialty-endocrinology text-white border-specialty-endocrinology"
  },
  {
    name: "Psychiatry",
    icon: Users,
    color: "bg-specialty-psychiatry/10 text-specialty-psychiatry border-specialty-psychiatry/20 hover:bg-specialty-psychiatry/20",
    activeColor: "bg-specialty-psychiatry text-white border-specialty-psychiatry"
  },
  {
    name: "Surgery",
    icon: Scissors,
    color: "bg-specialty-surgery/10 text-specialty-surgery border-specialty-surgery/20 hover:bg-specialty-surgery/20",
    activeColor: "bg-specialty-surgery text-white border-specialty-surgery"
  },
  {
    name: "Emergency Medicine",
    icon: Zap,
    color: "bg-specialty-emergency/10 text-specialty-emergency border-specialty-emergency/20 hover:bg-specialty-emergency/20",
    activeColor: "bg-specialty-emergency text-white border-specialty-emergency"
  },
  {
    name: "Internal Medicine",
    icon: Stethoscope,
    color: "bg-specialty-internal/10 text-specialty-internal border-specialty-internal/20 hover:bg-specialty-internal/20",
    activeColor: "bg-specialty-internal text-white border-specialty-internal"
  },
  {
    name: "Pediatrics",
    icon: Baby,
    color: "bg-specialty-pediatrics/10 text-specialty-pediatrics border-specialty-pediatrics/20 hover:bg-specialty-pediatrics/20",
    activeColor: "bg-specialty-pediatrics text-white border-specialty-pediatrics"
  },
  {
    name: "Dermatology",
    icon: ShieldCheck,
    color: "bg-specialty-dermatology/10 text-specialty-dermatology border-specialty-dermatology/20 hover:bg-specialty-dermatology/20",
    activeColor: "bg-specialty-dermatology text-white border-specialty-dermatology"
  },
  {
    name: "Orthopedics",
    icon: Bone,
    color: "bg-specialty-orthopedics/10 text-specialty-orthopedics border-specialty-orthopedics/20 hover:bg-specialty-orthopedics/20",
    activeColor: "bg-specialty-orthopedics text-white border-specialty-orthopedics"
  },
  {
    name: "Radiology",
    icon: ScanLine,
    color: "bg-specialty-radiology/10 text-specialty-radiology border-specialty-radiology/20 hover:bg-specialty-radiology/20",
    activeColor: "bg-specialty-radiology text-white border-specialty-radiology"
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
