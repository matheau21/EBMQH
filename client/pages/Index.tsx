import { useState, useMemo } from "react";
import { PresentationCard } from "@/components/PresentationCard";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { SpecialtyFilters } from "@/components/SpecialtyFilters";
import { FeaturedPresentation } from "@/components/FeaturedPresentation";
import { TestYourself } from "@/components/TestYourself";
import { AuthModal } from "@/components/AuthModal";
import { UploadModal } from "@/components/UploadModal";
import { AdminToggleButton } from "@/components/AdminToggleButton";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, TrendingUp, Users, Award, Zap } from "lucide-react";
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

interface FeaturedPresentationData {
  title: string;
  description: string;
  presenter: string;
  file: File | null;
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
  "Gastroenterology/Hepatology",
];

export default function Index() {
  const { isAdminMode } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [presentations, setPresentations] = useState(mockPresentations);

  const filteredPresentations = useMemo(() => {
    if (selectedSpecialties.length === 0) {
      return []; // Show no presentations when no specialty is selected on main page
    }

    return presentations.filter((presentation) => {
      const matchesSearch = searchQuery === "" ||
        presentation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        presentation.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        presentation.authors?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty = selectedSpecialties.includes(presentation.specialty);

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

  const handleEditPresentation = (id: string) => {
    console.log("Edit presentation:", id);
    // Open edit modal or navigate to edit page
  };

  const handleDeletePresentation = (id: string) => {
    if (window.confirm("Are you sure you want to delete this presentation?")) {
      setPresentations(prev => prev.filter(p => p.id !== id));
      console.log("Deleted presentation:", id);
    }
  };

  const handleDuplicatePresentation = (id: string) => {
    const presentation = presentations.find(p => p.id === id);
    if (presentation) {
      const duplicated = {
        ...presentation,
        id: String(Date.now()),
        title: `${presentation.title} (Copy)`,
      };
      setPresentations(prev => [duplicated, ...prev]);
      console.log("Duplicated presentation:", id);
    }
  };

  const handleToggleFeatured = (id: string) => {
    console.log("Toggle featured status:", id);
    // Implement featured toggle logic
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

  const handleFeaturedUpload = (data: FeaturedPresentationData) => {
    console.log("Featured presentation uploaded:", data);
    // Handle featured presentation upload logic here
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
            {isAdminMode && (
              <Button
                onClick={handleUploadClick}
                className="bg-ucla-blue hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-ucla-gold/20 hover:border-ucla-gold/40"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Presentation
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-ucla-blue via-blue-600 to-blue-800"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD100' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-ucla-gold/10 rounded-full blur-xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-ucla-gold/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            {/* Main Title */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight">
                <span className="block text-white">Landmark Trial</span>
                <span className="block bg-gradient-to-r from-ucla-gold to-yellow-300 bg-clip-text text-transparent">
                  Quick Hits
                </span>
              </h1>
              <div className="w-24 h-1 bg-ucla-gold mx-auto rounded-full"></div>
            </div>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              High-yield, digestible summaries of landmark trials — curated for Medicine Residents to enhance learning and clinical practice.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <TrendingUp className="h-8 w-8 text-ucla-gold mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Landmark Research</h3>
                <p className="text-sm text-blue-200">Breakthrough clinical trials that changed medicine</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <Users className="h-8 w-8 text-ucla-gold mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Guideline Origins</h3>
                <p className="text-sm text-blue-200">Studies that shaped current medical guidelines</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <Award className="h-8 w-8 text-ucla-gold mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Evidence-Based Practice</h3>
                <p className="text-sm text-blue-200">Research-backed clinical decision making</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-gray-50 to-ucla-gold/5 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center max-w-4xl mx-auto">
            <div className="bg-white border-2 border-ucla-gold/20 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-ucla-gold/40">
              <div className="text-4xl font-bold text-ucla-blue mb-2">{presentations.length}</div>
              <div className="text-ucla-gold font-semibold">Trial Summaries</div>
            </div>
            <div className="bg-white border-2 border-ucla-gold/20 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-ucla-gold/40">
              <div className="text-4xl font-bold text-ucla-blue mb-2">{specialties.length}</div>
              <div className="text-ucla-gold font-semibold">Medical Specialties</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Presentation Section */}
        <div className="mb-16">
          <FeaturedPresentation />
        </div>

        {/* Specialty Filter Tags */}
        <div className="mb-16">
          <SpecialtyFilters
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
          />
        </div>

        {/* Filtered Presentations Section */}
        {selectedSpecialties.length > 0 && (
          <div className="mb-16">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedSpecialties.join(", ")} Presentations
              </h2>
              <p className="text-gray-600">
                Showing {filteredPresentations.length} presentations for selected specialties
              </p>
            </div>

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
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No presentations found</h3>
                <p className="text-gray-600 mb-4">
                  No presentations available for the selected specialty. Check back later for updates.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSpecialties([])}
                  className="border-ucla-blue text-ucla-blue hover:bg-blue-50"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Test Yourself Section - Moved to Bottom */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <TestYourself />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ucla-blue text-white py-12 mt-16 relative">
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
                <li><Link to="/presentations" className="hover:text-white transition-colors">All Presentations</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">EBM Reference Card</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-600 mt-8 pt-8 text-center text-blue-200">
            <p>&copy; 2024 EBM Quick Hits. All rights reserved.</p>
          </div>
        </div>

        {/* Admin Toggle Button */}
        <AdminToggleButton />
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
