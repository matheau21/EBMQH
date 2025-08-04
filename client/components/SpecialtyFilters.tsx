import { Badge } from "@/components/ui/badge";
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

interface SpecialtyFiltersProps {
  selectedSpecialties: string[];
  onSpecialtyToggle: (specialty: string) => void;
}

const specialtyConfig = [
  {
    name: "Cardiology",
    icon: ModernCardiologyIcon,
    color:
      "bg-specialty-cardiology/10 text-specialty-cardiology border-specialty-cardiology/20 hover:bg-specialty-cardiology/20",
    activeColor:
      "bg-specialty-cardiology text-white border-specialty-cardiology",
  },
  {
    name: "Heme/Onc",
    icon: ModernHemeOncIcon,
    color:
      "bg-specialty-hemeonc/10 text-specialty-hemeonc border-specialty-hemeonc/20 hover:bg-specialty-hemeonc/20",
    activeColor: "bg-specialty-hemeonc text-white border-specialty-hemeonc",
  },
  {
    name: "Endocrinology",
    icon: ModernEndocrinologyIcon,
    color:
      "bg-specialty-endocrinology/10 text-specialty-endocrinology border-specialty-endocrinology/20 hover:bg-specialty-endocrinology/20",
    activeColor:
      "bg-specialty-endocrinology text-white border-specialty-endocrinology",
  },
  {
    name: "General Internal Medicine",
    icon: ModernGeneralInternalIcon,
    color:
      "bg-specialty-generalinternal/10 text-specialty-generalinternal border-specialty-generalinternal/20 hover:bg-specialty-generalinternal/20",
    activeColor:
      "bg-specialty-generalinternal text-white border-specialty-generalinternal",
  },
  {
    name: "Pulmonary/Critical Care",
    icon: ModernPulmonaryCriticalIcon,
    color:
      "bg-specialty-pulmonarycritical/10 text-specialty-pulmonarycritical border-specialty-pulmonarycritical/20 hover:bg-specialty-pulmonarycritical/20",
    activeColor:
      "bg-specialty-pulmonarycritical text-white border-specialty-pulmonarycritical",
  },
  {
    name: "Infectious Disease",
    icon: ModernInfectiousIcon,
    color:
      "bg-specialty-infectious/10 text-specialty-infectious border-specialty-infectious/20 hover:bg-specialty-infectious/20",
    activeColor:
      "bg-specialty-infectious text-white border-specialty-infectious",
  },
  {
    name: "Rheumatology",
    icon: ModernRheumatologyIcon,
    color:
      "bg-specialty-rheumatology/10 text-specialty-rheumatology border-specialty-rheumatology/20 hover:bg-specialty-rheumatology/20",
    activeColor:
      "bg-specialty-rheumatology text-white border-specialty-rheumatology",
  },
  {
    name: "Nephrology",
    icon: ModernNephrologyIcon,
    color:
      "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    activeColor: "bg-yellow-500 text-white border-yellow-500",
  },
  {
    name: "Gastroenterology/Hepatology",
    icon: ModernGastroenterologyIcon,
    color:
      "bg-specialty-gastroenterology/10 text-specialty-gastroenterology border-specialty-gastroenterology/20 hover:bg-specialty-gastroenterology/20",
    activeColor:
      "bg-specialty-gastroenterology text-white border-specialty-gastroenterology",
  },
  {
    name: "Neurology",
    icon: ModernNeurologyIcon,
    color:
      "bg-specialty-neurology/10 text-specialty-neurology border-specialty-neurology/20 hover:bg-specialty-neurology/20",
    activeColor:
      "bg-specialty-neurology text-white border-specialty-neurology",
  },
];

export function SpecialtyFilters({
  selectedSpecialties,
  onSpecialtyToggle,
}: SpecialtyFiltersProps) {
  return (
    <div className="bg-gradient-to-br from-white to-ucla-gold/5 border-2 border-ucla-gold/20 rounded-2xl p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
        Explore Trial by Subspecialty
      </h3>
      <div className="grid grid-cols-5 gap-3 max-w-6xl mx-auto">
        {specialtyConfig.map((specialty) => {
          const Icon = specialty.icon;
          const isSelected = selectedSpecialties.includes(specialty.name);

          return (
            <div
              key={specialty.name}
              className={`
                aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 p-3 rounded-xl border-2
                ${
                  isSelected
                    ? `${specialty.activeColor} shadow-lg transform scale-105`
                    : `${specialty.color} hover:shadow-md hover:scale-102`
                }
              `}
              onClick={() => onSpecialtyToggle(specialty.name)}
            >
              <div className="w-8 h-8 flex-shrink-0">
                <Icon />
              </div>
              <span className="text-xs font-semibold leading-tight text-center">
                {specialty.name}
              </span>
            </div>
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
