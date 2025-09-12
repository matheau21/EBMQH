import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { QuestionHighlight } from "@/lib/api";

// Configure PDF.js worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface Props {
  url: string;
  highlights?: QuestionHighlight[];
}

// Render text with simple in-span phrase highlighting (does not cross PDF text item boundaries)
function highlightText(
  text: string,
  phrases: Array<{ phrase: string; color: string; occurrence?: number; tracker: { count: number } }>
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
              <mark key={`hl-${idx}-${p.tracker.count}-${Math.random()}`} style={{ backgroundColor: p.color, padding: 0 }}>
                {match}
              </mark>
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

  // Prepare per-page custom renderer with occurrence trackers
  const makeCustomTextRenderer = useCallback(
    (pageNumber: number) => ({ str }: { str: string }) => {
      const hs = pagesWithHighlights.get(pageNumber) || [];
      const phrases = hs.map((h) => ({
        phrase: h.phrase,
        color: h.color || "#fff59d",
        occurrence: h.occurrence,
        tracker: { count: 0 },
      }));
      return <span>{highlightText(str, phrases)}</span> as any;
    },
    [pagesWithHighlights]
  );

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto bg-white">
      <Document file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<div className="p-4 text-sm text-gray-600">Loading PDF…</div>}>
        {Array.from(new Array(numPages), (_el, index) => {
          const pageNumber = index + 1;
          const hasHls = pagesWithHighlights.has(pageNumber);
          return (
            <div key={`p-${pageNumber}`} className="flex justify-center py-3 border-b last:border-b-0">
              <Page
                pageNumber={pageNumber}
                width={width ? Math.min(width - 16, 1200) : undefined}
                renderAnnotationLayer={false}
                renderTextLayer={true}
                customTextRenderer={hasHls ? makeCustomTextRenderer(pageNumber) : undefined}
              />
            </div>
          );
        })}
      </Document>
    </div>
  );
}
