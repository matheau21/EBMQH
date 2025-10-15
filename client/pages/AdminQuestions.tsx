import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsAPI, presentationsAPI } from "@/lib/api";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminQuestions() {
  const { isAuthenticated, user } = useAdmin();
  const qc = useQueryClient();

  // Specialty selection removed; questions now derive specialty from selected presentation
  const { data: specialtyData } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => presentationsAPI.getSpecialties(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: presentations } = useQuery({
    queryKey: ["presentations", { limit: 100 }],
    queryFn: async () => {
      const res = await presentationsAPI.getPresentations({ limit: 100 });
      return res.presentations || [];
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["questions", user?.role],
    queryFn: async () => {
      if (user?.role === "user") {
        const res = await questionsAPI.myList();
        return { questions: res.questions, pagination: { page: 1, limit: res.questions.length, total: res.questions.length, pages: 1 } } as any;
      }
      return questionsAPI.adminList({ page: 1, limit: 50 });
    },
    enabled: isAuthenticated,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");
  const [filterPresentation, setFilterPresentation] = useState<string>("all");

  const initialForm = {
    prompt: "",
    presentationId: "",
    explanation: "",
    referenceUrl: "",
    isActive: true,
    highlights: [] as Array<{ page: number; phrase: string; occurrence?: number; color?: string; note?: string }>,
    choices: [
      { content: "", isCorrect: true },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
      { content: "", isCorrect: false },
    ] as Array<{ content: string; isCorrect: boolean }>,
  };
  const [form, setForm] = useState(initialForm);

  // Fetch PDF URL for selected presentation to enable highlights workflow
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      if (!form.presentationId) {
        setPdfUrl(undefined);
        setPdfError(null);
        return;
      }
      setPdfLoading(true);
      setPdfError(null);
      try {
        const res = await presentationsAPI.getFileUrls(form.presentationId);
        setPdfUrl(res.pdfUrl || undefined);
      } catch (_e) {
        setPdfUrl(undefined);
        setPdfError(null);
      } finally {
        setPdfLoading(false);
      }
    };
    fetchPdf();
  }, [form.presentationId]);

  // Derived maps and grouping for existing questions
  const presMap = useMemo(() => {
    const m: Record<string, any> = {};
    for (const p of (presentations || [])) m[p.id] = p;
    return m;
  }, [presentations]);

  const filteredQuestions = useMemo(() => {
    const list = (data?.questions || []) as any[];
    return list.filter((q) => {
      if (filterPresentation !== "all" && q.presentationId !== filterPresentation) return false;
      if (filterSpecialty !== "all") {
        const p = q.presentationId ? presMap[q.presentationId] : null;
        const presSpecs: string[] = Array.from(new Set([p?.specialty, ...((p?.specialties as string[]) || [])].filter(Boolean)));
        const matchesPres = p ? presSpecs.includes(filterSpecialty) : false;
        const matchesLegacy = (q.specialty || "") === filterSpecialty;
        if (!(matchesPres || matchesLegacy)) return false;
      }
      return true;
    });
  }, [data?.questions, filterPresentation, filterSpecialty, presMap]);

  const grouped = useMemo(() => {
    const by: Record<string, any[]> = {};
    for (const q of filteredQuestions) {
      const key = q.presentationId || "__unlinked__";
      (by[key] ||= []).push(q);
    }
    const order = Object.keys(by);
    return order.map((key) => {
      const p = key === "__unlinked__" ? null : presMap[key];
      const title = p ? p.title : "Unlinked Questions";
      const specs: string[] = p ? Array.from(new Set([p?.specialty, ...((p?.specialties as string[]) || [])].filter(Boolean))) : [];
      return { key, title, specs, items: by[key] };
    });
  }, [filteredQuestions, presMap]);

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const createMutation = useMutation({
    mutationFn: () => questionsAPI.create({
      prompt: form.prompt,
      presentationId: form.presentationId || undefined,
      explanation: form.explanation || undefined,
      referenceUrl: form.referenceUrl || undefined,
      isActive: form.isActive,
      choices: form.choices.filter((c) => c.content.trim().length > 0),
      highlights: (form.highlights || []).filter(h => h.phrase && h.page && h.page > 0).map(h => ({
        page: Number(h.page),
        phrase: h.phrase,
        occurrence: h.occurrence ? Number(h.occurrence) : undefined,
        color: h.color || undefined,
        note: h.note || undefined,
      })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingId) return Promise.resolve({} as any);
      return questionsAPI.update(editingId, {
        prompt: form.prompt,
        presentationId: form.presentationId || null,
        explanation: form.explanation || null,
        referenceUrl: form.referenceUrl || null,
        isActive: form.isActive,
        choices: form.choices.filter((c) => c.content.trim().length > 0),
        highlights: (form.highlights || []).filter(h => h.phrase && h.page && h.page > 0).map(h => ({
          page: Number(h.page),
          phrase: h.phrase,
          occurrence: h.occurrence ? Number(h.occurrence) : undefined,
          color: h.color || undefined,
          note: h.note || undefined,
        })),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionsAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });

  const setCorrectIndex = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      choices: prev.choices.map((c, i) => ({ ...c, isCorrect: i === idx })),
    }));
  };

  const addChoice = () => {
    setForm((prev) => ({
      ...prev,
      choices: prev.choices.length < 8 ? [...prev.choices, { content: "", isCorrect: false }] : prev.choices,
    }));
  };

  const removeChoice = (idx: number) => {
    setForm((prev) => {
      const next = prev.choices.filter((_, i) => i !== idx);
      if (!next.some((c) => c.isCorrect) && next.length > 0) next[0].isCorrect = true;
      return { ...prev, choices: next };
    });
  };

  const handleEdit = (q: any) => {
    const pres = (presentations || []).find((p: any) => p.id === q.presentationId);
    setEditingId(q.id);
    setForm({
      prompt: q.prompt,
      presentationId: q.presentationId || "",
      explanation: q.explanation || "",
      referenceUrl: q.referenceUrl || "",
      isActive: q.isActive,
      highlights: (q.highlights || []) as any,
      choices: (q.choices || []).map((c: any) => ({ content: c.content, isCorrect: !!c.isCorrect })),
    });
  };

  if (!isAuthenticated) return <div className="p-4">Please login as admin.</div>;

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg space-y-3">
        <h2 className="font-medium">{editingId ? "Edit Question" : "Create Question"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label>Prompt</Label>
            <Textarea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} placeholder="Enter question" />
          </div>
          <div>
            <Label>Presentation</Label>
            <Select value={form.presentationId ? form.presentationId : "__none__"} onValueChange={(v) => {
              const id = v === "__none__" ? "" : v;
              setForm({ ...form, presentationId: id });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a presentation (required)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {(presentations || []).map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.presentationId && (() => {
              const p = (presentations || []).find((x: any) => x.id === form.presentationId);
              const specs = Array.from(new Set([p?.specialty, ...((p?.specialties as string[]) || [])].filter(Boolean)));
              return specs.length ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {specs.map((s: string) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded border bg-yellow-50 border-yellow-200 text-gray-700">{s}</span>
                  ))}
                </div>
              ) : null;
            })()}
          </div>
          <div>
            <Label>Reference URL</Label>
            <Input value={form.referenceUrl} onChange={(e) => setForm({ ...form, referenceUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <Label>Explanation (optional)</Label>
            <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Why is this correct?" />
          </div>
          {user?.role !== "user" && (
            <div className="flex items-center gap-2">
              <Checkbox checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: !!v })} />
              <Label>Active</Label>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="font-medium">Choices (up to 8)</div>
          {form.choices.map((c, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                className="h-4 w-4"
                checked={c.isCorrect}
                onChange={() => setCorrectIndex(idx)}
                aria-label={`Mark choice ${idx + 1} correct`}
              />
              <Input
                value={c.content}
                onChange={(e) => setForm({ ...form, choices: form.choices.map((cc, i) => i === idx ? { ...cc, content: e.target.value } : cc) })}
                placeholder={`Choice ${idx + 1}`}
              />
              {form.choices.length > 2 && (
                <Button variant="outline" onClick={() => removeChoice(idx)}>Remove</Button>
              )}
            </div>
          ))}
          {form.choices.length < 8 && (
            <Button variant="outline" onClick={addChoice}>Add Choice</Button>
          )}
        </div>

        <div className="space-y-2 mt-4">
          <div className="font-medium">Answer Source Highlights (optional)</div>
          <div className="text-xs text-gray-600">Provide phrases to highlight in the linked PDF after the question is answered. Occurrence index = which appearance of the phrase on that page (1 = first, 2 = second, etc.).</div>

          {!form.presentationId ? (
            <div className="text-xs text-gray-600">Select a presentation to enable PDF highlights.</div>
          ) : pdfLoading ? (
            <div className="text-xs text-gray-600">Loading PDF…</div>
          ) : !pdfUrl ? (
            <div className="text-xs text-red-600">No PDF found for the selected presentation. Highlights are disabled.</div>
          ) : null}

          {/* Highlights editor */}
          <div className="space-y-2">
            {(form.highlights || []).map((h, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Page</Label>
                  <Input type="number" min={1} value={h.page ?? 1} onChange={(e)=>{
                    const val = Number(e.target.value);
                    setForm(prev=>({ ...prev, highlights: prev.highlights.map((hh,i)=> i===idx ? { ...hh, page: val } : hh) }));
                  }} />
                </div>
                <div className="sm:col-span-5">
                  <Label className="text-xs">Exact phrase</Label>
                  <Input value={h.phrase || ""} onChange={(e)=>{
                    const val = e.target.value;
                    setForm(prev=>({ ...prev, highlights: prev.highlights.map((hh,i)=> i===idx ? { ...hh, phrase: val } : hh) }));
                  }} placeholder="Copy the exact text to highlight" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Occurrence</Label>
                  <Input type="number" min={1} value={h.occurrence ?? 1} onChange={(e)=>{
                    const val = Number(e.target.value);
                    setForm(prev=>({ ...prev, highlights: prev.highlights.map((hh,i)=> i===idx ? { ...hh, occurrence: val } : hh) }));
                  }} />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-2 items-center">
                    {[
                      { name: "Yellow", value: "#fff59d" },
                      { name: "Green", value: "#a5d6a7" },
                      { name: "Blue", value: "#90caf9" },
                      { name: "Orange", value: "#ffcc80" },
                      { name: "Pink", value: "#f8bbd0" },
                    ].map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={`h-6 w-6 rounded border ${ (h.color || "#fff59d") === c.value ? "ring-2 ring-black" : ""}`}
                        style={{ backgroundColor: c.value }}
                        onClick={() => setForm(prev=>({ ...prev, highlights: prev.highlights.map((hh,i)=> i===idx ? { ...hh, color: c.value } : hh) }))}
                        aria-label={c.name}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <Button variant="outline" onClick={()=> setForm(prev=>({ ...prev, highlights: prev.highlights.filter((_,i)=>i!==idx) }))}>Remove</Button>
                </div>
                <div className="sm:col-span-12">
                  <Label className="text-xs">Note (optional)</Label>
                  <Input value={h.note || ""} onChange={(e)=>{
                    const val = e.target.value;
                    setForm(prev=>({ ...prev, highlights: prev.highlights.map((hh,i)=> i===idx ? { ...hh, note: val } : hh) }));
                  }} placeholder="Short explanation shown with highlight" />
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={()=> setForm(prev=>({ ...prev, highlights: [...prev.highlights, { page: 1, phrase: "", occurrence: 1, color: "#fff59d" }] }))} disabled={!pdfUrl}>Add Highlight</Button>
            {!pdfUrl && form.presentationId && !pdfLoading && (
              <div className="text-xs text-gray-600">Attach a PDF to this presentation to enable highlights.</div>
            )}
          </div>

          {/* PDF Preview & planned highlight preview (textual list) */}
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="text-xs text-gray-700 space-y-1">
              <div className="font-medium">Preview (planned)</div>
              {(form.highlights || []).length === 0 ? (
                <div>No highlights added.</div>
              ) : (
                <ul className="list-disc ml-4">
                  {(form.highlights || []).map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: h.color || "#fff59d" }} />
                      <span>Page {h.page}: “{h.phrase}” {h.occurrence ? `(occ ${h.occurrence})` : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border rounded overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b text-xs flex items-center justify-between">
                <span>Reference PDF</span>
                {pdfUrl && <a className="text-ucla-blue underline" href={pdfUrl} target="_blank" rel="noreferrer">Open PDF</a>}
              </div>
              <div className="h-[50vh] bg-white">
                {pdfUrl ? (
                  <iframe src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`} title="Reference PDF" className="w-full h-full" />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-600">PDF unavailable</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          {editingId ? (
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          ) : <div />}
          <Button
            className="bg-ucla-blue"
            onClick={() => (editingId ? updateMutation.mutate() : createMutation.mutate())}
            disabled={(editingId ? updateMutation.isPending : createMutation.isPending) || !form.presentationId || !form.prompt.trim() || form.choices.filter((c) => c.content.trim()).length < 2 || !form.choices.some((c) => c.isCorrect)}
          >
            {editingId ? (updateMutation.isPending ? "Updating..." : "Update") : (createMutation.isPending ? "Creating..." : "Create")}
          </Button>
        </div>
        {(createMutation.error || updateMutation.error) && (
          <div className="text-sm text-red-600">{((createMutation.error || updateMutation.error) as any).message || "Error"}</div>
        )}
      </div>

      <div className="p-4 border rounded-lg">
        <h2 className="font-medium mb-3">Existing Questions</h2>
        {isLoading && <div>Loading...</div>}
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="w-56">
            <Label className="text-xs text-gray-600">Filter by Specialty</Label>
            <Select value={filterSpecialty} onValueChange={(v)=>setFilterSpecialty(v)}>
              <SelectTrigger>
                <SelectValue placeholder="All specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {(specialtyData?.specialties || []).map((s: string) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-72">
            <Label className="text-xs text-gray-600">Filter by Trial</Label>
            <Select value={filterPresentation} onValueChange={(v)=>setFilterPresentation(v)}>
              <SelectTrigger>
                <SelectValue placeholder="All trials" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {(presentations || []).map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          {grouped.map((g)=> (
            <div key={g.key} className="border rounded">
              <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
                <div className="font-medium truncate" title={g.title}>{g.title}</div>
                <div className="flex flex-wrap gap-1 ml-2">
                  {g.specs.map((s: string)=> (
                    <span key={s} className="text-xs px-2 py-0.5 rounded border bg-yellow-50 border-yellow-200 text-gray-700">{s}</span>
                  ))}
                </div>
              </div>
              <div className="p-3 space-y-2">
                {g.items.map((q:any)=> (
                  <div key={q.id} className="flex items-start justify-between gap-3 border rounded p-2">
                    <div>
                      <div className="font-medium">{q.prompt}</div>
                      <div className="text-xs text-gray-600">{(q as any).status || "approved"} • {q.choices.length} choices</div>
                    </div>
                    <div className="flex gap-2">
                      {(user?.role !== "user" || (q as any).status === "pending") && (
                        <Button variant="outline" onClick={() => handleEdit(q)}>Edit</Button>
                      )}
                      {user?.role !== "user" && (
                        <Button variant="destructive" onClick={() => deleteMutation.mutate(q.id)}>Delete</Button>
                      )}
                    </div>
                  </div>
                ))}
                {g.items.length === 0 && (
                  <div className="text-sm text-gray-600">No questions.</div>
                )}
              </div>
            </div>
          ))}
          {grouped.length === 0 && (
            <div className="text-sm text-gray-600">No questions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
