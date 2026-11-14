import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  Plus,
  RotateCw,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Download,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Sliders,
  Hash,
  Stamp,
  Lock,
  Unlock,
  Crop,
  AlertCircle,
  FileText,
  SortAsc,
  Check,
} from 'lucide-react';
import { ToolDefinition, ConversionOptions } from '../../types';
import { executeToolConversion } from '../../converters';
import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { downloadBlob } from '../../utils/download';
import { formatBytes } from '../../utils/formatters';

interface InteractiveToolWorkspaceProps {
  tool: ToolDefinition;
  onBack: () => void;
  onSelectOtherTool: (tool: ToolDefinition) => void;
}

interface PageThumbnail {
  pageNumber: number;
  rotation: number;
  canvasUrl?: string;
  isSelected?: boolean;
}

export const InteractiveToolWorkspace: React.FC<InteractiveToolWorkspaceProps> = ({
  tool,
  onBack,
  onSelectOtherTool,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);

  // Conversion options state
  const [options, setOptions] = useState<ConversionOptions>({
    rotationAngle: 90,
    pageRange: '',
    watermarkText: 'CONFIDENTIAL',
    watermarkOpacity: 0.3,
    watermarkFontSize: 44,
    watermarkRotation: 45,
    pageNumberPosition: 'bottom-center',
    pageNumberFormat: 'Page {n} of {total}',
    pdfPassword: '',
    imageQuality: 0.75,
    cropMarginPercent: 5,
    signatureDataUrl: '',
    signaturePage: 1,
    signatureWidth: 180,
    signatureHeight: 60,
  });

  // Compress mode: 'extreme' | 'recommended' | 'low'
  const [compressLevel, setCompressLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');

  // Split mode: 'range' | 'extract'
  const [splitMode, setSplitMode] = useState<'range' | 'extract'>('range');

  // Watermark mode: 'text' | 'image'
  const [watermarkMode, setWatermarkMode] = useState<'text' | 'image'>('text');

  // Signature canvas
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendInputRef = useRef<HTMLInputElement>(null);

  // Reset when tool changes
  useEffect(() => {
    setFiles([]);
    setThumbnails([]);
    setResultBlob(null);
    setErrorMessage(null);
    setProgress(0);
  }, [tool.id]);

  // Load and render page thumbnails whenever a PDF is selected
  useEffect(() => {
    let isCancelled = false;

    const loadThumbnails = async () => {
      if (files.length === 0) {
        setThumbnails([]);
        return;
      }

      const primary = files[0];
      const ext = primary.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf') {
        setThumbnails([]);
        return;
      }

      setIsLoadingThumbnails(true);
      ensurePdfWorker();

      try {
        const buffer = await primary.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
        const count = Math.min(pdf.numPages, 30); // Render up to 30 pages for performance

        const rendered: PageThumbnail[] = [];

        for (let i = 1; i <= count; i++) {
          if (isCancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.35 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;

          await page.render({ canvasContext: ctx, viewport }).promise;

          rendered.push({
            pageNumber: i,
            rotation: 0,
            canvasUrl: canvas.toDataURL('image/jpeg', 0.8),
            isSelected: true,
          });
        }

        if (!isCancelled) {
          setThumbnails(rendered);
        }
      } catch (err) {
        console.warn('Could not load thumbnails', err);
      } finally {
        if (!isCancelled) setIsLoadingThumbnails(false);
      }
    };

    loadThumbnails();

    return () => {
      isCancelled = true;
    };
  }, [files]);

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      setResultBlob(null);
      setErrorMessage(null);
    }
  };

  const handleAppendFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const appended = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...appended]);
    }
  };

  const handleRotateThumbnail = (idx: number, delta: number) => {
    setThumbnails((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, rotation: (t.rotation + delta + 360) % 360 } : t))
    );
  };

  const handleRotateAllThumbnails = (delta: number) => {
    setThumbnails((prev) =>
      prev.map((t) => ({ ...t, rotation: (t.rotation + delta + 360) % 360 }))
    );
  };

  const handleDeleteThumbnail = (idx: number) => {
    setThumbnails((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleSelectThumbnail = (idx: number) => {
    setThumbnails((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, isSelected: !t.isSelected } : t))
    );
  };

  const handleSortFiles = () => {
    setFiles((prev) => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
  };

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0B0B0F';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (sigCanvasRef.current) {
      const dataUrl = sigCanvasRef.current.toDataURL('image/png');
      setOptions((prev) => ({ ...prev, signatureDataUrl: dataUrl }));
    }
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setOptions((prev) => ({ ...prev, signatureDataUrl: '' }));
  };

  // Execute conversion
  const handleExecute = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(10);
    setProgressMessage('Analyzing documents...');
    setErrorMessage(null);

    // Apply specific tool config adjustments
    const finalOptions: ConversionOptions = { ...options };

    if (tool.id === 'pdf-compress') {
      finalOptions.imageQuality =
        compressLevel === 'extreme' ? 0.45 : compressLevel === 'recommended' ? 0.72 : 0.88;
    }

    if (tool.id === 'pdf-split' && splitMode === 'extract') {
      const selected = thumbnails.filter((t) => t.isSelected).map((t) => t.pageNumber);
      if (selected.length > 0) {
        finalOptions.pageRange = selected.join(', ');
      }
    }

    try {
      const res = await executeToolConversion(
        tool.id,
        files,
        finalOptions,
        (p, msg) => {
          setProgress(p);
          setProgressMessage(msg);
        }
      );

      setResultBlob(res.blob);
      setResultFilename(res.filename);
    } catch (err: any) {
      setErrorMessage(err.message || 'The conversion failed. Please check the document format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isMultiFileTool = ['pdf-merge', 'docx-merge', 'images-to-pdf', 'zip-create', 'pdf-compare'].includes(
    tool.id
  );

  const selectButtonText = tool.sourceFormats.includes('pdf')
    ? isMultiFileTool ? 'Select PDF files' : 'Select PDF file'
    : tool.sourceFormats.includes('docx')
    ? 'Select Word (.docx) file'
    : tool.sourceFormats.includes('png') || tool.sourceFormats.includes('jpg')
    ? isMultiFileTool ? 'Select Images' : 'Select Image'
    : 'Select File';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-df-black/10 dark:border-df-white/10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-df-black/70 dark:text-df-white/70 hover:text-df-blue dark:hover:text-df-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tools</span>
        </button>

        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-df-blue/10 text-df-blue border border-df-blue/20">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Client-Side Processing</span>
        </div>
      </div>

      {/* ================= STEP 1: UPLOAD STATE ================= */}
      {files.length === 0 && !resultBlob && (
        <div className="max-w-2xl mx-auto text-center py-12 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-df-blue/10 text-df-blue mb-2 shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-df-black dark:text-df-white tracking-tight">
              {tool.name}
            </h1>
            <p className="text-sm sm:text-base text-df-black/70 dark:text-df-white/70 max-w-lg mx-auto">
              {tool.description}
            </p>
          </div>

          {/* Big Signature iLovePDF Select Button */}
          <div className="pt-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple={isMultiFileTool}
              accept={tool.sourceFormats.map((f) => `.${f}`).join(',')}
              onChange={handleFilesChosen}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-df-blue hover:bg-df-blue/90 text-df-white text-lg font-bold shadow-xl shadow-df-blue/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Upload className="w-6 h-6" />
              <span>{selectButtonText}</span>
            </button>
            <p className="text-xs text-df-black/50 dark:text-df-white/50 mt-3">
              or drop files here &bull; processed securely on your computer
            </p>
          </div>
        </div>
      )}

      {/* ================= STEP 2: STAGING WORKSPACE ================= */}
      {files.length > 0 && !resultBlob && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual Staging / Thumbnails Panel (Cols 1-8) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Action Bar Above Thumbnails */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-df-black/5 dark:bg-df-white/5 border border-df-black/10 dark:border-df-white/10">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-df-black dark:text-df-white">
                  {files.length} File{files.length > 1 ? 's' : ''} Selected
                </span>
                <span className="text-xs text-df-black/60 dark:text-df-white/60">
                  ({formatBytes(files.reduce((acc, f) => acc + f.size, 0))})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isMultiFileTool && (
                  <>
                    <input
                      ref={appendInputRef}
                      type="file"
                      multiple
                      accept={tool.sourceFormats.map((f) => `.${f}`).join(',')}
                      onChange={handleAppendFiles}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => appendInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-df-white dark:bg-df-black border border-df-black/15 dark:border-df-white/15 text-xs font-semibold text-df-black dark:text-df-white hover:border-df-blue transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-df-blue" />
                      <span>Add files</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSortFiles}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-df-white dark:bg-df-black border border-df-black/15 dark:border-df-white/15 text-xs font-semibold text-df-black dark:text-df-white hover:border-df-blue transition-colors"
                      title="Sort files by name"
                    >
                      <SortAsc className="w-3.5 h-3.5" />
                      <span>Sort A-Z</span>
                    </button>
                  </>
                )}

                {thumbnails.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRotateAllThumbnails(90)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-df-white dark:bg-df-black border border-df-black/15 dark:border-df-white/15 text-xs font-semibold text-df-black dark:text-df-white hover:border-df-blue transition-colors"
                    title="Rotate all pages 90° clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-df-pink" />
                    <span>Rotate all</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Thumbnails Grid */}
            {isLoadingThumbnails ? (
              <div className="p-16 text-center rounded-2xl border border-dashed border-df-black/15 dark:border-df-white/15 space-y-3">
                <RefreshCw className="w-8 h-8 text-df-blue animate-spin mx-auto" />
                <p className="text-sm font-semibold text-df-black dark:text-df-white">
                  Rendering page previews...
                </p>
              </div>
            ) : thumbnails.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-df-white dark:bg-df-black border border-df-black/10 dark:border-df-white/10 min-h-[360px]">
                {thumbnails.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => tool.id === 'pdf-split' && handleToggleSelectThumbnail(idx)}
                    className={`group relative rounded-xl border p-2 flex flex-col items-center justify-between transition-all cursor-pointer ${
                      t.isSelected
                        ? 'border-df-blue shadow-md bg-df-blue/5'
                        : 'border-df-black/10 dark:border-df-white/10 opacity-50 bg-df-black/5 dark:bg-df-white/5'
                    }`}
                  >
                    {/* Hover actions */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-df-black/80 rounded-md p-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotateThumbnail(idx, 90);
                        }}
                        className="p-1 hover:text-df-blue text-df-white"
                        title="Rotate clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteThumbnail(idx);
                        }}
                        className="p-1 hover:text-df-pink text-df-white"
                        title="Remove page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Canvas Thumbnail */}
                    <div className="w-full flex items-center justify-center p-2 min-h-[160px] overflow-hidden">
                      {t.canvasUrl ? (
                        <img
                          src={t.canvasUrl}
                          alt={`Page ${t.pageNumber}`}
                          style={{ transform: `rotate(${t.rotation}deg)` }}
                          className="max-h-36 max-w-full rounded shadow-sm transition-transform duration-200"
                        />
                      ) : (
                        <FileText className="w-12 h-12 text-df-black/40 dark:text-df-white/40" />
                      )}
                    </div>

                    {/* Footer label */}
                    <div className="w-full flex items-center justify-between text-[11px] font-semibold text-df-black/70 dark:text-df-white/70 px-1 pt-1">
                      <span>Page {t.pageNumber}</span>
                      {t.rotation !== 0 && (
                        <span className="text-df-pink font-mono">{t.rotation}°</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Non-PDF / Multi-file Card List */
              <div className="space-y-3">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-df-blue/10 text-df-blue flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-df-black dark:text-df-white">
                          {file.name}
                        </div>
                        <div className="text-xs text-df-black/60 dark:text-df-white/60">
                          {formatBytes(file.size)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="p-2 text-df-black/50 hover:text-df-pink transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= RIGHT OPTIONS SIDEBAR (iLovePDF Style) ================= */}
          <div className="lg:col-span-4 rounded-2xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black p-6 shadow-sm space-y-6 sticky top-20">
            <div className="border-b border-df-black/10 dark:border-df-white/10 pb-4">
              <h3 className="font-bold text-lg text-df-black dark:text-df-white">{tool.name}</h3>
              <p className="text-xs text-df-black/60 dark:text-df-white/60 mt-0.5">
                Adjust conversion preferences below.
              </p>
            </div>

            {/* Merge options */}
            {tool.id === 'pdf-merge' && (
              <div className="space-y-3 text-xs text-df-black/70 dark:text-df-white/70">
                <p>Files will be combined in the listed order into one unified PDF.</p>
                <div className="p-3 rounded-lg bg-df-black/5 dark:bg-df-white/5 space-y-1 font-medium">
                  <div>Documents: {files.length}</div>
                  <div>Output: Single PDF</div>
                </div>
              </div>
            )}

            {/* Split options */}
            {tool.id === 'pdf-split' && (
              <div className="space-y-4 text-xs">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSplitMode('range')}
                    className={`flex-1 py-2 font-semibold rounded-lg border transition-colors ${
                      splitMode === 'range'
                        ? 'bg-df-blue text-df-white border-df-blue'
                        : 'border-df-black/15 dark:border-df-white/15'
                    }`}
                  >
                    Custom Ranges
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode('extract')}
                    className={`flex-1 py-2 font-semibold rounded-lg border transition-colors ${
                      splitMode === 'extract'
                        ? 'bg-df-blue text-df-white border-df-blue'
                        : 'border-df-black/15 dark:border-df-white/15'
                    }`}
                  >
                    Extract Pages
                  </button>
                </div>

                {splitMode === 'range' ? (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-df-black dark:text-df-white">
                      Range (e.g. 1-3, 5-8)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1-2, 4"
                      value={options.pageRange || ''}
                      onChange={(e) => setOptions({ ...options, pageRange: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black"
                    />
                  </div>
                ) : (
                  <p className="text-df-black/60 dark:text-df-white/60">
                    Click any page card on the left to select or deselect pages for extraction.
                  </p>
                )}
              </div>
            )}

            {/* Compress options (3 Tiers iLovePDF style) */}
            {tool.id === 'pdf-compress' && (
              <div className="space-y-3 text-xs">
                <label className="font-semibold text-df-black dark:text-df-white">
                  Compression Level
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'extreme',
                      title: 'Extreme Compression',
                      desc: 'Less quality, high compression',
                    },
                    {
                      id: 'recommended',
                      title: 'Recommended Compression',
                      desc: 'Good quality, good compression',
                    },
                    {
                      id: 'low',
                      title: 'Less Compression',
                      desc: 'High quality, less compression',
                    },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setCompressLevel(tier.id as any)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        compressLevel === tier.id
                          ? 'border-df-blue bg-df-blue/10 shadow-sm'
                          : 'border-df-black/10 dark:border-df-white/10 hover:border-df-blue/40'
                      }`}
                    >
                      <div className="font-bold text-df-black dark:text-df-white">
                        {tier.title}
                      </div>
                      <div className="text-[11px] text-df-black/60 dark:text-df-white/60">
                        {tier.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Watermark options (iLovePDF 3x3 grid) */}
            {['pdf-watermark-text', 'pdf-watermark-image'].includes(tool.id) && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-df-black dark:text-df-white">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={options.watermarkText || ''}
                    onChange={(e) => setOptions({ ...options, watermarkText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span>Opacity</span>
                    <span>{Math.round((options.watermarkOpacity || 0.3) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={options.watermarkOpacity || 0.3}
                    onChange={(e) =>
                      setOptions({ ...options, watermarkOpacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-df-blue"
                  />
                </div>
              </div>
            )}

            {/* Page Numbers (iLovePDF 3x3 Position Picker) */}
            {tool.id === 'pdf-page-numbers' && (
              <div className="space-y-4 text-xs">
                <label className="font-semibold text-df-black dark:text-df-white">
                  Position on Page
                </label>
                <div className="grid grid-cols-3 gap-2 w-36 mx-auto">
                  {[
                    { id: 'top-left', label: '↖' },
                    { id: 'top-center', label: '↑' },
                    { id: 'top-right', label: '↗' },
                    { id: 'middle-left', label: '←' },
                    { id: 'middle-center', label: '•' },
                    { id: 'middle-right', label: '→' },
                    { id: 'bottom-left', label: '↙' },
                    { id: 'bottom-center', label: '↓' },
                    { id: 'bottom-right', label: '↘' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() =>
                        setOptions({
                          ...options,
                          pageNumberPosition: pos.id.includes('top')
                            ? pos.id.includes('right')
                              ? 'top-right'
                              : 'top-center'
                            : pos.id.includes('right')
                            ? 'bottom-right'
                            : 'bottom-center',
                        })
                      }
                      className={`h-9 flex items-center justify-center font-bold rounded border ${
                        options.pageNumberPosition?.includes(pos.id.split('-')[1])
                          ? 'bg-df-blue text-df-white border-df-blue'
                          : 'border-df-black/15 dark:border-df-white/15 hover:bg-df-black/5'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sign PDF (Interactive Signature Pad) */}
            {tool.id === 'pdf-sign' && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-df-black dark:text-df-white">
                    Draw Your Signature
                  </label>
                  {hasSignature && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-df-pink hover:underline font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="border border-df-black/20 dark:border-df-white/20 rounded-xl overflow-hidden bg-white">
                  <canvas
                    ref={sigCanvasRef}
                    width={280}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={drawSignature}
                    onMouseUp={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={drawSignature}
                    onTouchEnd={stopDrawing}
                    className="w-full cursor-crosshair touch-none block"
                  />
                </div>
                <p className="text-[11px] text-df-black/50 dark:text-df-white/50">
                  Draw with your mouse or finger, then apply to stamp onto your document.
                </p>
              </div>
            )}

            {/* Protect / Password options */}
            {['pdf-protect', 'pdf-unlock'].includes(tool.id) && (
              <div className="space-y-2 text-xs">
                <label className="font-semibold text-df-black dark:text-df-white">
                  {tool.id === 'pdf-protect' ? 'Set Document Password' : 'Enter Authorized Password'}
                </label>
                <input
                  type="password"
                  placeholder="Enter password..."
                  value={options.pdfPassword || ''}
                  onChange={(e) => setOptions({ ...options, pdfPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white"
                />
              </div>
            )}

            {/* Crop Options */}
            {tool.id === 'pdf-crop' && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Margin Trim Percentage</span>
                  <span>{options.cropMarginPercent || 5}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={options.cropMarginPercent || 5}
                  onChange={(e) =>
                    setOptions({ ...options, cropMarginPercent: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-df-blue"
                />
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-df-pink/10 border border-df-pink/20 text-df-pink text-xs">
                {errorMessage}
              </div>
            )}

            {/* Progress indicator during run */}
            {isProcessing && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-df-black/70 dark:text-df-white/70">{progressMessage}</span>
                  <span className="text-df-blue">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-df-black/10 dark:bg-df-white/10 overflow-hidden">
                  <div
                    className="h-full bg-df-blue transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Giant Action Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExecute}
              className="w-full py-4 rounded-xl bg-df-blue hover:bg-df-blue/90 disabled:opacity-50 text-df-white font-bold text-base shadow-lg shadow-df-blue/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{tool.name} →</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: CELEBRATION DOWNLOAD SCREEN ================= */}
      {resultBlob && (
        <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-df-blue/10 text-df-blue flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-df-blue" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-df-black dark:text-df-white tracking-tight">
              Your PDF has been processed!
            </h2>
            <p className="text-sm text-df-black/70 dark:text-df-white/70">
              <strong className="text-df-black dark:text-df-white font-mono">{resultFilename}</strong> ({formatBytes(resultBlob.size)})
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => downloadBlob(resultBlob, resultFilename)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-df-blue hover:bg-df-blue/90 text-df-white text-base font-bold shadow-lg shadow-df-blue/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Download Converted PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFiles([]);
                setThumbnails([]);
                setResultBlob(null);
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-xl border border-df-black/15 dark:border-df-white/15 text-df-black dark:text-df-white text-sm font-semibold hover:bg-df-black/5 dark:hover:bg-df-white/5 transition-colors"
            >
              Process Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
