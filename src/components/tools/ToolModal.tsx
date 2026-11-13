import React, { useState } from 'react';
import { Download, RefreshCw, FileCheck2, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
import { ToolDefinition, ConversionOptions } from '../../types';
import { executeToolConversion } from '../../converters';
import { downloadBlob } from '../../utils/download';
import { formatBytes } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Dropzone } from '../common/Dropzone';
import { ProgressBar } from '../common/ProgressBar';
import { DocumentPreview } from '../preview/DocumentPreview';

interface ToolModalProps {
  tool: ToolDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ToolModal: React.FC<ToolModalProps> = ({ tool, isOpen, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<ConversionOptions>({
    rotationAngle: 90,
    pageRange: '',
    watermarkText: 'CONFIDENTIAL',
    watermarkOpacity: 0.3,
    watermarkFontSize: 48,
    pdfPassword: '',
    pageNumberPosition: 'bottom-center',
    imageQuality: 0.85,
    resizeWidth: 800,
    resizeMaintainAspect: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!tool) return null;

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setResultBlob(null);
    setErrorMessage(null);
  };

  const handleRunConversion = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(5);
    setProgressMessage('Starting conversion...');
    setErrorMessage(null);

    try {
      const res = await executeToolConversion(
        tool.id,
        selectedFiles,
        options,
        (p, msg) => {
          setProgress(p);
          setProgressMessage(msg);
        }
      );

      setResultBlob(res.blob);
      setResultFilename(res.filename);
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed. Please check your file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultBlob && resultFilename) {
      downloadBlob(resultBlob, resultFilename);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setResultBlob(null);
    setErrorMessage(null);
    setProgress(0);
  };

  const isMultiFileTool = ['pdf-merge', 'docx-merge', 'images-to-pdf', 'zip-create', 'batch-image-convert'].includes(tool.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tool.name}
      subtitle={tool.description}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Notice/Disclosures */}
        {tool.statusNotice && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-df-blue/10 border border-df-blue/20 text-xs text-df-black dark:text-df-white">
            <AlertCircle className="w-4 h-4 text-df-blue shrink-0 mt-0.5" />
            <div className="leading-relaxed">{tool.statusNotice}</div>
          </div>
        )}

        {/* Upload State */}
        {selectedFiles.length === 0 && !resultBlob && (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            acceptedFormats={tool.sourceFormats}
            multiple={isMultiFileTool}
            label={isMultiFileTool ? 'Upload files to combine' : `Select a .${tool.sourceFormats.join(', .')} file`}
            description="Processed 100% locally in your browser with zero data uploads."
          />
        )}

        {/* Files Selected & Options Stage */}
        {selectedFiles.length > 0 && !resultBlob && (
          <div className="space-y-5">
            {/* Selected File Card */}
            <div className="p-4 rounded-lg bg-df-black/5 dark:bg-df-white/5 border border-df-black/10 dark:border-df-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-df-black dark:text-df-white">
                  Selected {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}:
                </span>
                <button
                  onClick={handleReset}
                  className="text-df-pink hover:underline font-medium"
                >
                  Change Files
                </button>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-df-black/70 dark:text-df-white/70">
                    <span className="truncate max-w-[70%]">{f.name}</span>
                    <span className="font-mono">{formatBytes(f.size)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tool-Specific Options */}
            <div className="p-4 rounded-lg border border-df-black/10 dark:border-df-white/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-df-black/50 dark:text-df-white/50">
                Tool Settings
              </h4>

              {/* Rotation angle */}
              {tool.id === 'pdf-rotate' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-df-black dark:text-df-white">Rotation Angle</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setOptions({ ...options, rotationAngle: deg as any })}
                        className={`py-2 text-xs font-semibold rounded border transition-colors ${
                          options.rotationAngle === deg
                            ? 'bg-df-blue text-df-white border-df-blue'
                            : 'border-df-black/15 dark:border-df-white/15 hover:bg-df-black/5 dark:hover:bg-df-white/5'
                        }`}
                      >
                        {deg}° Clockwise
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Page ranges (split, extract, delete) */}
              {['pdf-split', 'pdf-extract-pages'].includes(tool.id) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-df-black dark:text-df-white">
                    Page Ranges (e.g. "1-3, 5")
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty for all or specify e.g. 1-2, 4"
                    value={options.pageRange || ''}
                    onChange={(e) => setOptions({ ...options, pageRange: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue"
                  />
                </div>
              )}

              {/* Pages to delete */}
              {tool.id === 'pdf-delete-pages' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-df-black dark:text-df-white">
                    Pages to Remove (e.g. "1, 3-5")
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2, 4"
                    value={options.pagesToDelete || ''}
                    onChange={(e) => setOptions({ ...options, pagesToDelete: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue"
                  />
                </div>
              )}

              {/* Watermark text */}
              {tool.id === 'pdf-watermark-text' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-df-black dark:text-df-white">Watermark Text</label>
                    <input
                      type="text"
                      value={options.watermarkText || ''}
                      onChange={(e) => setOptions({ ...options, watermarkText: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-df-black dark:text-df-white">Opacity</span>
                      <span>{Math.round((options.watermarkOpacity || 0.3) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={options.watermarkOpacity || 0.3}
                      onChange={(e) => setOptions({ ...options, watermarkOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-df-blue"
                    />
                  </div>
                </div>
              )}

              {/* PDF Password (protect / unlock) */}
              {['pdf-protect', 'pdf-unlock'].includes(tool.id) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-df-black dark:text-df-white">
                    {tool.id === 'pdf-protect' ? 'Set Document Password' : 'Enter Authorized Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={options.pdfPassword || ''}
                    onChange={(e) => setOptions({ ...options, pdfPassword: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue"
                  />
                </div>
              )}

              {/* Page Number Position */}
              {tool.id === 'pdf-page-numbers' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-df-black dark:text-df-white">Stamp Position</label>
                  <select
                    value={options.pageNumberPosition}
                    onChange={(e) => setOptions({ ...options, pageNumberPosition: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue"
                  >
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>
              )}

              {/* Image quality */}
              {['image-compress', 'png-to-jpg', 'image-to-webp', 'pdf-compress'].includes(tool.id) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-df-black dark:text-df-white">Compression Quality</span>
                    <span className="font-mono">{Math.round((options.imageQuality || 0.85) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={options.imageQuality || 0.85}
                    onChange={(e) => setOptions({ ...options, imageQuality: parseFloat(e.target.value) })}
                    className="w-full accent-df-blue"
                  />
                </div>
              )}

              {/* Image Resize Width */}
              {tool.id === 'image-resize' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-df-black dark:text-df-white">Width (px)</label>
                    <input
                      type="number"
                      value={options.resizeWidth || 800}
                      onChange={(e) => setOptions({ ...options, resizeWidth: parseInt(e.target.value, 10) || 800 })}
                      className="w-full px-3 py-2 text-xs rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="maintainAspect"
                      checked={options.resizeMaintainAspect ?? true}
                      onChange={(e) => setOptions({ ...options, resizeMaintainAspect: e.target.checked })}
                      className="accent-df-blue"
                    />
                    <label htmlFor="maintainAspect" className="text-xs text-df-black dark:text-df-white font-medium">
                      Lock Aspect Ratio
                    </label>
                  </div>
                </div>
              )}

              {/* PDF Metadata Editor */}
              {tool.id === 'pdf-metadata' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-df-black dark:text-df-white">Document Title</label>
                    <input
                      type="text"
                      placeholder="Title"
                      value={options.pdfTitle || ''}
                      onChange={(e) => setOptions({ ...options, pdfTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-df-black dark:text-df-white">Author</label>
                    <input
                      type="text"
                      placeholder="Author"
                      value={options.pdfAuthor || ''}
                      onChange={(e) => setOptions({ ...options, pdfAuthor: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar during processing */}
            {isProcessing && (
              <ProgressBar progress={progress} message={progressMessage} />
            )}

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-df-pink/10 border border-df-pink/20 text-df-pink text-xs leading-relaxed">
                {errorMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-df-black/15 dark:border-df-white/15 hover:bg-df-black/5 dark:hover:bg-df-white/5 text-xs font-semibold text-df-black dark:text-df-white transition-colors"
              >
                <Eye className="w-4 h-4 text-df-blue" />
                <span>{showPreview ? 'Hide Preview' : 'Preview Document'}</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRunConversion}
                className="px-6 py-2.5 rounded-btn bg-df-blue hover:bg-df-blue/90 disabled:opacity-50 text-df-white text-sm font-semibold shadow-sm transition-transform active:scale-95"
              >
                {isProcessing ? 'Processing...' : 'Run Tool'}
              </button>
            </div>

            {/* Live Preview Drawer */}
            {showPreview && selectedFiles[0] && (
              <div className="pt-4 border-t border-df-black/10 dark:border-df-white/10">
                <DocumentPreview file={selectedFiles[0]} />
              </div>
            )}
          </div>
        )}

        {/* Success / Result State */}
        {resultBlob && (
          <div className="p-6 rounded-card border border-df-blue/30 bg-df-blue/5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-df-blue text-df-white flex items-center justify-center mx-auto shadow-sm">
              <FileCheck2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-base text-df-black dark:text-df-white">
                Conversion Successful!
              </h4>
              <p className="text-xs text-df-black/70 dark:text-df-white/70">
                Generated: <strong className="font-mono text-df-black dark:text-df-white">{resultFilename}</strong> ({formatBytes(resultBlob.size)})
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-btn bg-df-blue hover:bg-df-blue/90 text-df-white text-sm font-semibold shadow-sm transition-transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Result</span>
              </button>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-btn border border-df-black/15 dark:border-df-white/15 hover:bg-df-black/5 dark:hover:bg-df-white/5 text-xs font-semibold text-df-black dark:text-df-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Process Another File</span>
              </button>
            </div>

            <div className="text-[11px] text-df-black/50 dark:text-df-white/50 pt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-df-blue" />
              <span>Processed locally in browser. No file data was uploaded to any remote server.</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

