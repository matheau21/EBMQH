import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { questionsAPI, presentationsAPI, Question } from "@/lib/api";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import PdfHighlightViewer from "@/components/PdfHighlightViewer";
import SiteFooter from "@/components/SiteFooter";
import { Link } from "react-router-dom";
import { useMemo } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function QuizPageInner() {
  const [mode, setMode] = useState<"all" | "specialty" | "presentation">("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedPresentationId, setSelectedPresentationId] = useState<string>("");

  const [pool, setPool] = useState<Question[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState<Question | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);

  // Right-side presentation panel state
  const [showPdfPanel, setShowPdfPanel] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [pptUrl, setPptUrl] = useState<string | undefined>(undefined);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const pptEmbedUrl = useMemo(() => {
    if (!pptUrl) return undefined;
    if (pptUrl.startsWith('blob:')) return pptUrl;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptUrl)}`;
  }, [pptUrl]);

  const { data: specialties } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => presentationsAPI.getSpecialties(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: presentations } = useQuery({
    queryKey: ["presentations-options", selectedSpecialty],
    queryFn: async () => {
      const res = await presentationsAPI.getPresentations({ limit: 100, specialty: selectedSpecialty || undefined });
      return res.presentations || [];
    },
    enabled: mode === "presentation",
  });

  const canFilterByPresentation = useMemo(() => mode === "presentation", [mode]);
  const canFilterBySpecialty = useMemo(() => mode === "specialty" || mode === "presentation", [mode]);

  const loadQuestions = async () => {
    const res = await questionsAPI.list({
      specialty: canFilterBySpecialty && selectedSpecialty ? selectedSpecialty : undefined,
      presentationId: canFilterByPresentation && selectedPresentationId ? selectedPresentationId : undefined,
      limit: 200,
      random: true,
    });
    const list = (res.questions || []).slice();
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setPool(list);
    // Preserve seenIds across filter changes within the same session
    setCurrent(null);
    setSelectedChoiceId("");
    setConfirmed(false);
  };

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedSpecialty, selectedPresentationId]);

  // Persist panel preference
  useEffect(() => {
    sessionStorage.setItem("quiz-show-pdf-panel", String(showPdfPanel));
  }, [showPdfPanel]);

  useEffect(() => {
    if (!current && pool.length) {
      const next = pool.find((q) => !seenIds.has(q.id));
      if (next) setCurrent(next);
    }
  }, [current, pool, seenIds]);

  const exhausted = useMemo(() => pool.length > 0 && pool.every((q) => seenIds.has(q.id)), [pool, seenIds]);

  // Load associated presentation PDF for current question (only when panel is visible)
  useEffect(() => {
    const fetchPdf = async () => {
      if (!showPdfPanel) {
        setPdfUrl(undefined);
        setPdfError(null);
        return;
      }
      if (!current?.presentationId) {
        setPdfUrl(undefined);
        setPdfError(null);
        return;
      }
      setPdfLoading(true);
      setPdfError(null);
      try {
        const res = await presentationsAPI.getFileUrls(current.presentationId);
        setPdfUrl(res.pdfUrl || undefined);
      } catch (_e: any) {
        setPdfUrl(undefined);
        setPdfError(null);
      } finally {
        setPdfLoading(false);
      }
    };
    fetchPdf();
  }, [current?.presentationId, showPdfPanel]);

  const correctChoiceId = current?.choices.find((c) => c.isCorrect)?.id;
  const isCorrect = confirmed && selectedChoiceId && selectedChoiceId === correctChoiceId;

  const onConfirm = () => {
    if (!current || !selectedChoiceId || confirmed) return;
    setConfirmed(true);
    setAnswered((n) => n + 1);
    if (selectedChoiceId === correctChoiceId) setCorrect((n) => n + 1);
  };

  const onNext = () => {
    if (!current) return;
    const newSeen = new Set(seenIds);
    newSeen.add(current.id);
    setSeenIds(newSeen);
    setCurrent(null);
    setSelectedChoiceId("");
    setConfirmed(false);
  };

  const onSkip = () => {
    if (!current) return;
    const newSeen = new Set(seenIds);
    newSeen.add(current.id);
    setSeenIds(newSeen);
    setCurrent(null);
    setSelectedChoiceId("");
    setConfirmed(false);
  };

  const resetSession = () => {
    setAnswered(0);
    setCorrect(0);
    setSeenIds(new Set());
    setCurrent(null);
    setSelectedChoiceId("");
    setConfirmed(false);
  };

  const percent = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="bg-secondary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm">
          <Link to="/" className="text-primary hover:underline">Home</Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Questions</span>
        </div>
      </div>
      {/* Hero */}
      <section className="bg-ucla-blue text-white py-12 dark:bg-card dark:text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Test Yourself</h1>
          <p className="text-blue-100 dark:text-muted-foreground mt-1">Multiple choice questions based on landmark trials.</p>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant={mode === "all" ? "default" : "outline"} onClick={() => { setMode("all"); setSelectedSpecialty(""); setSelectedPresentationId(""); }}>
                All
              </Button>
              <Button variant={mode === "specialty" ? "default" : "outline"} onClick={() => { setMode("specialty"); setSelectedPresentationId(""); }}>
                By Specialty
              </Button>
              <Button variant={mode === "presentation" ? "default" : "outline"} onClick={() => setMode("presentation")}>
                By Presentation
              </Button>
            </div>

            {canFilterBySpecialty && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-700">Specialty</label>
                  <Select value={selectedSpecialty ? selectedSpecialty : "__any__"} onValueChange={(v) => setSelectedSpecialty(v === "__any__" ? "" : v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Any specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__any__">Any</SelectItem>
                      {(specialties?.specialties || []).map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {mode === "presentation" && (
                  <div>
                    <label className="text-sm text-gray-700">Presentation</label>
                    <Select value={selectedPresentationId ? selectedPresentationId : "__any__"} onValueChange={(v) => setSelectedPresentationId(v === "__any__" ? "" : v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={selectedSpecialty ? "Select presentation" : "Select specialty first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__any__">Any</SelectItem>
                        {(presentations || []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Answered: {answered}</Badge>
                <Badge variant="outline">Correct: {correct}</Badge>
                <Badge variant="outline">Accuracy: {percent}%</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetSession}>Reset Session</Button>
                <Button onClick={loadQuestions}>Reload Pool</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{current ? "Question" : exhausted ? "All questions exhausted" : pool.length ? "Select Next" : "Loading questions..."}</CardTitle>
              {current && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowPdfPanel((v) => !v)}>
                    {showPdfPanel ? "Hide Trial Paper" : "Show Trial Paper"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!current && !exhausted && pool.length === 0 && (
              <div className="text-sm text-gray-600">No questions available for this selection.</div>
            )}
            {exhausted && (
              <div className="text-sm text-gray-800">You've answered all questions in this pool. Reload or change filters to continue.</div>
            )}

            {current && (
              <div className={`grid gap-4 ${showPdfPanel ? "grid-cols-1 md:grid-cols-[2fr_3fr]" : "grid-cols-1"}`}>
                {/* Left: Question/answers */}
                <div className="space-y-4">
                  <div>
                    <div className="text-foreground font-medium mb-2">{current.prompt}</div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                      {current.specialty && <Badge variant="secondary">{current.specialty}</Badge>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {current.choices.map((c) => {
                      const isSelected = selectedChoiceId === c.id;
                      const isCorrectChoice = confirmed && c.isCorrect;
                      const isWrongSelected = confirmed && isSelected && !c.isCorrect;
                      return (
                        <button
                          key={c.id}
                          onClick={() => !confirmed && setSelectedChoiceId(c.id)}
                          className={`w-full text-left border rounded px-3 py-2 transition-colors ${
                            isCorrectChoice ? "border-green-600 bg-green-500/10" : isWrongSelected ? "border-red-600 bg-red-500/10" : isSelected ? "border-primary ring-1 ring-primary/20" : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{c.content}</span>
                            {isCorrectChoice && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                            {isWrongSelected && <XCircle className="h-5 w-5 text-red-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {!confirmed ? (
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={onSkip}>Skip</Button>
                      <Button disabled={!selectedChoiceId} onClick={onConfirm}>
                        Confirm
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className={`text-sm font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                        {isCorrect ? "Correct!" : "Incorrect."}
                      </div>
                      {(current.explanation || current.referenceUrl) && (
                        <div className="text-sm text-muted-foreground space-y-1">
                          {current.explanation && <div>{current.explanation}</div>}
                          {current.referenceUrl && (
                            <div>
                              <a className="text-primary underline" href={current.referenceUrl} target="_blank" rel="noreferrer">
                                View referenced study
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex justify-end">
                        <Button onClick={onNext}>
                          Next question <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Collapsible PDF panel */}
                {showPdfPanel && (
                  <div className="min-h-[50vh] md:minh-[70vh] border rounded overflow-hidden border-border">
                    <div className="px-3 py-2 bg-background border-b border-border text-xs font-medium text-foreground">Trial Paper</div>
                    <div className="h-[50vh] md:h-[70vh] bg-background">
                      {pdfLoading ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading trial paper…</div>
                      ) : pdfUrl ? (
                        <PdfHighlightViewer url={pdfUrl} highlights={confirmed ? (current.highlights || []) : []} />
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                          {pdfError ? pdfError : "No trial paper available for this question."}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <SiteFooter />
    </div>
  );
}

const fallbackQueryClient = new QueryClient();

export default function QuizPage() {
  return (
    <QueryClientProvider client={fallbackQueryClient}>
      <QuizPageInner />
    </QueryClientProvider>
  );
}
