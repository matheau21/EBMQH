import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminUsersAPI,
  presentationsAPI,
  checkBackendAvailability,
  getToken,
  adminAuthAPI,
  questionsAPI,
} from "@/lib/api";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import AdminUsers from "./AdminUsers";
import AdminQuestions from "./AdminQuestions";
import ManageFilesDialog from "@/components/ManageFilesDialog";
import FileDropzone from "@/components/FileDropzone";
import { SPECIALTY_NAMES } from "@/components/SpecialtyFilters";
import PresentationFilesViewer from "@/components/PresentationFilesViewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";

import { useNavigate, useLocation } from "react-router-dom";
import { siteAPI } from "@/lib/api";
function TrialRow({
  p,
  onApprove,
}: {
  p: any;
  onApprove: (status: "approved" | "rejected" | "pending") => void;
}) {
  const [open, setOpen] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const status: "approved" | "rejected" | "pending" | "archived" =
    p.status || "approved";
  const { user } = useAdmin();
  const isAdmin = user?.role !== "user";
  const containerCls = `flex items-center justify-between border rounded px-3 py-2 ${
    status === "rejected"
      ? "bg-gray-50 border-gray-200 dark:bg-slate-900 dark:border-slate-700"
      : status === "pending"
        ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900"
        : "bg-white dark:bg-slate-800"
  }`;
  return (
    <div className={containerCls}>
      <div
        className="min-w-0 cursor-pointer"
        onClick={() => setShowPreview(true)}
        title="Preview public view"
      >
        <div
          className={`font-medium ${status === "rejected" ? "text-gray-500 dark:text-slate-400" : "hover:underline"}`}
        >
          {p.title}
        </div>
        <div
          className={`text-xs ${status === "rejected" ? "text-gray-400 dark:text-slate-500" : "text-gray-500 dark:text-slate-400"}`}
        >
          {p.specialty} • {status}
          {(status === "approved" || status === "archived") && (
            <span className="ml-2 inline-flex items-center gap-1 align-middle">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (p.pdf_path) setShowViewer(true);
                }}
                className={`px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${p.pdf_path ? "text-green-700 border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer dark:text-green-300 dark:border-green-900 dark:bg-green-950 dark:hover:bg-green-900" : "text-gray-500 border-gray-200 bg-gray-50 cursor-not-allowed dark:text-slate-400 dark:border-slate-700 dark:bg-slate-900"}`}
                title={p.pdf_path ? "Open PDF" : "No PDF"}
                disabled={!p.pdf_path}
              >
                PDF {p.pdf_path ? "✓" : "–"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (p.ppt_path) setShowViewer(true);
                }}
                className={`px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${p.ppt_path ? "text-green-700 border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer dark:text-green-300 dark:border-green-900 dark:bg-green-950 dark:hover:bg-green-900" : "text-gray-500 border-gray-200 bg-gray-50 cursor-not-allowed dark:text-slate-400 dark:border-slate-700 dark:bg-slate-900"}`}
                title={p.ppt_path ? "Open PPT" : "No PPT"}
                disabled={!p.ppt_path}
              >
                PPT {p.ppt_path ? "✓" : "–"}
              </button>
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status === "approved" && (
          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900">
            Live
          </span>
        )}
        {status === "rejected" && (
          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700">
            Rejected
          </span>
        )}
        {status === "pending" && (
          <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900">
            Pending
          </span>
        )}
        {status === "archived" && (
          <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 border border-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
            Archived
          </span>
        )}
        {isAdmin || status === "pending" ? (
          <Button variant="outline" onClick={() => setOpen(true)}>
            Manage Files
          </Button>
        ) : null}
        {(isAdmin || status === "pending") && (
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/trials/${p.id}`)}
          >
            Edit
          </Button>
        )}
        {isAdmin && status === "pending" && (
          <>
            <Button variant="outline" onClick={() => onApprove("approved")}>
              Approve
            </Button>
            <Button variant="outline" onClick={() => onApprove("rejected")}>
              Reject
            </Button>
          </>
        )}
        {status === "rejected" && (
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/trials/${p.id}`)}
          >
            Re-review
          </Button>
        )}
        {isAdmin && status === "approved" && (
          <Button
            variant="outline"
            onClick={async () => {
              if (
                !window.confirm(
                  "Archive this submission? It will no longer be displayed.",
                )
              )
                return;
              await presentationsAPI.updateStatus(p.id, "archived");
              qc.invalidateQueries({ queryKey: ["admin-trials"] });
              qc.invalidateQueries({ queryKey: ["admin-trials-pending"] });
            }}
          >
            Archive
          </Button>
        )}
        {isAdmin && (
          <Button
            variant="destructive"
            onClick={async () => {
              if (
                !window.confirm(
                  "Delete this submission permanently? This cannot be undone.",
                )
              )
                return;
              await presentationsAPI.deletePresentation(p.id);
              qc.invalidateQueries({ queryKey: ["admin-trials"] });
              qc.invalidateQueries({ queryKey: ["admin-trials-pending"] });
            }}
          >
            Delete
          </Button>
        )}
      </div>
      <ManageFilesDialog
        presentationId={p.id}
        open={open}
        onOpenChange={setOpen}
      />

      <PresentationFilesViewer
        isOpen={showViewer}
        onClose={() => setShowViewer(false)}
        presentationId={p.id}
        title={p.title}
      />

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Public Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-lg font-semibold">{p.title}</div>
            <div className="text-sm text-gray-600 dark:text-slate-400">
              {p.specialty}
              {p.year ? ` • ${p.year}` : ""}
            </div>
            {p.summary && (
              <div className="text-sm text-gray-700 dark:text-slate-300">{p.summary}</div>
            )}
            {(p.authors || p.journal) && (
              <div className="text-xs text-gray-500 dark:text-slate-400">
                {p.authors && <div className="font-medium">{p.authors}</div>}
                {p.journal && <div>{p.journal}</div>}
              </div>
            )}
            <div className="pt-2 flex items-center gap-2">
              <Button
                className="bg-ucla-blue text-white"
                onClick={() => {
                  setShowViewer(true);
                }}
              >
                View Files
              </Button>
              {(isAdmin || status === "pending") && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/trials/${p.id}`)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import SiteHeader from "@/components/SiteHeader";

function SiteEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("About EBM Quick Hits");
  const [subtitle, setSubtitle] = useState<string | "">("");
  const [sections, setSections] = useState<
    Array<{ heading: string; body: string }>
  >([]);
  const [refUrl, setRefUrl] = useState<string>("");
  const [refPath, setRefPath] = useState<string>("");
  const [currUrl, setCurrUrl] = useState<string>("");
  const [currPath, setCurrPath] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [allApproved, setAllApproved] = useState<any[]>([]);
  const [savingFeatured, setSavingFeatured] = useState(false);

  const [contactTitle, setContactTitle] = useState("Contact Us");
  const [contactBody, setContactBody] = useState("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [savingContact, setSavingContact] = useState(false);

  const [privacyTitle, setPrivacyTitle] = useState("Privacy Policy");
  const [privacySubtitle, setPrivacySubtitle] = useState<string>("");
  const [privacySections, setPrivacySections] = useState<
    Array<{ heading: string; body: string }>
  >([]);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const cfg = await siteAPI.getAbout();
        if (ignore) return;
        setTitle(cfg.title || "About EBM Quick Hits");
        setSubtitle(cfg.subtitle || "");
        setSections(Array.isArray(cfg.sections) ? cfg.sections : []);
        setRefUrl(cfg.referenceCard?.url || "");
        setRefPath(cfg.referenceCard?.filePath || "");
        setCurrUrl(cfg.suggestedCurriculum?.url || "");
        setCurrPath(cfg.suggestedCurriculum?.filePath || "");
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const c = await siteAPI.getContact();
        if (ignore) return;
        setContactTitle(c.title || "Contact Us");
        setContactBody(c.body || "");
        setContactEmail(c.email || "");
      } catch {}
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const pv = await siteAPI.getPrivacy();
        if (ignore) return;
        setPrivacyTitle(pv.title || "Privacy Policy");
        setPrivacySubtitle(pv.subtitle || "");
        setPrivacySections(Array.isArray(pv.sections) ? pv.sections : []);
      } catch {}
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const f = await siteAPI.getFeaturedPresentations();
        if (ignore) return;
        setFeaturedIds((f.presentations || []).map((p: any) => p.id));
      } catch {}
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await presentationsAPI.adminList({
          status: "approved",
          limit: 200,
        } as any);
        if (ignore) return;
        setAllApproved(res.presentations || []);
      } catch {}
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const toggleFeatured = (id: string) => {
    setFeaturedIds((prev) => {
      const has = prev.includes(id);
      if (has) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  };

  const addSection = () =>
    setSections((s) => [...s, { heading: "New Section", body: "" }]);
  const removeSection = (idx: number) =>
    setSections((s) => s.filter((_, i) => i !== idx));
  const updateSection = (idx: number, key: "heading" | "body", val: string) =>
    setSections((s) =>
      s.map((it, i) => (i === idx ? { ...it, [key]: val } : it)),
    );

  const onUploadRef = async (file: File) => {
    try {
      const { path } = await siteAPI.uploadReference(file);
      setRefPath(path);
      setRefUrl("");
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    }
  };

  const onUploadCurr = async (file: File) => {
    try {
      const { path } = await siteAPI.uploadCurriculum(file);
      setCurrPath(path);
      setCurrUrl("");
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await siteAPI.saveAbout({
        title,
        subtitle,
        sections,
        referenceCard: { url: refUrl || null, filePath: refPath || null },
        suggestedCurriculum: { url: currUrl || null, filePath: currPath || null },
      });
      alert("Saved");
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onSaveFeatured = async () => {
    try {
      setSavingFeatured(true);
      await siteAPI.saveFeatured(featuredIds);
      alert("Featured trials saved");
    } catch (e: any) {
      setError(e?.message || "Save featured failed");
    } finally {
      setSavingFeatured(false);
    }
  };

  if (loading) return <div className="border rounded p-4 dark:border-slate-700 dark:bg-slate-800">Loading…</div>;

  return (
    <div className="border rounded p-4 space-y-4 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-medium dark:text-slate-100">Site Content</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-sm dark:text-slate-300">About Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm dark:text-slate-300">About Subtitle</label>
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-medium dark:text-slate-100">Sections</div>
          <Button variant="outline" onClick={addSection}>
            Add Section
          </Button>
        </div>
        {sections.length === 0 && (
          <div className="text-sm text-gray-600 dark:text-slate-400">No sections yet.</div>
        )}
        {sections.map((s, i) => (
          <div key={i} className="border rounded p-3 space-y-2 bg-white dark:bg-slate-700 dark:border-slate-600">
            <div className="flex items-center gap-2">
              <Input
                value={s.heading}
                onChange={(e) => updateSection(i, "heading", e.target.value)}
                placeholder="Section heading"
              />
              <Button variant="outline" onClick={() => removeSection(i)}>
                Remove
              </Button>
            </div>
            <textarea
              className="w-full border rounded p-2 text-sm min-h-[100px] dark:bg-slate-600 dark:border-slate-500 dark:text-slate-50"
              value={s.body}
              onChange={(e) => updateSection(i, "body", e.target.value)}
              placeholder="Section body (supports line breaks)"
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="font-medium dark:text-slate-100">EBM Reference Card Link</div>
        <Input
          placeholder="https://..."
          value={refUrl}
          onChange={(e) => {
            setRefUrl(e.target.value);
            if (e.target.value) setRefPath("");
          }}
        />
        <div className="text-xs text-gray-600 dark:text-slate-400">
          Or upload a file to link to:
        </div>
        <input
          type="file"
          className="block w-full text-sm text-gray-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-slate-700 dark:file:text-slate-200 file:cursor-pointer hover:file:bg-gray-200 dark:hover:file:bg-slate-600"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUploadRef(f);
          }}
        />
        {refPath && (
          <div className="text-xs text-gray-700 dark:text-slate-300">
            Uploaded path: <span className="font-mono">{refPath}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="font-medium dark:text-slate-100">Suggested Curriculum Link</div>
        <Input
          placeholder="https://..."
          value={currUrl}
          onChange={(e) => {
            setCurrUrl(e.target.value);
            if (e.target.value) setCurrPath("");
          }}
        />
        <div className="text-xs text-gray-600 dark:text-slate-400">
          Or upload a file to link to:
        </div>
        <input
          type="file"
          className="block w-full text-sm text-gray-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-slate-700 dark:file:text-slate-200 file:cursor-pointer hover:file:bg-gray-200 dark:hover:file:bg-slate-600"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUploadCurr(f);
          }}
        />
        {currPath && (
          <div className="text-xs text-gray-700 dark:text-slate-300">
            Uploaded path: <span className="font-mono">{currPath}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="font-medium dark:text-slate-100">Featured Trials (max 3)</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {allApproved.map((p) => (
            <label
              key={p.id}
              className={`flex items-center gap-2 border rounded px-3 py-2 ${featuredIds.includes(p.id) ? "bg-ucla-gold/10 border-ucla-gold dark:bg-yellow-950 dark:border-yellow-900" : "bg-white dark:bg-slate-700 dark:border-slate-600"}`}
            >
              <input
                type="checkbox"
                checked={featuredIds.includes(p.id)}
                onChange={() => toggleFeatured(p.id)}
              />
              <span className="truncate dark:text-slate-100">{p.title}</span>
              <span className="ml-auto text-xs text-gray-600 dark:text-slate-400">
                {p.specialty}
              </span>
            </label>
          ))}
        </div>
        <div className="text-xs text-gray-600 dark:text-slate-400">
          Selected: {featuredIds.length}/3
        </div>
        <Button
          className="bg-ucla-blue"
          disabled={savingFeatured}
          onClick={onSaveFeatured}
        >
          {savingFeatured ? "Saving…" : "Save Featured"}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="font-medium dark:text-slate-100">Contact Us</div>
        <label className="text-sm dark:text-slate-300">Title</label>
        <Input
          value={contactTitle}
          onChange={(e) => setContactTitle(e.target.value)}
        />
        <label className="text-sm dark:text-slate-300">Email (optional)</label>
        <Input
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        <label className="text-sm dark:text-slate-300">Body</label>
        <textarea
          className="w-full border rounded p-2 text-sm min-h-[120px] dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
          value={contactBody}
          onChange={(e) => setContactBody(e.target.value)}
        />
        <div>
          <Button
            className="bg-ucla-blue"
            disabled={savingContact}
            onClick={async () => {
              try {
                setSavingContact(true);
                await siteAPI.saveContact({
                  title: contactTitle,
                  body: contactBody,
                  email: contactEmail || null,
                });
                alert("Contact saved");
              } finally {
                setSavingContact(false);
              }
            }}
          >
            {savingContact ? "Saving…" : "Save Contact"}
          </Button>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <div className="font-medium dark:text-slate-100">Privacy Policy</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-sm dark:text-slate-300">Privacy Title</label>
            <Input
              value={privacyTitle}
              onChange={(e) => setPrivacyTitle(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm dark:text-slate-300">Privacy Subtitle</label>
            <Input
              value={privacySubtitle}
              onChange={(e) => setPrivacySubtitle(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium dark:text-slate-100">Sections</div>
            <Button
              variant="outline"
              onClick={() =>
                setPrivacySections((s) => [
                  ...s,
                  { heading: "New Section", body: "" },
                ])
              }
            >
              Add Section
            </Button>
          </div>
          {privacySections.length === 0 && (
            <div className="text-sm text-gray-600">No sections yet.</div>
          )}
          {privacySections.map((s, i) => (
            <div key={i} className="border rounded p-3 space-y-2 bg-white dark:bg-slate-700 dark:border-slate-600">
              <div className="flex items-center gap-2">
                <Input
                  value={s.heading}
                  onChange={(e) =>
                    setPrivacySections((arr) =>
                      arr.map((it, idx) =>
                        idx === i ? { ...it, heading: e.target.value } : it,
                      ),
                    )
                  }
                  placeholder="Section heading"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    setPrivacySections((arr) =>
                      arr.filter((_, idx) => idx !== i),
                    )
                  }
                >
                  Remove
                </Button>
              </div>
              <textarea
                className="w-full border rounded p-2 text-sm min-h-[100px] dark:bg-slate-600 dark:border-slate-500 dark:text-slate-50"
                value={s.body}
                onChange={(e) =>
                  setPrivacySections((arr) =>
                    arr.map((it, idx) =>
                      idx === i ? { ...it, body: e.target.value } : it,
                    ),
                  )
                }
                placeholder="Section body (supports line breaks)"
              />
            </div>
          ))}
        </div>
        <div>
          <Button
            className="bg-ucla-blue"
            disabled={savingPrivacy}
            onClick={async () => {
              try {
                setSavingPrivacy(true);
                await siteAPI.savePrivacy({
                  title: privacyTitle,
                  subtitle: privacySubtitle || undefined,
                  sections: privacySections,
                });
                alert("Privacy saved");
              } finally {
                setSavingPrivacy(false);
              }
            }}
          >
            {savingPrivacy ? "Saving…" : "Save Privacy"}
          </Button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <div className="pt-2">
        <Button className="bg-ucla-blue" disabled={saving} onClick={onSave}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function AdminApprovalsQuestions() {
  const qc = useQueryClient();
  const { user } = useAdmin();
  const { data } = useQuery({
    queryKey: ["approvals-questions", user?.role],
    queryFn: async () => {
      if (user?.role === "user") return { questions: [] } as any;
      return await questionsAPI.adminList({ status: "pending", limit: 50 });
    },
  });
  const approveQ = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => questionsAPI.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals-questions"] });
    },
  });
  return (
    <div>
      <h3 className="font-medium mb-2 dark:text-slate-100">Questions Pending</h3>
      <div className="space-y-2">
        {(data?.questions || []).map((q: any) => (
          <div
            key={q.id}
            className="flex items-center justify-between border rounded px-3 py-2 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900"
          >
            <div className="min-w-0">
              <div className="font-medium truncate dark:text-slate-100" title={q.prompt}>
                {q.prompt}
              </div>
              <div className="text-xs text-gray-600 dark:text-slate-400">
                {q.specialty || "General"} • pending
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  approveQ.mutate({ id: q.id, status: "approved" })
                }
              >
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  approveQ.mutate({ id: q.id, status: "rejected" })
                }
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const passwordsMatch =
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    newPassword === confirmPassword;
  const onSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await adminAuthAPI.changePassword(currentPassword, newPassword);
      setMessage("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setMessage(e?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="border rounded p-4 space-y-3 max-w-md dark:border-slate-700 dark:bg-slate-800">
      <h2 className="font-medium dark:text-slate-100">Account</h2>
      <div>
        <label className="text-sm dark:text-slate-300">Current password</label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm dark:text-slate-300">New password</label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm dark:text-slate-300">Confirm new password</label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
            Passwords do not match
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="bg-ucla-blue"
          onClick={onSave}
          disabled={saving || !passwordsMatch || currentPassword.length < 6}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
        {message && <div className="text-sm text-gray-600 dark:text-slate-400">{message}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAdmin();
  const qc = useQueryClient();
  const location = useLocation();
  const initialTab =
    new URLSearchParams(location.search).get("tab") ||
    (user?.role === "user" ? "trials" : "users");
  const [tab, setTab] = useState(initialTab);
  const [newTrial, setNewTrial] = useState({
    title: "",
    specialty: "",
    specialties: [] as string[],
    summary: "",
    authors: "",
    journal: "",
    year: "",
  });
  const [newPdf, setNewPdf] = useState<File | null>(null);
  const [newPpt, setNewPpt] = useState<File | null>(null);

  const { data: backendAvailable } = useQuery({
    queryKey: ["backend-available"],
    queryFn: () => checkBackendAvailability(),
    staleTime: 30000,
  });

  const { data: specialtiesData } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => presentationsAPI.getSpecialties(),
    enabled: !!backendAvailable,
  });
  const baseSpecialties = useMemo(
    () =>
      Array.from(
        new Set([
          ...(SPECIALTY_NAMES || []),
          ...((specialtiesData?.specialties as string[]) || []),
        ]),
      ),
    [specialtiesData?.specialties],
  );
  const [addedSpecialties, setAddedSpecialties] = useState<string[]>([]);
  const [newSpecialtyInput, setNewSpecialtyInput] = useState("");
  const allSpecialties = useMemo(
    () => Array.from(new Set([...baseSpecialties, ...addedSpecialties])),
    [baseSpecialties, addedSpecialties],
  );
  const addSpecialty = () => {
    const s = newSpecialtyInput.trim();
    if (!s) return;
    if (!allSpecialties.includes(s))
      setAddedSpecialties((prev) => [...prev, s]);
    setNewTrial((v) => ({
      ...v,
      specialties: v.specialties.includes(s)
        ? v.specialties
        : [...v.specialties, s],
    }));
    setNewSpecialtyInput("");
  };

  const [filterStatus, setFilterStatus] = useState<
    "all" | "approved" | "pending" | "rejected" | "archived"
  >("all");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");

  // keep tab in sync with URL changes
  useEffect(() => {
    const t = new URLSearchParams(location.search).get("tab") || "users";
    setTab(t);
  }, [location.search]);

  const { data: trials, refetch } = useQuery({
    queryKey: ["admin-trials", user?.role],
    queryFn: async () => {
      try {
        if (user?.role === "user") return await presentationsAPI.myList();
        return await presentationsAPI.adminList({ limit: 50 });
      } catch (e) {
        return {
          presentations: [],
          pagination: { page: 1, limit: 50, total: 0, pages: 0 },
        } as any;
      }
    },
    enabled: isAuthenticated && !!getToken(),
    retry: 0,
  });

  const { data: pending } = useQuery({
    queryKey: ["admin-trials-pending", user?.role],
    queryFn: async () => {
      try {
        if (user?.role === "user")
          return {
            presentations: [],
            pagination: { page: 1, limit: 50, total: 0, pages: 0 },
          } as any;
        return await presentationsAPI.adminList({
          status: "pending",
          limit: 50,
        });
      } catch (e) {
        return {
          presentations: [],
          pagination: { page: 1, limit: 50, total: 0, pages: 0 },
        } as any;
      }
    },
    enabled: isAuthenticated && !!getToken(),
    retry: 0,
  });

  const filteredTrials = (trials?.presentations || []).filter((p: any) => {
    const status = p.status || "approved";
    const statusOk = filterStatus === "all" ? true : status === filterStatus;
    const specOk =
      filterSpecialty === "all" ? true : p.specialty === filterSpecialty;
    return statusOk && specOk;
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const resp = await presentationsAPI.createPresentation({
        title: newTrial.title,
        specialty: newTrial.specialties[0] || undefined,
        specialties: newTrial.specialties.length
          ? newTrial.specialties
          : undefined,
        summary: newTrial.summary,
        authors: newTrial.authors || undefined,
        journal: newTrial.journal || undefined,
        year: newTrial.year || undefined,
      } as any);
      const created = (resp as any).presentation || resp;
      if (created?.id) {
        try {
          if (newPdf) await presentationsAPI.uploadFile(created.id, newPdf);
          if (newPpt) await presentationsAPI.uploadFile(created.id, newPpt);
        } catch (e) {
          console.warn("File upload failed, presentation created", e);
        }
      }
      return created;
    },
    onSuccess: () => {
      setNewTrial({
        title: "",
        specialty: "",
        specialties: [],
        summary: "",
        authors: "",
        journal: "",
        year: "",
      });
      setNewPdf(null);
      setNewPpt(null);
      qc.invalidateQueries({ queryKey: ["admin-trials"] });
      qc.invalidateQueries({ queryKey: ["admin-trials-pending"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected" | "pending";
    }) => presentationsAPI.updateStatus(id, status as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-trials"] });
      qc.invalidateQueries({ queryKey: ["admin-trials-pending"] });
    },
  });

  if (!isAuthenticated) return <div className="p-6">Please login.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-slate-950 dark:text-slate-50">
      <SiteHeader showQuickLinks />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-ucla-blue">
            Admin Dashboard
          </h1>
          <ThemeToggle />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {user?.role !== "user" && (
              <TabsTrigger value="users">Users</TabsTrigger>
            )}
            <TabsTrigger value="trials">Trials</TabsTrigger>
            {user?.role !== "user" && (
              <TabsTrigger value="approvals">
                Approvals
                {pending?.pagination?.total
                  ? ` (${pending.pagination.total})`
                  : pending?.presentations?.length
                    ? ` (${pending.presentations.length})`
                    : ""}
              </TabsTrigger>
            )}
            <TabsTrigger value="questions">Questions</TabsTrigger>
            {user?.role !== "user" && (
              <TabsTrigger value="site">Site</TabsTrigger>
            )}
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <AdminUsers showHeader={false} />
          </TabsContent>

          <TabsContent value="trials" className="mt-4 space-y-6">
            <div className="border rounded p-4 space-y-3 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="font-medium dark:text-slate-100">Create Trial/Presentation</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm dark:text-slate-300">Title</label>
                  <Input
                    value={newTrial.title}
                    onChange={(e) =>
                      setNewTrial({ ...newTrial, title: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm dark:text-slate-300">Specialty</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {allSpecialties.map((s: string) => (
                      <label
                        key={s}
                        className={`text-sm px-2 py-1 border rounded inline-flex items-center gap-2 ${newTrial.specialties.includes(s) ? "bg-ucla-gold/10 border-ucla-gold dark:bg-yellow-950 dark:border-yellow-900" : "bg-white dark:bg-slate-700 dark:border-slate-600"}`}
                      >
                        <input
                          type="checkbox"
                          checked={newTrial.specialties.includes(s)}
                          onChange={(e) =>
                            setNewTrial((v) => ({
                              ...v,
                              specialties: e.target.checked
                                ? [...v.specialties, s]
                                : v.specialties.filter((x) => x !== s),
                            }))
                          }
                        />
                        <span className="truncate dark:text-slate-100">{s}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      placeholder="Add a specialty"
                      value={newSpecialtyInput}
                      onChange={(e) => setNewSpecialtyInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSpecialty();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSpecialty}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm">Summary</label>
                  <Input
                    value={newTrial.summary}
                    onChange={(e) =>
                      setNewTrial({ ...newTrial, summary: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Authors</label>
                  <Input
                    value={newTrial.authors}
                    onChange={(e) =>
                      setNewTrial({ ...newTrial, authors: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Journal</label>
                  <Input
                    value={newTrial.journal}
                    onChange={(e) =>
                      setNewTrial({ ...newTrial, journal: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm">Year</label>
                  <Input
                    value={newTrial.year}
                    onChange={(e) =>
                      setNewTrial({ ...newTrial, year: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-sm">Attach PDF (optional)</label>
                  <FileDropzone accept={["pdf"]} onFile={(f) => setNewPdf(f)} />
                  {newPdf && (
                    <div className="text-xs text-gray-600 mt-1">
                      Selected: {newPdf.name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm">Attach PPT/PPTX (optional)</label>
                  <FileDropzone
                    accept={["ppt", "pptx"]}
                    onFile={(f) => setNewPpt(f)}
                  />
                  {newPpt && (
                    <div className="text-xs text-gray-600 mt-1">
                      Selected: {newPpt.name}
                    </div>
                  )}
                </div>
              </div>
              <Button
                className="bg-ucla-blue mt-3"
                onClick={() => createMutation.mutate()}
                disabled={
                  createMutation.isPending ||
                  !newTrial.title ||
                  newTrial.specialties.length === 0 ||
                  !newTrial.summary
                }
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
              {createMutation.error && (
                <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                  {(createMutation.error as any).message || "Failed to create"}
                </div>
              )}
            </div>

            <div className="border rounded p-4 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="font-medium mb-3 dark:text-slate-100">All Trials</h2>
              <div className="flex flex-wrap gap-3 mb-3">
                <div className="w-44">
                  <label className="text-xs text-gray-500 dark:text-slate-400">Status</label>
                  <Select
                    value={filterStatus as any}
                    onValueChange={(v) => setFilterStatus(v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-56">
                  <label className="text-xs text-gray-500 dark:text-slate-400">Specialty</label>
                  <Select
                    value={filterSpecialty}
                    onValueChange={(v) => setFilterSpecialty(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {allSpecialties.map((s: string) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                {filteredTrials?.map((p: any) => (
                  <TrialRow
                    key={p.id}
                    p={p}
                    onApprove={(status) =>
                      approveMutation.mutate({ id: p.id, status })
                    }
                  />
                ))}
                {filteredTrials?.length === 0 && (
                  <div className="text-sm text-gray-600 dark:text-slate-400">
                    No submissions yet.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2 dark:text-slate-100">
                  Trials/Presentations Pending
                </h3>
                <div className="space-y-2">
                  {pending?.presentations?.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between border rounded px-3 py-2 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900"
                    >
                      <div>
                        <div className="font-medium dark:text-slate-100">{p.title}</div>
                        <div className="text-xs text-gray-600 dark:text-slate-400">
                          {p.specialty} • pending
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            approveMutation.mutate({
                              id: p.id,
                              status: "approved",
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            approveMutation.mutate({
                              id: p.id,
                              status: "rejected",
                            })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <AdminApprovalsQuestions />
            </div>
          </TabsContent>

          <TabsContent value="questions" className="mt-4">
            <AdminQuestions />
          </TabsContent>

          <TabsContent value="site" className="mt-4">
            <SiteEditor />
          </TabsContent>

          <TabsContent value="account" className="mt-4">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
