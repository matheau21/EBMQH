import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { QuestionHighlight } from "@/lib/api";
// Configure pdf.js worker via URL resolution compatible with Vite builds
const pdfjsWorkerUrl = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl as unknown as string;

interface Props {
  url: string;
  highlights?: QuestionHighlight[];
}

// Render text with simple in-span phrase highlighting (does not cross PDF text item boundaries)
function highlightText(
  text: string,
  phrases: Array<{
    phrase: string;
    color: string;
    occurrence?: number;
    tracker: { count: number };
  }>,
) {
  if (!phrases.length || !text) return text;
  // Apply per phrase sequentially
  let nodes: Array<string | JSX.Element> = [text];
  phrases.forEach((p, idx) => {
    const next: Array<string | JSX.Element> = [];
    nodes.forEach((node) => {
      if (typeof node !== "string") {
        next.push(node);
        return;
      }
      const parts: Array<string | JSX.Element> = [];
      let remaining = node;
      const phrase = p.phrase;
      if (!phrase) {
        parts.push(remaining);
      } else {
        while (true) {
          const i = remaining.toLowerCase().indexOf(phrase.toLowerCase());
          if (i < 0) {
            parts.push(remaining);
            break;
          }
          const before = remaining.slice(0, i);
          const match = remaining.slice(i, i + phrase.length);
          const after = remaining.slice(i + phrase.length);
          if (before) parts.push(before);
          // Handle occurrence filter (only wrap the Nth time if specified)
          p.tracker.count += 1;
          const shouldWrap = !p.occurrence || p.tracker.count === p.occurrence;
          if (shouldWrap) {
            parts.push(
              <mark
                key={`hl-${idx}-${p.tracker.count}-${Math.random()}`}
                style={{ backgroundColor: p.color, padding: 0 }}
              >
                {match}
              </mark>,
            );
          } else {
            parts.push(match);
          }
          remaining = after;
        }
      }
      next.push(...parts);
    });
    nodes = next;
  });
  return nodes;
}

export default function PdfHighlightViewer({ url, highlights = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [useProxy, setUseProxy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (containerRef.current) setWidth(containerRef.current.clientWidth);
    });
    if (containerRef.current) {
      setWidth(containerRef.current.clientWidth);
      ro.observe(containerRef.current);
    }
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setUseProxy(false);
    setLoadError(null);
    setNumPages(0);
  }, [url]);

  const pagesWithHighlights = useMemo(() => {
    const map = new Map<number, QuestionHighlight[]>();
    for (const h of highlights) {
      if (!h?.page || !h?.phrase) continue;
      const list = map.get(h.page) || [];
      list.push(h);
      map.set(h.page, list);
    }
    return map;
  }, [highlights]);

  const finalUrl = useMemo(() => {
    try {
      if (url.startsWith("blob:")) return url;
      const u = new URL(url, window.location.origin);
      const sameOrigin = u.origin === window.location.origin;
      if (sameOrigin) return url;
      // Always use proxy for cross-origin URLs to avoid CORS and fetch-stream issues
      return `/api/presentations/proxy-pdf?src=${encodeURIComponent(url)}`;
    } catch {
      return url;
    }
  }, [url]);

  // Apply naive DOM-based highlights after pages render
  const applyHighlights = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    const pageEls = root.querySelectorAll(".react-pdf__Page");
    pageEls.forEach((pageEl) => {
      const pageAttr = (pageEl as HTMLElement).getAttribute("data-page-number");
      const pageNumber = pageAttr ? parseInt(pageAttr) : NaN;
      if (!pageNumber || !pagesWithHighlights.has(pageNumber)) return;
      const hs = pagesWithHighlights.get(pageNumber)!;
      const tl = pageEl.querySelector(".react-pdf__Page__textContent");
      if (!tl) return;
      const spans = Array.from(
        tl.querySelectorAll("span"),
      ) as HTMLSpanElement[];
      // Reset any prior markup
      spans.forEach((s) => {
        s.textContent = s.textContent || "";
      });
      for (const h of hs) {
        let seen = 0;
        for (const s of spans) {
          const text = s.textContent || "";
          const idx = text.toLowerCase().indexOf(h.phrase.toLowerCase());
          if (idx < 0) continue;
          seen += 1;
          if (h.occurrence && seen !== h.occurrence) continue;
          const before = text.slice(0, idx);
          const match = text.slice(idx, idx + h.phrase.length);
          const after = text.slice(idx + h.phrase.length);
          s.innerHTML = "";
          if (before) s.append(document.createTextNode(before));
          const mark = document.createElement("span");
          mark.style.backgroundColor = h.color || "#fff59d";
          mark.setAttribute("data-ebm-hl", "1");
          mark.textContent = match;
          s.append(mark);
          if (after) s.append(document.createTextNode(after));
          break; // only first span occurrence per highlight
        }
      }
    });
  }, [pagesWithHighlights]);

  useEffect(() => {
    // Delay to allow text layer to render
    const t = setTimeout(applyHighlights, 50);
    return () => clearTimeout(t);
  }, [applyHighlights, numPages, finalUrl, highlights]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto bg-background">
      <Document
        key={finalUrl}
        file={finalUrl}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          setLoadError(null);
        }}
        onLoadError={(e: any) => {
          const msg = String(e?.message || "").toLowerCase();
          const isAbort = e?.name === "AbortError" || msg.includes("abort");
          if (isAbort) return; // benign during rerenders or URL switches
          if (!useProxy) setUseProxy(true);
          else setLoadError(e?.message || "Failed to load PDF file.");
        }}
        loading={<div className="p-4 text-sm text-muted-foreground">Loading PDF…</div>}
        error={
          <div className="p-4 text-sm text-destructive">
            {loadError || "Failed to load PDF file."}
          </div>
        }
      >
        {Array.from(new Array(numPages), (_el, index) => {
          const pageNumber = index + 1;
          return (
            <div
              key={`p-${pageNumber}`}
              className="flex justify-center py-3 border-b last:border-b-0 border-border"
            >
              <Page
                pageNumber={pageNumber}
                width={width ? Math.min(width - 16, 1200) : undefined}
                renderAnnotationLayer={false}
                renderTextLayer={true}
              />
            </div>
          );
        })}
      </Document>
    </div>
  );
}
