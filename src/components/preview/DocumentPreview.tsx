import React, { useEffect, useRef, useState } from 'react';
import mammoth from 'mammoth';
import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { sanitizeHtml } from '../../utils/sanitize';
import { formatBytes } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, Eye, ShieldCheck } from 'lucide-react';

interface DocumentPreviewProps {
  file: File;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // PDF Preview State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setHtmlContent(null);
    setTextContent(null);
    setImageUrl(null);
    setPdfDoc(null);

    const loadContent = async () => {
      try {
        if (ext === 'pdf') {
          ensurePdfWorker();
          const buffer = await file.arrayBuffer();
          const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
          if (!active) return;
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setCurrentPage(1);
        } else if (ext === 'docx') {
          const buffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
          if (!active) return;
          setHtmlContent(sanitizeHtml(result.value || '<p>Empty Word document</p>'));
        } else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
          const url = URL.createObjectURL(file);
          if (!active) return;
          setImageUrl(url);
        } else if (['txt', 'md', 'html', 'json', 'csv'].includes(ext)) {
          const text = await file.text();
          if (!active) return;
          setTextContent(text);
        } else {
          setTextContent(`Preview not directly available for .${ext} files.`);
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to render preview');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadContent();

    return () => {
      active = false;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [file, ext]);

  // Render PDF Page onto Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask: any = null;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;
      } catch (e: any) {
        if (e.name !== 'RenderingCancelledException') {
          console.warn('PDF page render error', e);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDoc, currentPage]);

  return (
    <div className="space-y-4">
      {/* File summary bar */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-df-black/5 dark:bg-df-white/5 border border-df-black/10 dark:border-df-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-df-blue" />
          <span className="font-semibold text-df-black dark:text-df-white">{file.name}</span>
          <span className="text-df-black/50 dark:text-df-white/50">({formatBytes(file.size)})</span>
        </div>
        <div className="flex items-center gap-1.5 text-df-blue font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local In-Memory Preview</span>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-sm text-df-black/60 dark:text-df-white/60">
          Generating live preview...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-df-pink/10 border border-df-pink/20 text-df-pink text-xs">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="border border-df-black/10 dark:border-df-white/10 rounded-lg p-4 bg-df-white dark:bg-df-black min-h-[300px] max-h-[500px] overflow-auto">
          {/* PDF View */}
          {pdfDoc && (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-sm mb-3 text-xs font-semibold">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded border border-df-black/10 dark:border-df-white/10 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded border border-df-black/10 dark:border-df-white/10 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="border border-df-black/10 dark:border-df-white/10 shadow-sm rounded overflow-hidden">
                <canvas ref={canvasRef} className="max-w-full h-auto block" />
              </div>
            </div>
          )}

          {/* DOCX HTML View */}
          {htmlContent && (
            <div
              className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed p-4 bg-df-white text-df-black rounded"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}

          {/* Image View */}
          {imageUrl && (
            <div className="flex items-center justify-center p-4">
              <img
                src={imageUrl}
                alt="Document preview"
                className="max-h-[400px] max-w-full rounded shadow-sm border border-df-black/10 dark:border-df-white/10 object-contain"
              />
            </div>
          )}

          {/* Text/MD View */}
          {textContent && (
            <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-df-black/80 dark:text-df-white/80 p-2">
              {textContent}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

