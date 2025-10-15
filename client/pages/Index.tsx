import { useState, useMemo, useEffect } from "react";
import { PresentationCard } from "@/components/PresentationCard";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { SpecialtyFilters } from "@/components/SpecialtyFilters";
import { FeaturedPresentation } from "@/components/FeaturedPresentation";
import { TestYourself } from "@/components/TestYourself";
import { AuthModal } from "@/components/AuthModal";
import { UploadModal } from "@/components/UploadModal";
import { useAdmin } from "@/contexts/AdminContext";
import { usePublish } from "@/contexts/PublishContext";
import {
  presentationsAPI,
  checkBackendAvailability,
  Presentation as APIPresentation,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Users, Award } from "lucide-react";
import { EBMLogo } from "@/components/EBMLogo";
import SiteFooter from "@/components/SiteFooter";
import { ThemeToggle } from "@/components/ThemeToggle";

import { BackendStatusBanner } from "@/components/BackendStatusBanner";
import { addPresentationFilesToMediaLibrary } from "@/lib/mediaLibraryUtils";
import { Link } from "react-router-dom";

interface Presentation {
  id: string;
  title: string;
  specialty: string;
  specialties?: string[];
  summary: string;
  authors?: string;
  journal?: string;
  year?: string;
  thumbnail?: string;
  viewerCount?: number;
  presentationFileUrl?: string;
  originalArticleUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PresentationData {
  trialName: string;
  briefDescription: string;
  subspecialty: string[];
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
  "Pulmonary Critical Care",
  "Infectious Disease",
  "Rheumatology",
  "Nephrology",
  "Gastroenterology Hepatology",
  "Neurology",
];

export default function Index() {
  const { isAdminMode, isAuthenticated: loggedIn, user, logout } = useAdmin();
  const { markAsChanged } = usePublish();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "year">("date");
  const [animatedCount, setAnimatedCount] = useState(0);

  // Load presentations from API with fallback to mock data
  useEffect(() => {
    const loadPresentations = async () => {
      try {
        const backendAvailable = await checkBackendAvailability();
        console.log("[home] backendAvailable:", backendAvailable);

        if (backendAvailable) {
          const response = await presentationsAPI.getPresentations({
            limit: 100,
          });
          const apiPresentations =
            response.presentations?.map((p) => ({
              id: p.id,
              title: p.title,
              specialty: p.specialty,
              specialties: (p as any).specialties || [],
              summary: p.summary,
              authors: p.authors,
              journal: p.journal,
              year: p.year,
              thumbnail: p.thumbnail,
              viewerCount: p.viewerCount,
              presentationFileUrl: p.presentationFileUrl,
              originalArticleUrl: p.originalArticleUrl,
              createdAt: (p as any).createdAt,
              updatedAt: (p as any).updatedAt,
            })) || [];
          console.log("[home] presentations fetched:", apiPresentations.length);
          setPresentations(apiPresentations);
        } else {
          console.log("[home] backend unavailable -> zero presentations");
          setPresentations([]);
        }
      } catch (error) {
        console.log(
          "[home] API error -> fallback to mock:",
          (error as any)?.message || error,
        );
        setPresentations(mockPresentations);
      }
    };

    loadPresentations();
  }, []);

  // Animate posted trials count
  useEffect(() => {
    const target = presentations.length || 0;
    let raf = 0;
    const duration = 800; // ms
    const startTime = performance.now();
    const startVal = animatedCount > target ? 0 : 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.floor(startVal + eased * target);
      setAnimatedCount(value);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [presentations.length]);

  // No local storage persistence; data is dynamic from Supabase
  useEffect(() => {}, [presentations]);

  const filteredPresentations = useMemo(() => {
    if (selectedSpecialties.length === 0) {
      return [];
    }

    return presentations.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authors?.toLowerCase().includes(searchQuery.toLowerCase());

      const presSpecialties = Array.from(
        new Set([p.specialty, ...(p as any).specialties || []].filter(Boolean)),
      );
      const matchesSpecialty = presSpecialties.some((s) =>
        selectedSpecialties.includes(s),
      );

      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialties, presentations]);

  const sortedPresentations = useMemo(() => {
    const list = [...filteredPresentations];
    if (sortBy === "date") {
      list.sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
        return tb - ta;
      });
    } else {
      list.sort((a, b) => {
        const ya = parseInt(a.year || "0", 10) || 0;
        const yb = parseInt(b.year || "0", 10) || 0;
        return yb - ya;
      });
    }
    return list;
  }, [filteredPresentations, sortBy]);

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
    window.location.href = `/admin/trials/${id}`;
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
    const presentation = presentations.find((p) => p.id === id);
    if (presentation && presentation.presentationFileUrl) {
      // Convert the presentation to featured format
      const featuredData = {
        title: presentation.title,
        description: presentation.summary,
        presenter: presentation.authors || "Unknown",
        file: null, // We'll use the URL instead
        uploadedAt: new Date().toISOString(),
      };

      // Save to featured presentation localStorage
      localStorage.setItem(
        "ebm-featured-presentation",
        JSON.stringify({
          ...featuredData,
          fileUrl: presentation.presentationFileUrl,
        }),
      );

      console.log("Featured presentation set:", presentation.title);
      alert(
        `"${presentation.title}" has been set as the featured presentation!`,
      );
    } else {
      alert("This presentation doesn't have a file to feature.");
    }
  };

  const handleUploadClick = () => {
    if (loggedIn) {
      setShowUploadModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthenticated = () => {
    setShowUploadModal(true);
  };

  // Listen for global upload modal open events from floating buttons
  useEffect(() => {
    const handler = () => setShowUploadModal(true);
    window.addEventListener("open-upload-modal", handler as any);
    return () =>
      window.removeEventListener("open-upload-modal", handler as any);
  }, []);

  const handlePresentationSubmit = async (data: PresentationData) => {
    try {
      // Create file URLs for uploaded files
      const presentationFileUrl = data.file
        ? URL.createObjectURL(data.file)
        : undefined;
      const originalArticleUrl = data.originalArticle
        ? URL.createObjectURL(data.originalArticle)
        : undefined;
      const thumbnailUrl = data.thumbnail
        ? URL.createObjectURL(data.thumbnail)
        : undefined;

      const newPresentationData = {
        title: data.trialName,
        specialty: data.subspecialty[0] || "General Internal Medicine",
        specialties: data.subspecialty.slice(0, 2),
        summary: data.briefDescription,
        journal: data.journalSource,
        year: new Date().getFullYear().toString(),
        thumbnail: thumbnailUrl,
        presentationFileUrl,
        originalArticleUrl,
      };

      // Create presentation via API if authenticated as admin
      if (isAdminMode) {
        const response =
          await presentationsAPI.createPresentation(newPresentationData);
        const apiPresentation = response.presentation;

        const newPresentation: Presentation = {
          id: apiPresentation.id,
          title: apiPresentation.title,
          specialty: apiPresentation.specialty,
          specialties: (apiPresentation as any).specialties || [],
          summary: apiPresentation.summary,
          authors: apiPresentation.authors,
          journal: apiPresentation.journal,
          year: apiPresentation.year,
          thumbnail: apiPresentation.thumbnail,
          viewerCount: apiPresentation.viewerCount,
          presentationFileUrl: apiPresentation.presentationFileUrl,
          originalArticleUrl: apiPresentation.originalArticleUrl,
        };

        setPresentations((prev) => [newPresentation, ...prev]);
      } else {
        // Local storage fallback for non-admin users
        const newPresentation: Presentation = {
          id: String(Date.now()),
          ...newPresentationData,
          viewerCount: 0,
        };
        setPresentations((prev) => [newPresentation, ...prev]);
      }

      markAsChanged(); // Mark that changes have been made

      // Add files to media library
      addPresentationFilesToMediaLibrary(
        data.file,
        data.originalArticle,
        data.trialName,
      );
    } catch (error) {
      console.error("Error creating presentation:", error);
      alert("Failed to create presentation. Please try again.");
    }
  };

  const handleFeaturedUpload = (data: FeaturedPresentationData) => {
    console.log("Featured presentation uploaded:", data);
    // Handle featured presentation upload logic here
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <EBMLogo size="md" className="shadow-lg flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                  EBM Quick Hits
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Evidence-Based Medicine Made Simple
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0 items-center">
              {/* Theme toggle */}
              <ThemeToggle />
              {loggedIn && (
                <div className="hidden sm:flex flex-col items-end text-sm text-foreground mr-2">
                  <div>
                    Signed in as{" "}
                    <span className="ml-1 font-medium">{user?.username}</span>
                  </div>
                  <div className="text-xs text-muted-foreground -mt-0.5">
                    {user?.role ?? (isAdminMode ? "admin" : "user")}
                  </div>
                </div>
              )}
              {false && isAdminMode && <></>}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Background Pattern with Dynamic Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-ucla-blue dark:bg-[hsl(var(--background))]"></div>
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD100' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232774AE' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Elements with Animation */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-ucla-gold/10 dark:bg-primary/20 rounded-full blur-xl"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-ucla-gold/5 dark:bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-white/5 dark:bg-white/10 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-white/30 dark:bg-white/10 rounded-full blur-xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white dark:text-foreground">
            {/* Main Title */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
                <span className="block text-white dark:text-foreground animate-slide-down">
                  Landmark Medical Trial
                </span>
                <span className="block bg-gradient-to-r from-ucla-gold to-yellow-300 dark:from-primary dark:to-primary/70 bg-clip-text text-transparent animate-slide-up">
                  Quick Hits
                </span>
              </h1>
              <div className="w-16 sm:w-24 h-1 bg-ucla-gold dark:bg-primary mx-auto rounded-full animate-expand"></div>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-blue-100 dark:text-muted-foreground mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed font-light animate-fade-in px-4">
              High-yield, digestible summaries of landmark trials — curated for
              Medicine Residents to enhance learning and clinical practice.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto px-4">
              <div
                className="bg-white/10 dark:bg-muted/60 backdrop-blur-lg border border-white/20 dark:border-border rounded-2xl p-4 sm:p-5 hover:bg-white/15 dark:hover:bg-muted transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <BookOpen className="h-7 w-7 text-ucla-gold dark:text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Landmark Research</h3>
                <p className="text-sm text-blue-200 dark:text-muted-foreground">
                  Breakthrough clinical trials that changed medicine
                </p>
              </div>
              <div
                className="bg-white/10 dark:bg-muted/60 backdrop-blur-lg border border-white/20 dark:border-border rounded-2xl p-5 hover:bg-white/15 dark:hover:bg-muted transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <Users className="h-7 w-7 text-ucla-gold dark:text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Guideline Origins</h3>
                <p className="text-sm text-blue-200 dark:text-muted-foreground">
                  Studies that shaped current medical guidelines
                </p>
              </div>
              <div
                className="bg-white/10 dark:bg-muted/60 backdrop-blur-lg border border-white/20 dark:border-border rounded-2xl p-5 hover:bg-white/15 dark:hover:bg-muted transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <Award className="h-7 w-7 text-ucla-gold dark:text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Evidence-Based Practice</h3>
                <p className="text-sm text-blue-200 dark:text-muted-foreground">
                  Increase research-backed clinical decision making
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-r from-background to-accent/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="bg-card border-2 border-accent/20 p-6 sm:p-8 lg:p-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent/40 w-full max-w-2xl text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-3 sm:mb-4">
                {animatedCount.toLocaleString()}
              </div>
              <div className="text-foreground font-semibold text-lg sm:text-xl">
                Posted Trial Summaries
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Backend Status Banner */}
        <BackendStatusBanner />

        {/* Featured Presentation Section */}
        <div className="mb-12 sm:mb-16">
          <FeaturedPresentation />
        </div>

        {/* Specialty Filter Tags */}
        <div className="mb-12 sm:mb-16">
          <SpecialtyFilters
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
          />
        </div>

        {/* Filtered Presentations Section */}
        {selectedSpecialties.length > 0 && (
          <div className="mb-16">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Presentations
                </h2>
                <p className="text-muted-foreground">
                  Showing {filteredPresentations.length} presentations for
                  selected specialties
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Sort by</label>
                <select
                  className="text-sm bg-card border border-border rounded-md px-2 py-1"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="date">Date posted</option>
                  <option value="year">Publication year</option>
                </select>
              </div>
            </div>

            {filteredPresentations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {sortedPresentations.map((presentation) => {
                  const primarySpecialty = (presentation.specialties && presentation.specialties[0]) || presentation.specialty;
                  return (
                    <PresentationCard
                      key={presentation.id}
                      id={presentation.id}
                      title={presentation.title}
                      specialty={primarySpecialty}
                      specialties={presentation.specialties}
                      summary={presentation.summary}
                      authors={presentation.authors}
                      journal={presentation.journal}
                      year={presentation.year}
                      viewerCount={presentation.viewerCount}
                      thumbnail={presentation.thumbnail}
                      presentationFileUrl={presentation.presentationFileUrl}
                      originalArticleUrl={presentation.originalArticleUrl}
                      onViewSummary={() => handleViewSummary(presentation.id)}
                      onEdit={handleEditPresentation}
                      onDelete={handleDeletePresentation}
                      onDuplicate={handleDuplicatePresentation}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted rounded-lg">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No presentations found
                </h3>
                <p className="text-muted-foreground mb-4">
                  No presentations available for the selected specialty. Check
                  back later for updates.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSpecialties([])}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Test Yourself Section - Moved to Bottom */}
        <div className="mt-16 pt-12 border-t border-border">
          <TestYourself />
        </div>
      </main>

      <SiteFooter />

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
