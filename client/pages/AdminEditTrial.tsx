import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { presentationsAPI, checkBackendAvailability } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SPECIALTY_NAMES } from "@/components/SpecialtyFilters";
import ManageFilesDialog from "@/components/ManageFilesDialog";
import SiteHeader from "@/components/SiteHeader";

export default function AdminEditTrial() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState(false);
  const [form, setForm] = useState({
    title: "",
    specialty: "",
    specialties: [] as string[],
    summary: "",
    authors: "",
    journal: "",
    year: "",
    originalArticleUrl: "",
    thumbUrl: "",
    status: "pending" as "pending"|"approved"|"rejected"|"archived",
  });

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const available = await checkBackendAvailability();
        if (!available) {
          setError("Backend not available");
          return;
        }
        const res = await presentationsAPI.adminGet(id);
        const p = res.presentation;
        setForm({
          title: p.title || "",
          specialty: p.specialty || "",
          specialties: (p.specialties || p.specialties_json || p.specialties_list || p.specialties) || (p.specialty ? [p.specialty] : []),
          summary: p.summary || "",
          authors: p.authors || "",
          journal: p.journal || "",
          year: p.year || "",
          originalArticleUrl: p.original_article_url || "",
          thumbUrl: p.thumb_url || "",
          status: (p.status || "pending") as any,
        });
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (!isAuthenticated) return <div className="p-6">Please login.</div>;
  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader showQuickLinks />
      <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Trial</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setOpenFiles(true)}>Manage Files</Button>
          <Button variant="outline" onClick={() => navigate("/admin/dashboard?tab=trials")}>Cancel</Button>
          <Button onClick={async ()=>{
            try {
              if (!id) return;
              await presentationsAPI.updatePresentation(id, {
                title: form.title,
                specialty: form.specialty || (form.specialties[0] || ""),
                specialties: form.specialties,
                summary: form.summary,
                authors: form.authors || undefined,
                journal: form.journal || undefined,
                year: form.year || undefined,
                originalArticleUrl: form.originalArticleUrl || undefined,
                thumbUrl: form.thumbUrl || undefined,
                status: form.status,
              } as any);
              navigate("/admin/dashboard?tab=trials");
            } catch (e:any) {
              setError(e?.message || "Failed to save");
            }
          }} className="bg-ucla-blue">Save</Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="text-sm">Title</label>
          <Input value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} />
        </div>
        <div>
          <label className="text-sm">Specialties</label>
          <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
            {SPECIALTY_NAMES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.specialties.includes(s)}
                  disabled={!form.specialties.includes(s) && (form.specialties?.length || 0) >= 2}
                  onChange={(e) => {
                    setForm((prev) => {
                      const isChecked = e.target.checked;
                      const current = prev.specialties || [];
                      let next = current;
                      if (isChecked) {
                        if (current.length >= 2 && !current.includes(s)) {
                          return prev; // ignore beyond limit
                        }
                        next = Array.from(new Set([...current, s])).slice(0, 2);
                      } else {
                        next = current.filter((x) => x !== s);
                      }
                      return {
                        ...prev,
                        specialties: next,
                        specialty: isChecked
                          ? (prev.specialty || s)
                          : (prev.specialty === s ? (next[0] || "") : prev.specialty),
                      };
                    });
                  }}
                  className="rounded border-ucla-blue text-ucla-blue focus:ring-ucla-blue disabled:opacity-50"
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Primary specialty will default to the first selected.</p>
        </div>
        <div>
          <label className="text-sm">Summary</label>
          <Input value={form.summary} onChange={(e)=>setForm({...form, summary: e.target.value})} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Authors</label>
            <Input value={form.authors} onChange={(e)=>setForm({...form, authors: e.target.value})} />
          </div>
          <div>
            <label className="text-sm">Journal</label>
            <Input value={form.journal} onChange={(e)=>setForm({...form, journal: e.target.value})} />
          </div>
          <div>
            <label className="text-sm">Year</label>
            <Input value={form.year} onChange={(e)=>setForm({...form, year: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="text-sm">Original Article URL</label>
          <Input value={form.originalArticleUrl} onChange={(e)=>setForm({...form, originalArticleUrl: e.target.value})} />
        </div>
        <div>
          <label className="text-sm">Thumbnail URL</label>
          <Input value={form.thumbUrl} onChange={(e)=>setForm({...form, thumbUrl: e.target.value})} />
        </div>
        <div>
          <label className="text-sm">Status</label>
          <Select value={form.status} onValueChange={(v)=>setForm({...form, status: v as any})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">pending</SelectItem>
              <SelectItem value="approved">approved</SelectItem>
              <SelectItem value="rejected">rejected</SelectItem>
              <SelectItem value="archived">archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ManageFilesDialog presentationId={id!} open={openFiles} onOpenChange={setOpenFiles} />
      </div>
    </div>
  );
}
