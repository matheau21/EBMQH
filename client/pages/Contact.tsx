import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { siteAPI } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Contact() {
  const [title, setTitle] = useState("Contact Us");
  const [body, setBody] = useState<string>("Email us at example@example.com");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const c = await siteAPI.getContact();
      if (ignore) return;
      setTitle(c.title || "Contact Us");
      setBody(c.body || "");
      setEmail(c.email || null);
    })();
    return () => { ignore = true; };
  }, []);

  const paragraphs = body.split(/\n\n+/);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
        {email && (
          <div className="mb-3 text-sm">
            <a className="text-primary underline" href={`mailto:${email}`}>{email}</a>
          </div>
        )}
        <div className="prose max-w-none dark:prose-invert">
          {paragraphs.map((p, i) => (
            <div key={i}>
              <p className="text-gray-700">{p}</p>
              {i < paragraphs.length - 1 && (
                <hr className="my-4 border-t border-border" />
              )}
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
