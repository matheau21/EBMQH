import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { questionsAPI, presentationsAPI, Question } from "@/lib/api";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export default function QuizPage() {
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
    setPool(res.questions || []);
    setSeenIds(new Set());
    setCurrent(null);
    setSelectedChoiceId("");
    setConfirmed(false);
  };

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedSpecialty, selectedPresentationId]);

  useEffect(() => {
    if (!current && pool.length) {
      const next = pool.find((q) => !seenIds.has(q.id));
      if (next) setCurrent(next);
    }
  }, [current, pool, seenIds]);

  const exhausted = useMemo(() => pool.length > 0 && pool.every((q) => seenIds.has(q.id)), [pool, seenIds]);

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
    <div className="min-h-screen bg-white">
      <SiteHeader />
      {/* Hero */}
      <section className="bg-ucla-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Test Yourself</h1>
          <p className="text-blue-100 mt-1">Multiple choice questions based on landmark trials.</p>
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
            <CardTitle className="text-lg">{current ? "Question" : exhausted ? "All questions exhausted" : pool.length ? "Select Next" : "Loading questions..."}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!current && !exhausted && pool.length === 0 && (
              <div className="text-sm text-gray-600">No questions available for this selection.</div>
            )}
            {exhausted && (
              <div className="text-sm text-gray-800">You've answered all questions in this pool. Reload or change filters to continue.</div>
            )}

            {current && (
              <div className="space-y-4">
                <div>
                  <div className="text-gray-900 font-medium mb-2">{current.prompt}</div>
                  <div className="text-xs text-gray-500 flex gap-2">
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
                          isCorrectChoice ? "border-green-600 bg-green-50" : isWrongSelected ? "border-red-600 bg-red-50" : isSelected ? "border-ucla-blue" : "hover:bg-gray-50"
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
                  <div className="flex justify-end">
                    <Button disabled={!selectedChoiceId} onClick={onConfirm} className="bg-ucla-blue">
                      Confirm
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={`text-sm font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                      {isCorrect ? "Correct!" : "Incorrect."}
                    </div>
                    {(current.explanation || current.referenceUrl) && (
                      <div className="text-sm text-gray-700 space-y-1">
                        {current.explanation && <div>{current.explanation}</div>}
                        {current.referenceUrl && (
                          <div>
                            <a className="text-ucla-blue underline" href={current.referenceUrl} target="_blank" rel="noreferrer">
                              View referenced study
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button onClick={onNext} className="bg-ucla-blue">
                        Next question <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
