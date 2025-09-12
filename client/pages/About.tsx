import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { siteAPI } from "@/lib/api";

interface Section { heading: string; body: string }

export default function About() {
  const [title, setTitle] = useState("About EBM Quick Hits");
  const [subtitle, setSubtitle] = useState<string | undefined>("Concise, consistent, evidence-based summaries.");
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      const cfg = await siteAPI.getAbout();
      if (ignore) return;
      setTitle(cfg.title || "About EBM Quick Hits");
      setSubtitle(cfg.subtitle || undefined);
      setSections(Array.isArray(cfg.sections) ? cfg.sections : []);
    };
    run();
    return () => { ignore = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader showQuickLinks />
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm">
          <Link to="/" className="text-ucla-blue hover:underline">Home</Link>
          <span className="mx-2 text-blue-600">/</span>
          <span className="text-blue-800">About</span>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-ucla-blue mb-2">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </section>
        <section className="grid gap-6">
          {sections.length === 0 ? (
            <div className="text-center text-gray-600">No content yet.</div>
          ) : (
            sections.map((s, i) => (
              <div key={i} className="bg-white rounded-lg border p-5">
                <h2 className="text-xl font-semibold mb-2">{s.heading}</h2>
                <p className="text-gray-700 whitespace-pre-line">{s.body}</p>
              </div>
            ))
          )}
        </section>

        <div className="mt-10 text-center">
          <Link to="/presentations">
            <Button variant="outline" className="border-ucla-blue text-ucla-blue hover:bg-blue-50">Browse Presentations</Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
