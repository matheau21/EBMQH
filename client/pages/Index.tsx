import { useState, useMemo } from "react";
import { PresentationCard } from "@/components/PresentationCard";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { SpecialtyFilters } from "@/components/SpecialtyFilters";
import { AuthModal } from "@/components/AuthModal";
import { UploadModal } from "@/components/UploadModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, TrendingUp, Users, Award, Zap } from "lucide-react";

interface Presentation {
  id: string;
  title: string;
  specialty: string;
  summary: string;
  authors?: string;
  journal?: string;
  year?: string;
  thumbnail?: string;
}

interface PresentationData {
  trialName: string;
  briefDescription: string;
  subspecialty: string;
  journalSource: string;
  file: File | null;
  originalArticle: File | null;
  thumbnail: File | null;
}

const mockPresentations: Presentation[] = [
  {
    id: "1",
    title: "SPRINT Trial: Intensive vs Standard Blood Pressure Control",
    specialty: "Cardiology",
    summary: "Landmark randomized trial demonstrating that intensive blood pressure control (target <120 mmHg) significantly reduces cardiovascular events and mortality compared to standard treatment (<140 mmHg).",
    authors: "SPRINT Research Group",
    journal: "N Engl J Med",
    year: "2015",
  },
  {
    id: "2",
    title: "KEYNOTE-189: Pembrolizumab in Metastatic NSCLC",
    specialty: "Heme/Onc",
    summary: "Phase 3 trial showing significant improvement in overall survival with pembrolizumab plus chemotherapy versus chemotherapy alone in previously untreated metastatic non-squamous NSCLC.",
    authors: "Gandhi L, et al.",
    journal: "N Engl J Med",
    year: "2018",
  },
  {
    id: "3",
    title: "COMPASS Trial: Rivaroxaban in Stable CAD",
    specialty: "Cardiology",
    summary: "Demonstrated that low-dose rivaroxaban plus aspirin reduces major adverse cardiovascular events in patients with stable coronary artery disease or peripheral artery disease.",
    authors: "Eikelboom JW, et al.",
    journal: "N Engl J Med",
    year: "2017",
  },
  {
    id: "4",
    title: "CLARITY-AD: Lecanemab in Early Alzheimer's Disease",
    specialty: "Neurology",
    summary: "Phase 3 trial showing that lecanemab significantly slowed cognitive decline in patients with early Alzheimer's disease, marking a breakthrough in amyloid-targeting therapy.",
    authors: "van Dyck CH, et al.",
    journal: "N Engl J Med",
    year: "2023",
  },
  {
    id: "5",
    title: "EMPA-REG OUTCOME: Empagliflozin in Type 2 Diabetes",
    specialty: "Endocrinology",
    summary: "Groundbreaking cardiovascular outcome trial demonstrating that empagliflozin reduces cardiovascular death and heart failure hospitalization in patients with type 2 diabetes.",
    authors: "Zinman B, et al.",
    journal: "N Engl J Med",
    year: "2015",
  },
  {
    id: "6",
    title: "STAR*D: Treatment-Resistant Depression Strategies",
    specialty: "Psychiatry",
    summary: "Large-scale effectiveness trial evaluating sequential treatment strategies for major depressive disorder, providing evidence-based approaches for treatment-resistant depression.",
    authors: "Rush AJ, et al.",
    journal: "Am J Psychiatry",
    year: "2006",
  },
  {
    id: "7",
    title: "ARDS Network: Low Tidal Volume Ventilation",
    specialty: "Pulmonary/Critical Care",
    summary: "Landmark trial demonstrating that mechanical ventilation with lower tidal volumes reduces mortality in patients with acute lung injury and ARDS.",
    authors: "ARDS Network",
    journal: "N Engl J Med",
    year: "2000",
  },
  {
    id: "8",
    title: "STOP-IT: Duration of Antibiotic Treatment",
    specialty: "Infectious Disease",
    summary: "Randomized trial showing that fixed-duration antibiotic therapy is as effective as symptom-guided therapy for complicated intra-abdominal infections.",
    authors: "Sawyer RG, et al.",
    journal: "N Engl J Med",
    year: "2015",
  },
  {
    id: "9",
    title: "RA-BEAM: Baricitinib in Rheumatoid Arthritis",
    specialty: "Rheumatology",
    summary: "Phase 3 trial demonstrating superior efficacy of baricitinib compared to placebo and adalimumab in patients with active rheumatoid arthritis.",
    authors: "Taylor PC, et al.",
    journal: "N Engl J Med",
    year: "2017",
  },
  {
    id: "10",
    title: "SHARP: Simvastatin and Ezetimibe in CKD",
    specialty: "Nephrology",
    summary: "Large-scale trial showing that simvastatin plus ezetimibe safely reduces the incidence of major atherosclerotic events in patients with chronic kidney disease.",
    authors: "SHARP Collaborative Group",
    journal: "The Lancet",
    year: "2011",
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
  "Gastroenterology",
];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [presentations, setPresentations] = useState(mockPresentations);

  const filteredPresentations = useMemo(() => {
    return presentations.filter((presentation) => {
      const matchesSearch = searchQuery === "" || 
        presentation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        presentation.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        presentation.authors?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecialty = selectedSpecialties.length === 0 || 
        selectedSpecialties.includes(presentation.specialty);
      
      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialties, presentations]);

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleViewSummary = (presentationId: string) => {
    console.log("View presentation:", presentationId);
  };

  const handleUploadClick = () => {
    if (isAuthenticated) {
      setShowUploadModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setShowUploadModal(true);
  };

  const handlePresentationSubmit = (data: PresentationData) => {
    const newPresentation: Presentation = {
      id: String(presentations.length + 1),
      title: data.trialName,
      specialty: data.subspecialty,
      summary: data.briefDescription,
      journal: data.journalSource,
      year: new Date().getFullYear().toString(),
    };
    
    setPresentations(prev => [newPresentation, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ucla-blue to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-ucla-blue">EBM Quick Hits</h1>
                <p className="text-xs text-blue-600">Evidence-Based Medicine Made Simple</p>
              </div>
            </div>
            <Button
              onClick={handleUploadClick}
              className="bg-ucla-blue hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Presentation
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ucla-blue via-blue-700 to-blue-800 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Rapid Review of Landmark Trials
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Curated for Medicine Residents & Students — High yield, digestible summaries of landmark clinical trials to enhance your medical education and practice
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 text-ucla-gold" />
                <span>Latest Research</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Users className="h-5 w-5 text-ucla-gold" />
                <span>Peer Reviewed</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Award className="h-5 w-5 text-ucla-gold" />
                <span>Evidence-Based</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center max-w-4xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-ucla-blue mb-2">{presentations.length}</div>
              <div className="text-blue-600">Trial Summaries</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-ucla-blue mb-2">{specialties.length}</div>
              <div className="text-blue-600">Medical Specialties</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Presentations</h2>
          <p className="text-gray-600">
            Explore our curated collection of landmark clinical trials and their key findings
          </p>
        </div>

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

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {filteredPresentations.length} of {presentations.length} presentations
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
                title={presentation.title}
                specialty={presentation.specialty}
                summary={presentation.summary}
                authors={presentation.authors}
                journal={presentation.journal}
                year={presentation.year}
                thumbnail={presentation.thumbnail}
                onViewSummary={() => handleViewSummary(presentation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No presentations found</h3>
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

        {/* Specialty Filter Tags - Moved to Bottom */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <SpecialtyFilters
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ucla-blue text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-ucla-gold rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-gray-900" />
                </div>
                <span className="text-xl font-bold">EBM Quick Hits</span>
              </div>
              <p className="text-blue-200">
                Evidence-based medicine summaries for medical education and clinical practice
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">All Presentations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Browse by Specialty</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Recent Additions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">EBM Reference Card</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Technical Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-600 mt-8 pt-8 text-center text-blue-200">
            <p>&copy; 2024 EBM Quick Hits. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
      />
      
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handlePresentationSubmit}
      />
    </div>
  );
}
