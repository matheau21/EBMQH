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

export const SPECIALTY_NAMES = [
  "Cardiology",
  "Heme/Onc",
  "Endocrinology",
  "General Internal Medicine",
  "Pulmonary/Critical Care",
  "Infectious Disease",
  "Rheumatology",
  "Nephrology",
  "Gastroenterology/Hepatology",
  "Neurology",
];

const specialtyConfig = [
  {
    name: "Cardiology",
    icon: ModernCardiologyIcon,
    color:
      "bg-specialty-cardiology/10 text-specialty-cardiology border-specialty-cardiology/20 hover:bg-specialty-cardiology/20",
    activeColor:
      "bg-specialty-cardiology/20 text-specialty-cardiology border-specialty-cardiology/40 ring-1 ring-specialty-cardiology/30",
  },
  {
    name: "Heme/Onc",
    icon: ModernHemeOncIcon,
    color:
      "bg-specialty-hemeonc/10 text-specialty-hemeonc border-specialty-hemeonc/20 hover:bg-specialty-hemeonc/20",
    activeColor: "bg-specialty-hemeonc/20 text-specialty-hemeonc border-specialty-hemeonc/40 ring-1 ring-specialty-hemeonc/30",
  },
  {
    name: "Endocrinology",
    icon: ModernEndocrinologyIcon,
    color:
      "bg-specialty-endocrinology/10 text-specialty-endocrinology border-specialty-endocrinology/20 hover:bg-specialty-endocrinology/20",
    activeColor:
      "bg-specialty-endocrinology/20 text-specialty-endocrinology border-specialty-endocrinology/40 ring-1 ring-specialty-endocrinology/30",
  },
  {
    name: "General Internal Medicine",
    icon: ModernGeneralInternalIcon,
    color:
      "bg-specialty-generalinternal/10 text-specialty-generalinternal border-specialty-generalinternal/20 hover:bg-specialty-generalinternal/20",
    activeColor:
      "bg-specialty-generalinternal/20 text-specialty-generalinternal border-specialty-generalinternal/40 ring-1 ring-specialty-generalinternal/30",
  },
  {
    name: "Pulmonary/Critical Care",
    icon: ModernPulmonaryCriticalIcon,
    color:
      "bg-specialty-pulmonarycritical/10 text-specialty-pulmonarycritical border-specialty-pulmonarycritical/20 hover:bg-specialty-pulmonarycritical/20",
    activeColor:
      "bg-specialty-pulmonarycritical/20 text-specialty-pulmonarycritical border-specialty-pulmonarycritical/40 ring-1 ring-specialty-pulmonarycritical/30",
  },
  {
    name: "Infectious Disease",
    icon: ModernInfectiousIcon,
    color:
      "bg-specialty-infectious/10 text-specialty-infectious border-specialty-infectious/20 hover:bg-specialty-infectious/20",
    activeColor:
      "bg-specialty-infectious/20 text-specialty-infectious border-specialty-infectious/40 ring-1 ring-specialty-infectious/30",
  },
  {
    name: "Rheumatology",
    icon: ModernRheumatologyIcon,
    color:
      "bg-specialty-rheumatology/10 text-specialty-rheumatology border-specialty-rheumatology/20 hover:bg-specialty-rheumatology/20",
    activeColor:
      "bg-specialty-rheumatology/20 text-specialty-rheumatology border-specialty-rheumatology/40 ring-1 ring-specialty-rheumatology/30",
  },
  {
    name: "Nephrology",
    icon: ModernNephrologyIcon,
    color:
      "bg-specialty-nephrology/10 text-specialty-nephrology border-specialty-nephrology/20 hover:bg-specialty-nephrology/20",
    activeColor:
      "bg-specialty-nephrology/20 text-specialty-nephrology border-specialty-nephrology/40 ring-1 ring-specialty-nephrology/30",
  },
  {
    name: "Gastroenterology/Hepatology",
    icon: ModernGastroenterologyIcon,
    color:
      "bg-specialty-gastroenterology/10 text-specialty-gastroenterology border-specialty-gastroenterology/20 hover:bg-specialty-gastroenterology/20",
    activeColor:
      "bg-specialty-gastroenterology/20 text-specialty-gastroenterology border-specialty-gastroenterology/40 ring-1 ring-specialty-gastroenterology/30",
  },
  {
    name: "Neurology",
    icon: ModernNeurologyIcon,
    color:
      "bg-specialty-neurology/10 text-specialty-neurology border-specialty-neurology/20 hover:bg-specialty-neurology/20",
    activeColor: "bg-specialty-neurology/20 text-specialty-neurology border-specialty-neurology/40 ring-1 ring-specialty-neurology/30",
  },
];

export function SpecialtyFilters({
  selectedSpecialties,
  onSpecialtyToggle,
}: SpecialtyFiltersProps) {
  return (
    <div className="bg-gradient-to-br from-card to-accent/5 border-2 border-accent/20 rounded-2xl p-4 sm:p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">
          Explore Trial by Subspecialty
        </h3>
        {selectedSpecialties.length > 0 && (
          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-3">
            <span>{selectedSpecialties.length} selected</span>
            <button
              onClick={() => selectedSpecialties.forEach(onSpecialtyToggle)}
              className="text-primary hover:opacity-90 font-medium underline underline-offset-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 max-w-6xl mx-auto">
        {specialtyConfig.map((specialty) => {
          const Icon = specialty.icon;
          const isSelected = selectedSpecialties.includes(specialty.name);

          return (
            <div
              key={specialty.name}
              className={`
                aspect-square flex flex-col items-center justify-center gap-1 sm:gap-2 cursor-pointer transition-all duration-300 p-2 sm:p-3 rounded-xl border-2
                ${
                  isSelected
                    ? `${specialty.activeColor} shadow-lg transform scale-105`
                    : `${specialty.color} hover:shadow-md hover:scale-102`
                }
              `}
              onClick={() => onSpecialtyToggle(specialty.name)}
            >
              {specialty.name === "Cardiology" ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F680daab9a7e94e32bf8d9d95470129ce?format=webp&width=800"
                  alt="Cardiology"
                  className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain mx-auto"
                />
              ) : specialty.name === "Gastroenterology/Hepatology" ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2Fe34b80bdfe4d4ef5a10fd8577ada1e7e?format=webp&width=800"
                  alt="Gastroenterology Hepatology"
                  className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain mx-auto"
                />
              ) : specialty.name === "Nephrology" ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F395b535484c244d1b0f174eaf4b3411f?format=webp&width=800"
                  alt="Nephrology"
                  className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain mx-auto"
                />
              ) : specialty.name === "Pulmonary/Critical Care" ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2Fbef7ffd2adf349aaa7d9089ec800e478?format=webp&width=800"
                  alt="Pulmonology & Critical Care"
                  className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain mx-auto"
                />
              ) : specialty.name === "Neurology" ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F3e0fecf0b7ad488eafa45081f29d19fc?format=webp&width=800"
                  alt="Neurology"
                  className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain mx-auto"
                />
              ) : specialty.name === "Endocrinology" ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F139d3ec7c28c440e829b94eda60f5da9?format=webp&width=800"
                  alt="Endocrinology"
                  className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain mx-auto"
                />
              ) : specialty.name === "Heme/Onc" ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F0d93170d9d6c4c5c8fb0b485bf37d8f1?format=webp&width=800"
                  alt="Heme Onc"
                  className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain mx-auto"
                />
              ) : specialty.name === "Infectious Disease" ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2F612876197a094a3d9ee2a30ba99b644f?format=webp&width=800"
                  alt="Infectious Disease"
                  className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain mx-auto"
                />
              ) : specialty.name === "Rheumatology" ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2Fa6d6613fc86c450bade023bda5f4b6a6?format=webp&width=800"
                  alt="Rheumatology"
                  className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain mx-auto"
                />
              ) : specialty.name === "General Internal Medicine" ? (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fd749e485a67e440192fb0ee64da59aaa%2Fcceb314abc3a43aea424fa02fb1735f0?format=webp&width=800"
                  alt="General Internal Medicine"
                  className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-contain mx-auto"
                />
              ) : (
                <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                  <Icon />
                </div>
              )}
              <span className="text-sm font-semibold leading-tight text-center">
                {specialty.name === "Pulmonary/Critical Care" ? (
                  <>
                    Pulmonology &
                    <br />
                    Critical Care
                  </>
                ) : (
                  specialty.name.replace(/\//g, " ")
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
