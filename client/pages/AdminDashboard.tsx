import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsersAPI, presentationsAPI } from "@/lib/api";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import AdminUsers from "./AdminUsers";
import ManageFilesDialog from "@/components/ManageFilesDialog";
import FileDropzone from "@/components/FileDropzone";
import { SPECIALTY_NAMES } from "@/components/SpecialtyFilters";

function TrialRow({ p, onApprove }: { p: any; onApprove: (status: "approved"|"rejected") => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between border rounded px-3 py-2">
      <div>
        <div className="font-medium">{p.title}</div>
        <div className="text-xs text-gray-500">{p.specialty} • {p.status || "approved"}</div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setOpen(true)}>Manage Files</Button>
        {p.status !== "approved" && (
          <Button variant="outline" onClick={() => onApprove("approved")}>Approve</Button>
        )}
        {p.status !== "rejected" && (
          <Button variant="outline" onClick={() => onApprove("rejected")}>Reject</Button>
        )}
      </div>
      <ManageFilesDialog presentationId={p.id} open={open} onOpenChange={setOpen} />
    </div>
  );
}

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAdmin();
  const qc = useQueryClient();
  const [newTrial, setNewTrial] = useState({ title: "", specialty: "", summary: "", authors: "", journal: "", year: "" });
  const [newPdf, setNewPdf] = useState<File | null>(null);
  const [newPpt, setNewPpt] = useState<File | null>(null);

  const { data: specialtiesData } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => presentationsAPI.getSpecialties(),
  });

  const { data: trials, refetch } = useQuery({
    queryKey: ["admin-trials"],
    queryFn: () => presentationsAPI.adminList({ limit: 20 }),
    enabled: isAuthenticated,
  });

  const { data: pending } = useQuery({
    queryKey: ["admin-trials-pending"],
    queryFn: () => presentationsAPI.adminList({ status: "pending", limit: 50 }),
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const resp = await presentationsAPI.createPresentation({
        id: "" as any,
        title: newTrial.title,
        specialty: newTrial.specialty,
        summary: newTrial.summary,
        authors: newTrial.authors || undefined,
        journal: newTrial.journal || undefined,
        year: newTrial.year || undefined,
        thumbnail: undefined,
        viewerCount: 0,
        originalArticleUrl: undefined,
        createdAt: "" as any,
        updatedAt: "" as any,
        createdBy: undefined,
        user: undefined,
        presentationFileUrl: undefined,
      } as any);
      const created = (resp as any).presentation || resp;
      if (created?.id) {
        if (newPdf) await presentationsAPI.uploadFile(created.id, newPdf);
        if (newPpt) await presentationsAPI.uploadFile(created.id, newPpt);
      }
      return created;
    },
    onSuccess: () => {
      setNewTrial({ title: "", specialty: "", summary: "", authors: "", journal: "", year: "" });
      setNewPdf(null);
      setNewPpt(null);
      qc.invalidateQueries({ queryKey: ["admin-trials"] });
      qc.invalidateQueries({ queryKey: ["admin-trials-pending"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) => presentationsAPI.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-trials"] });
      qc.invalidateQueries({ queryKey: ["admin-trials-pending"] });
    },
  });

  if (!isAuthenticated) return <div className="p-6">Please login.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-ucla-blue mb-4">Admin Dashboard</h1>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="trials">Trials</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <AdminUsers />
        </TabsContent>

        <TabsContent value="trials" className="mt-4 space-y-6">
          <div className="border rounded p-4 space-y-3">
            <h2 className="font-medium">Create Trial/Presentation</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Title</label>
                <Input value={newTrial.title} onChange={(e) => setNewTrial({ ...newTrial, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Specialty</label>
                <Select onValueChange={(val)=>{
                  if (val === "__new__") {
                    setNewTrial({ ...newTrial, specialty: "" });
                  } else {
                    setNewTrial({ ...newTrial, specialty: val });
                  }
                }} value={newTrial.specialty || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {(specialtiesData?.specialties || []).map((s: string) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                    <SelectItem value="__new__">+ Add new specialty…</SelectItem>
                  </SelectContent>
                </Select>
                {newTrial.specialty === "" && (
                  <Input className="mt-2" placeholder="Enter new specialty" value={newTrial.specialty} onChange={(e)=>setNewTrial({ ...newTrial, specialty: e.target.value })} />
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm">Summary</label>
                <Input value={newTrial.summary} onChange={(e) => setNewTrial({ ...newTrial, summary: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Authors</label>
                <Input value={newTrial.authors} onChange={(e) => setNewTrial({ ...newTrial, authors: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Journal</label>
                <Input value={newTrial.journal} onChange={(e) => setNewTrial({ ...newTrial, journal: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Year</label>
                <Input value={newTrial.year} onChange={(e) => setNewTrial({ ...newTrial, year: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              <div>
                <label className="text-sm">Attach PDF (optional)</label>
                <FileDropzone accept={["pdf"]} onFile={(f)=>setNewPdf(f)} />
                {newPdf && <div className="text-xs text-gray-600 mt-1">Selected: {newPdf.name}</div>}
              </div>
              <div>
                <label className="text-sm">Attach PPT/PPTX (optional)</label>
                <FileDropzone accept={["ppt","pptx"]} onFile={(f)=>setNewPpt(f)} />
                {newPpt && <div className="text-xs text-gray-600 mt-1">Selected: {newPpt.name}</div>}
              </div>
            </div>
            <Button className="bg-ucla-blue mt-3" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !newTrial.title || !(newTrial.specialty && newTrial.specialty.trim()) || !newTrial.summary}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>

          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">All Trials</h2>
            <div className="space-y-2">
              {trials?.presentations?.map((p: any) => (
                <TrialRow key={p.id} p={p} onApprove={(status) => approveMutation.mutate({ id: p.id, status })} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <div className="space-y-2">
            {pending?.presentations?.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between border rounded px-3 py-2">
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.specialty} • pending</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => approveMutation.mutate({ id: p.id, status: "approved" })}>Approve</Button>
                  <Button variant="outline" onClick={() => approveMutation.mutate({ id: p.id, status: "rejected" })}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
