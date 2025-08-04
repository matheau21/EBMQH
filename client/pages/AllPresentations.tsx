import { useState, useMemo, useEffect } from "react";
import { PresentationCard } from "@/components/PresentationCard";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { SpecialtyFilters } from "@/components/SpecialtyFilters";
import { AdminToggleButton } from "@/components/AdminToggleButton";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EBMLogo } from "@/components/EBMLogo";
import { Link } from "react-router-dom";

interface Presentation {
  id: string;
  title: string;
  specialty: string;
  summary: string;
  authors?: string;
  journal?: string;
  year?: string;
  thumbnail?: string;
  viewerCount?: number;
  presentationFileUrl?: string;
  originalArticleUrl?: string;
}

const mockPresentations: Presentation[] = [
  {
    id: "1",
    title: "SPRINT Trial: Intensive vs Standard Blood Pressure Control",
    specialty: "Cardiology",
    summary:
      "Landmark randomized trial demonstrating that intensive blood pressure control (target <120 mmHg) significantly reduces cardiovascular events and mortality compared to standard treatment (<140 mmHg).",
    authors: "SPRINT Research Group",
    journal: "N Engl J Med",
    year: "2015",
    viewerCount: 1234,
  },
  {
    id: "2",
    title: "KEYNOTE-189: Pembrolizumab in Metastatic NSCLC",
    specialty: "Heme/Onc",
    summary:
      "Phase 3 trial showing significant improvement in overall survival with pembrolizumab plus chemotherapy versus chemotherapy alone in previously untreated metastatic non-squamous NSCLC.",
    authors: "Gandhi L, et al.",
    journal: "N Engl J Med",
    year: "2018",
    viewerCount: 987,
  },
  {
    id: "3",
    title: "COMPASS Trial: Rivaroxaban in Stable CAD",
    specialty: "Cardiology",
    summary:
      "Demonstrated that low-dose rivaroxaban plus aspirin reduces major adverse cardiovascular events in patients with stable coronary artery disease or peripheral artery disease.",
    authors: "Eikelboom JW, et al.",
    journal: "N Engl J Med",
    year: "2017",
    viewerCount: 756,
  },
  {
    id: "4",
    title: "CLARITY-AD: Lecanemab in Early Alzheimer's Disease",
    specialty: "Neurology",
    summary:
      "Phase 3 trial showing that lecanemab significantly slowed cognitive decline in patients with early Alzheimer's disease, marking a breakthrough in amyloid-targeting therapy.",
    authors: "van Dyck CH, et al.",
    journal: "N Engl J Med",
    year: "2023",
    viewerCount: 2341,
  },
  {
    id: "5",
    title: "EMPA-REG OUTCOME: Empagliflozin in Type 2 Diabetes",
    specialty: "Endocrinology",
    summary:
      "Groundbreaking cardiovascular outcome trial demonstrating that empagliflozin reduces cardiovascular death and heart failure hospitalization in patients with type 2 diabetes.",
    authors: "Zinman B, et al.",
    journal: "N Engl J Med",
    year: "2015",
    viewerCount: 1456,
  },
  {
    id: "6",
    title: "STAR*D: Treatment-Resistant Depression Strategies",
    specialty: "Psychiatry",
    summary:
      "Large-scale effectiveness trial evaluating sequential treatment strategies for major depressive disorder, providing evidence-based approaches for treatment-resistant depression.",
    authors: "Rush AJ, et al.",
    journal: "Am J Psychiatry",
    year: "2006",
    viewerCount: 543,
  },
  {
    id: "7",
    title: "ARDS Network: Low Tidal Volume Ventilation",
    specialty: "Pulmonary/Critical Care",
    summary:
      "Landmark trial demonstrating that mechanical ventilation with lower tidal volumes reduces mortality in patients with acute lung injury and ARDS.",
    authors: "ARDS Network",
    journal: "N Engl J Med",
    year: "2000",
    viewerCount: 1876,
  },
  {
    id: "8",
    title: "STOP-IT: Duration of Antibiotic Treatment",
    specialty: "Infectious Disease",
    summary:
      "Randomized trial showing that fixed-duration antibiotic therapy is as effective as symptom-guided therapy for complicated intra-abdominal infections.",
    authors: "Sawyer RG, et al.",
    journal: "N Engl J Med",
    year: "2015",
    viewerCount: 692,
  },
  {
    id: "9",
    title: "RA-BEAM: Baricitinib in Rheumatoid Arthritis",
    specialty: "Rheumatology",
    summary:
      "Phase 3 trial demonstrating superior efficacy of baricitinib compared to placebo and adalimumab in patients with active rheumatoid arthritis.",
    authors: "Taylor PC, et al.",
    journal: "N Engl J Med",
    year: "2017",
    viewerCount: 834,
  },
  {
    id: "10",
    title: "SHARP: Simvastatin and Ezetimibe in CKD",
    specialty: "Nephrology",
    summary:
      "Large-scale trial showing that simvastatin plus ezetimibe safely reduces the incidence of major atherosclerotic events in patients with chronic kidney disease.",
    authors: "SHARP Collaborative Group",
    journal: "The Lancet",
    year: "2011",
    viewerCount: 1123,
  },
];

const specialties = [
  "Cardiology",
  "Heme/Onc",
  "Endocrinology",
  "General Internal Medicine",
  "Pulmonary/Critical Care",
  "Infectious Disease",
  "Rheumatology",
  "Nephrology",
  "Gastroenterology/Hepatology",
];

export default function AllPresentations() {
  const { isAdminMode } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);

  // Load presentations from localStorage on mount
  useEffect(() => {
    const savedPresentations = localStorage.getItem('ebm-presentations');
    if (savedPresentations) {
      try {
        const parsed = JSON.parse(savedPresentations);
        setPresentations([...mockPresentations, ...parsed]);
      } catch (error) {
        console.error('Error loading presentations:', error);
        setPresentations(mockPresentations);
      }
    } else {
      setPresentations(mockPresentations);
    }
  }, []);

  // Save presentations to localStorage whenever presentations change
  useEffect(() => {
    const customPresentations = presentations.filter(p =>
      !mockPresentations.find(mock => mock.id === p.id)
    );
    if (customPresentations.length > 0) {
      localStorage.setItem('ebm-presentations', JSON.stringify(customPresentations));
    }
  }, [presentations]);

  const filteredPresentations = useMemo(() => {
    return presentations.filter((presentation) => {
      const matchesSearch =
        searchQuery === "" ||
        presentation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        presentation.summary
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        presentation.authors?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        selectedSpecialties.length === 0 ||
        selectedSpecialties.includes(presentation.specialty);

      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialties, presentations]);

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty],
    );
  };

  const handleViewSummary = (presentationId: string) => {
    console.log("View presentation:", presentationId);
  };

  const handleEditPresentation = (id: string) => {
    console.log("Edit presentation:", id);
  };

  const handleDeletePresentation = (id: string) => {
    if (window.confirm("Are you sure you want to delete this presentation?")) {
      setPresentations((prev) => prev.filter((p) => p.id !== id));
      console.log("Deleted presentation:", id);
    }
  };

  const handleDuplicatePresentation = (id: string) => {
    const presentation = presentations.find((p) => p.id === id);
    if (presentation) {
      const duplicated = {
        ...presentation,
        id: String(Date.now()),
        title: `${presentation.title} (Copy)`,
      };
      setPresentations((prev) => [duplicated, ...prev]);
      console.log("Duplicated presentation:", id);
    }
  };

  const handleToggleFeatured = (id: string) => {
    console.log("Toggle featured status:", id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <EBMLogo size="md" className="shadow-lg" />
              <div>
                <h1 className="text-xl font-bold text-ucla-blue">
                  All Presentations
                </h1>
                <p className="text-xs text-blue-600">
                  Browse all landmark trial summaries
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8">
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
            availableSpecialties={specialties}
          />
        </div>

        {/* Specialty Filters */}
        <div className="mb-8">
          <SpecialtyFilters
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {filteredPresentations.length} of {presentations.length}{" "}
            presentations
          </p>
          {(searchQuery || selectedSpecialties.length > 0) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialties([]);
              }}
              className="text-sm border-ucla-blue text-ucla-blue hover:bg-blue-50"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Presentations Grid */}
        {filteredPresentations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresentations.map((presentation) => (
              <PresentationCard
                key={presentation.id}
                id={presentation.id}
                title={presentation.title}
                specialty={presentation.specialty}
                summary={presentation.summary}
                authors={presentation.authors}
                journal={presentation.journal}
                year={presentation.year}
                viewerCount={presentation.viewerCount}
                thumbnail={presentation.thumbnail}
                onViewSummary={() => handleViewSummary(presentation.id)}
                onEdit={handleEditPresentation}
                onDelete={handleDeletePresentation}
                onDuplicate={handleDuplicatePresentation}
                onToggleFeatured={handleToggleFeatured}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 text-gray-300 mx-auto mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No presentations found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all presentations
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialties([]);
              }}
              className="border-ucla-blue text-ucla-blue hover:bg-blue-50"
            >
              Show All Presentations
            </Button>
          </div>
        )}
      </main>

      {/* Admin Toggle Button */}
      <AdminToggleButton />
    </div>
  );
}
