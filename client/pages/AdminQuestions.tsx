import { useState } from "react";
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
  const { isAuthenticated } = useAdmin();
  const qc = useQueryClient();

  const { data: specialties } = useQuery({
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
    queryKey: ["admin-questions"],
    queryFn: () => questionsAPI.adminList({ page: 1, limit: 50 }),
    enabled: isAuthenticated,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = {
    prompt: "",
    specialty: "",
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

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const createMutation = useMutation({
    mutationFn: () => questionsAPI.create({
      prompt: form.prompt,
      specialty: form.specialty || undefined,
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
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingId) return Promise.resolve({} as any);
      return questionsAPI.update(editingId, {
        prompt: form.prompt,
        specialty: form.specialty || null,
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
      qc.invalidateQueries({ queryKey: ["admin-questions"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionsAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-questions"] }),
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
      specialty: pres?.specialty || q.specialty || "",
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
            <Label>Specialty</Label>
            <Select value={form.specialty ? form.specialty : "__none__"} onValueChange={(v) => setForm({ ...form, specialty: v === "__none__" ? "" : v })}>
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {(specialties?.specialties || []).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Presentation (optional)</Label>
            <Select value={form.presentationId ? form.presentationId : "__none__"} onValueChange={(v) => {
              const id = v === "__none__" ? "" : v;
              const pres = (presentations || []).find((p: any) => p.id === id);
              setForm({ ...form, presentationId: id, specialty: pres?.specialty || form.specialty });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Link to a presentation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {(presentations || []).map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Reference URL</Label>
            <Input value={form.referenceUrl} onChange={(e) => setForm({ ...form, referenceUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <Label>Explanation (optional)</Label>
            <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} placeholder="Why is this correct?" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: !!v })} />
            <Label>Active</Label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium">Answer Source Highlights (optional)</div>
          <div className="text-xs text-gray-600">Provide phrases to highlight in the linked PDF after the question is answered. Occurrence index = which appearance of the phrase on that page (1 = first, 2 = second, etc.).</div>
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
                  <Input value={h.color || ""} onChange={(e)=>{
                    const val = e.target.value;
                    setForm(prev=>({ ...prev, highlights: prev.highlights.map((hh,i)=> i===idx ? { ...hh, color: val } : hh) }));
                  }} placeholder="#ffff00 or name" />
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
            <Button variant="outline" onClick={()=> setForm(prev=>({ ...prev, highlights: [...prev.highlights, { page: 1, phrase: "", occurrence: 1 }] }))}>Add Highlight</Button>
          </div>
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

        <div className="flex justify-between">
          {editingId ? (
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          ) : <div />}
          <Button
            className="bg-ucla-blue"
            onClick={() => (editingId ? updateMutation.mutate() : createMutation.mutate())}
            disabled={(editingId ? updateMutation.isPending : createMutation.isPending) || !form.prompt.trim() || form.choices.filter((c) => c.content.trim()).length < 2 || !form.choices.some((c) => c.isCorrect)}
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
        <div className="space-y-2">
          {(data?.questions || []).map((q) => (
            <div key={q.id} className="border rounded p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{q.prompt}</div>
                  <div className="text-xs text-gray-600">{q.specialty || "General"} • {q.choices.length} choices</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEdit(q)}>Edit</Button>
                  <Button variant="destructive" onClick={() => deleteMutation.mutate(q.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
