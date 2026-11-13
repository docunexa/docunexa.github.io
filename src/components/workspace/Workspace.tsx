import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  Download,
  Archive,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  FolderArchive,
} from 'lucide-react';
import { UploadedFileItem, DocumentFormat, ConversionOptions } from '../../types';
import { convertSourceToTarget } from '../../converters';
import { createZipArchive } from '../../converters/utilities/zipArchive';
import { downloadBlob } from '../../utils/download';
import { formatBytes, getFileExtension } from '../../utils/formatters';
import { Dropzone } from '../common/Dropzone';
import { ProgressBar } from '../common/ProgressBar';
import { DocumentPreview } from '../preview/DocumentPreview';
import { Modal } from '../common/Modal';

interface WorkspaceProps {
  files: UploadedFileItem[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onClearFiles: () => void;
}

const COMPATIBLE_TARGETS: Record<string, DocumentFormat[]> = {
  pdf: ['docx', 'txt', 'png', 'jpg', 'html', 'md'],
  docx: ['pdf', 'txt', 'html', 'md'],
  txt: ['pdf', 'docx', 'md'],
  html: ['pdf', 'docx', 'txt'],
  md: ['pdf', 'docx', 'html'],
  png: ['jpg', 'webp', 'pdf'],
  jpg: ['png', 'webp', 'pdf'],
  jpeg: ['png', 'webp', 'pdf'],
  webp: ['png', 'jpg', 'pdf'],
};

export const Workspace: React.FC<WorkspaceProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onClearFiles,
}) => {
  const [fileList, setFileList] = useState<UploadedFileItem[]>(files);
  const [batchTarget, setBatchTarget] = useState<DocumentFormat | ''>('');
  const [globalOptions, setGlobalOptions] = useState<ConversionOptions>({
    imageQuality: 0.85,
    watermarkText: 'CONFIDENTIAL',
    watermarkOpacity: 0.3,
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isConvertingBatch, setIsConvertingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // Sync prop changes
  React.useEffect(() => {
    setFileList((prev) => {
      const existingIds = new Set(prev.map((f) => f.id));
      const newlyAdded = files.filter((f) => !existingIds.has(f.id));
      const remaining = prev.filter((p) => files.some((f) => f.id === p.id));
      return [...remaining, ...newlyAdded];
    });
  }, [files]);

  const handleUpdateTarget = (id: string, target: DocumentFormat) => {
    setFileList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, targetFormat: target } : item))
    );
  };

  const handleApplyBatchTarget = (target: DocumentFormat) => {
    setBatchTarget(target);
    setFileList((prev) =>
      prev.map((item) => ({ ...item, targetFormat: target }))
    );
  };

  const handleConvertSingle = async (item: UploadedFileItem) => {
    const ext = getFileExtension(item.name);
    const validTargets = COMPATIBLE_TARGETS[ext] || [];
    const target = item.targetFormat || validTargets[0] || 'pdf';

    setFileList((prev) =>
      prev.map((f) =>
        f.id === item.id
          ? { ...f, status: 'processing', progress: 10, progressMessage: 'Converting...' }
          : f
      )
    );

    try {
      const res = await convertSourceToTarget(
        item.file,
        target,
        globalOptions,
        (p, msg) => {
          setFileList((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, progress: p, progressMessage: msg } : f
            )
          );
        }
      );

      setFileList((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: 'done',
                progress: 100,
                progressMessage: 'Complete',
                resultBlob: res.blob,
                resultFilename: res.filename,
                resultSize: res.blob.size,
              }
            : f
        )
      );
    } catch (err: any) {
      setFileList((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: 'error',
                errorMessage: err.message || 'Conversion failed',
              }
            : f
        )
      );
    }
  };

  const handleConvertAll = async () => {
    setIsConvertingBatch(true);
    setBatchProgress(5);

    const queue = fileList.filter((f) => f.status !== 'done');
    let completedCount = 0;

    for (const item of queue) {
      await handleConvertSingle(item);
      completedCount++;
      setBatchProgress(Math.round((completedCount / queue.length) * 100));
    }

    setIsConvertingBatch(false);
  };

  const handleDownloadSingle = (item: UploadedFileItem) => {
    if (item.resultBlob && item.resultFilename) {
      downloadBlob(item.resultBlob, item.resultFilename);
    }
  };

  const handleDownloadAllAsZip = async () => {
    const convertedItems = fileList.filter((f) => f.status === 'done' && f.resultBlob);
    if (convertedItems.length === 0) return;

    const filesToZip = convertedItems.map((item) => ({
      name: item.resultFilename || `${item.name}-converted`,
      blob: item.resultBlob!,
    }));

    const zipResult = await createZipArchive(filesToZip, 'docuflow-converted-files.zip');
    downloadBlob(zipResult.blob, zipResult.filename);
  };

  const completedCount = fileList.filter((f) => f.status === 'done').length;

  return (
    <div className="space-y-8">
      {/* If no files, render prominent hero dropzone */}
      {fileList.length === 0 ? (
        <Dropzone onFilesSelected={onAddFiles} />
      ) : (
        <div className="border border-df-black/10 dark:border-df-white/10 rounded-card p-6 bg-df-white dark:bg-df-black shadow-sm space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-df-black/10 dark:border-df-white/10">
            <div>
              <h3 className="text-lg font-bold text-df-black dark:text-df-white tracking-tight">
                Conversion Queue ({fileList.length} File{fileList.length > 1 ? 's' : ''})
              </h3>
              <p className="text-xs text-df-black/60 dark:text-df-white/60">
                Choose target formats, adjust options, and convert instantly in your browser.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn border border-df-black/15 dark:border-df-white/15 hover:bg-df-black/5 dark:hover:bg-df-white/5 text-xs font-semibold text-df-black dark:text-df-white transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-df-blue" />
                <span>Conversion Settings</span>
              </button>

              <button
                type="button"
                onClick={onClearFiles}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn border border-df-pink/30 hover:bg-df-pink/10 text-xs font-semibold text-df-pink transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Batch Format Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-df-black/5 dark:bg-df-white/5 text-xs">
            <div className="flex items-center gap-2 font-medium text-df-black dark:text-df-white">
              <span>Convert all to:</span>
              <div className="flex flex-wrap gap-1.5">
                {(['pdf', 'docx', 'png', 'jpg', 'webp', 'txt', 'md'] as DocumentFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleApplyBatchTarget(fmt)}
                    className={`px-2 py-1 rounded font-mono uppercase text-[11px] font-semibold transition-colors ${
                      batchTarget === fmt
                        ? 'bg-df-blue text-df-white'
                        : 'bg-df-white dark:bg-df-black border border-df-black/10 dark:border-df-white/10 hover:border-df-blue text-df-black dark:text-df-white'
                    }`}
                  >
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {completedCount > 1 && (
                <button
                  type="button"
                  onClick={handleDownloadAllAsZip}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-df-pink hover:bg-df-pink/90 text-df-white text-xs font-semibold shadow-sm transition-transform active:scale-95"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Download All as ZIP ({completedCount})</span>
                </button>
              )}

              <button
                type="button"
                disabled={isConvertingBatch}
                onClick={handleConvertAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn bg-df-blue hover:bg-df-blue/90 disabled:opacity-50 text-df-white text-xs font-semibold shadow-sm transition-transform active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isConvertingBatch ? 'animate-spin' : ''}`} />
                <span>{isConvertingBatch ? 'Converting Queue...' : 'Convert All Files'}</span>
              </button>
            </div>
          </div>

          {/* File Cards List */}
          <div className="space-y-3">
            {fileList.map((item) => {
              const ext = getFileExtension(item.name);
              const allowedTargets = COMPATIBLE_TARGETS[ext] || ['pdf'];
              const currentTarget = item.targetFormat || allowedTargets[0] || 'pdf';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  {/* File Metadata */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-df-blue/10 text-df-blue flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-df-black dark:text-df-white truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase bg-df-black/10 dark:bg-df-white/10 text-df-black/80 dark:text-df-white/80">
                          {ext}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-df-black/60 dark:text-df-white/60 mt-0.5">
                        <span className="font-mono">{formatBytes(item.size)}</span>
                        {item.resultSize && (
                          <>
                            <span>&rarr;</span>
                            <span className="font-mono text-df-blue font-semibold">
                              {formatBytes(item.resultSize)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Format Selector & Progress */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {item.status === 'idle' && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-df-black/60 dark:text-df-white/60">Convert to:</span>
                        <select
                          value={currentTarget}
                          onChange={(e) => handleUpdateTarget(item.id, e.target.value as DocumentFormat)}
                          className="px-2.5 py-1.5 rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white font-mono uppercase text-xs focus:border-df-blue"
                        >
                          {allowedTargets.map((t) => (
                            <option key={t} value={t}>
                              .{t.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {item.status === 'processing' && (
                      <div className="w-36">
                        <ProgressBar progress={item.progress || 20} message={item.progressMessage} />
                      </div>
                    )}

                    {item.status === 'done' && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-df-blue font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-df-blue" />
                        <span>Ready</span>
                      </div>
                    )}

                    {item.status === 'error' && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-df-pink font-semibold">
                        <AlertCircle className="w-4 h-4 text-df-pink" />
                        <span className="truncate max-w-[120px]" title={item.errorMessage}>
                          {item.errorMessage || 'Failed'}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewFile(item.file)}
                        className="p-1.5 rounded border border-df-black/10 dark:border-df-white/10 hover:bg-df-black/5 dark:hover:bg-df-white/5 text-df-black/70 dark:text-df-white/70 hover:text-df-blue transition-colors"
                        title="Preview file"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {item.status === 'done' && (
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-df-blue hover:bg-df-blue/90 text-df-white text-xs font-semibold shadow-sm transition-transform active:scale-95"
                          title="Download result"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      )}

                      {item.status === 'idle' && (
                        <button
                          type="button"
                          onClick={() => handleConvertSingle(item)}
                          className="px-3 py-1.5 rounded-btn bg-df-blue hover:bg-df-blue/90 text-df-white text-xs font-semibold shadow-sm transition-transform active:scale-95"
                        >
                          Convert
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveFile(item.id)}
                        className="p-1.5 rounded hover:bg-df-pink/10 text-df-black/50 dark:text-df-white/50 hover:text-df-pink transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add more files dropzone */}
          <div className="pt-2">
            <Dropzone
              onFilesSelected={onAddFiles}
              multiple={true}
              className="py-6 sm:py-8"
              label="Add more files to queue"
              description="Drop additional files here to convert them in this batch."
            />
          </div>
        </div>
      )}

      {/* Global Conversion Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Conversion Workspace Settings"
        subtitle="Global defaults for compression, watermarking, and image quality."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-df-black dark:text-df-white">
              <span>Image & PDF Compression Quality</span>
              <span>{Math.round((globalOptions.imageQuality || 0.85) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={globalOptions.imageQuality || 0.85}
              onChange={(e) =>
                setGlobalOptions({
                  ...globalOptions,
                  imageQuality: parseFloat(e.target.value),
                })
              }
              className="w-full accent-df-blue"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-df-black dark:text-df-white">
              Default PDF Watermark Text
            </label>
            <input
              type="text"
              value={globalOptions.watermarkText || ''}
              onChange={(e) =>
                setGlobalOptions({ ...globalOptions, watermarkText: e.target.value })
              }
              className="w-full px-3 py-2 rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue"
            />
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="px-4 py-2 rounded-btn bg-df-blue text-df-white font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Document Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          title="Document Live Preview"
          subtitle={previewFile.name}
          maxWidth="2xl"
        >
          <DocumentPreview file={previewFile} />
        </Modal>
      )}
    </div>
  );
};

