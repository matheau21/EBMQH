import { useState, useMemo, useEffect } from "react";
import { PresentationCard } from "@/components/PresentationCard";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { SpecialtyFilters } from "@/components/SpecialtyFilters";
import { UploadModal } from "@/components/UploadModal";
import { PublishButton } from "@/components/PublishButton";
import { useAdmin } from "@/contexts/AdminContext";
import { usePublish } from "@/contexts/PublishContext";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { presentationsAPI } from "@/lib/api";
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
  "Neurology",
];

export default function AllPresentations() {
  const { isAdminMode } = useAdmin();
  const { markAsChanged } = usePublish();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingPresentation, setEditingPresentation] =
    useState<Presentation | null>(null);

  // Fetch presentations and specialties from API
  const { data: apiData, isLoading } = useQuery({
    queryKey: ["all-presentations"],
    queryFn: () => presentationsAPI.getPresentations({ limit: 100 }),
    staleTime: 30000,
  });
  const { data: specData } = useQuery({
    queryKey: ["public-specialties"],
    queryFn: () => presentationsAPI.getSpecialties(),
    staleTime: 300000,
  });

  useEffect(() => {
    if (apiData?.presentations) setPresentations(apiData.presentations as any);
  }, [apiData]);

  // Sort/group controls
  const [sortBy, setSortBy] = useState<"createdAt"|"journal"|"year"|"title">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("desc");
  const [groupBySpecialty, setGroupBySpecialty] = useState(false);

  const filteredPresentations = useMemo(() => {
    const base = presentations.filter((presentation) => {
      const matchesSearch =
        searchQuery === "" ||
        presentation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        presentation.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        presentation.authors?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        selectedSpecialties.length === 0 ||
        selectedSpecialties.includes(presentation.specialty) ||
        (Array.isArray(presentation.specialties) && presentation.specialties.some(s => selectedSpecialties.includes(s)));

      return matchesSearch && matchesSpecialty;
    });

    const sorted = [...base].sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "createdAt") {
        return (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()) * dir;
      }
      if (sortBy === "year") {
        const ay = parseInt(a.year || "0");
        const by = parseInt(b.year || "0");
        return (ay - by) * dir;
      }
      if (sortBy === "journal") {
        return ((a.journal || "").localeCompare(b.journal || "")) * dir;
      }
      if (sortBy === "title") {
        return (a.title.localeCompare(b.title)) * dir;
      }
      return 0;
    });

    return sorted;
  }, [searchQuery, selectedSpecialties, presentations, sortBy, sortOrder]);

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
    const presentation = presentations.find((p) => p.id === id);
    if (presentation) {
      setEditingPresentation(presentation);
      setShowUploadModal(true);
    }
  };

  const handleDeletePresentation = (id: string) => {
    if (window.confirm("Are you sure you want to delete this presentation?")) {
      setPresentations((prev) => prev.filter((p) => p.id !== id));
      markAsChanged();
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
      markAsChanged();
      console.log("Duplicated presentation:", id);
    }
  };

  const handleToggleFeatured = (id: string) => {
    console.log("Toggle featured status:", id);
  };

  const handleUploadSubmit = (data: PresentationData) => {
    if (editingPresentation) {
      // Update existing presentation
      const updatedPresentation: Presentation = {
        ...editingPresentation,
        title: data.trialName,
        specialty: data.subspecialty[0] || editingPresentation.specialty,
        summary: data.briefDescription,
        journal: data.journalSource,
        // Convert files to URLs if needed
        presentationFileUrl: data.file
          ? URL.createObjectURL(data.file)
          : editingPresentation.presentationFileUrl,
        originalArticleUrl: data.originalArticle
          ? URL.createObjectURL(data.originalArticle)
          : editingPresentation.originalArticleUrl,
      };

      setPresentations((prev) =>
        prev.map((p) =>
          p.id === editingPresentation.id ? updatedPresentation : p,
        ),
      );
      markAsChanged();
      setEditingPresentation(null);

      // Add files to media library
      addPresentationFilesToMediaLibrary(
        data.file,
        data.originalArticle,
        data.trialName,
      );
    } else {
      // Add new presentation
      const newPresentation: Presentation = {
        id: Date.now().toString(),
        title: data.trialName,
        specialty: data.subspecialty[0] || "General Internal Medicine",
        summary: data.briefDescription,
        journal: data.journalSource,
        year: new Date().getFullYear().toString(),
        viewerCount: 0,
        presentationFileUrl: data.file
          ? URL.createObjectURL(data.file)
          : undefined,
        originalArticleUrl: data.originalArticle
          ? URL.createObjectURL(data.originalArticle)
          : undefined,
      };

      setPresentations((prev) => [newPresentation, ...prev]);
      markAsChanged();

      // Add files to media library
      addPresentationFilesToMediaLibrary(
        data.file,
        data.originalArticle,
        data.trialName,
      );
    }
    setShowUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader showQuickLinks />
      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm">
          <Link to="/" className="text-primary hover:underline">Home</Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">All Presentations</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search and Filter */}
        <div className="mb-8">
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
            availableSpecialties={(specData?.specialties as string[]) || []}
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
        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Showing {filteredPresentations.length} of {presentations.length} presentations
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="w-48">
              <label className="text-xs text-muted-foreground">Sort by</label>
              <Select value={sortBy} onValueChange={(v)=>setSortBy(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date submitted</SelectItem>
                  <SelectItem value="journal">Journal</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <label className="text-xs text-muted-foreground">Order</label>
              <Select value={sortOrder} onValueChange={(v)=>setSortOrder(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mr-2">Group by specialty</label>
              <input type="checkbox" checked={groupBySpecialty} onChange={(e)=>setGroupBySpecialty(e.target.checked)} />
            </div>
            {(searchQuery || selectedSpecialties.length > 0) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSpecialties([]);
                }}
                className="text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Presentations Grid */}
        {isLoading ? (
          <div>Loading…</div>
        ) : filteredPresentations.length > 0 ? (
          groupBySpecialty ? (
            <div className="space-y-8">
              {Object.entries(
                filteredPresentations.reduce((acc: Record<string, Presentation[]>, p) => {
                  (acc[p.specialty] = acc[p.specialty] || []).push(p);
                  return acc;
                }, {})
              ).map(([spec, list]) => (
                <div key={spec}>
                  <h3 className="text-lg font-semibold mb-3">{spec}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {list.map((presentation) => (
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
                        presentationFileUrl={presentation.presentationFileUrl}
                        originalArticleUrl={presentation.originalArticleUrl}
                        onViewSummary={() => handleViewSummary(presentation.id)}
                        onEdit={handleEditPresentation}
                        onDelete={handleDeletePresentation}
                        onDuplicate={handleDuplicatePresentation}
                        onToggleFeatured={handleToggleFeatured}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  presentationFileUrl={presentation.presentationFileUrl}
                  originalArticleUrl={presentation.originalArticleUrl}
                  onViewSummary={() => handleViewSummary(presentation.id)}
                  onEdit={handleEditPresentation}
                  onDelete={handleDeletePresentation}
                  onDuplicate={handleDuplicatePresentation}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 text-muted-foreground mx-auto mb-4">📚</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No presentations found
            </h3>
            <p className="text-muted-foreground mb-4">
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

      <SiteFooter />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setEditingPresentation(null);
        }}
        onSubmit={handleUploadSubmit}
        initialData={
          editingPresentation
            ? {
                trialName: editingPresentation.title,
                briefDescription: editingPresentation.summary,
                subspecialty: [editingPresentation.specialty],
                journalSource: editingPresentation.journal || "",
                file: null, // Files can't be reconstructed from URLs
                originalArticle: null,
                thumbnail: null,
              }
            : undefined
        }
      />
    </div>
  );
}
