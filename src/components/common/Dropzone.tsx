import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, ShieldCheck } from 'lucide-react';
import { DocumentFormat } from '../../types';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFormats?: DocumentFormat[];
  multiple?: boolean;
  className?: string;
  label?: string;
  description?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  acceptedFormats,
  multiple = true,
  className = '',
  label = 'Drag and drop your documents here',
  description = 'Supports PDF, Word (.docx), Images, Plain Text, Markdown, and HTML up to 100MB',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  const buildAcceptString = () => {
    if (!acceptedFormats || acceptedFormats.length === 0 || acceptedFormats.includes('any')) {
      return '.pdf,.docx,.doc,.txt,.md,.html,.png,.jpg,.jpeg,.webp';
    }
    return acceptedFormats.map((f) => `.${f}`).join(',');
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative group cursor-pointer border-2 border-dashed rounded-card p-8 sm:p-12 text-center transition-all duration-200 ${
        isDragOver
          ? 'border-df-blue bg-df-blue/5 scale-[1.01]'
          : 'border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black hover:border-df-blue/50 dark:hover:border-df-blue/50'
      } ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={buildAcceptString()}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload files"
      />

      <div className="flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-df-blue/10 dark:bg-df-blue/20 text-df-blue flex items-center justify-center group-hover:scale-105 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-df-black dark:text-df-white tracking-tight">
            {label}
          </h3>
          <p className="text-xs sm:text-sm text-df-black/60 dark:text-df-white/60">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            className="px-5 py-2.5 rounded-btn bg-df-blue hover:bg-df-blue/90 text-df-white text-sm font-semibold shadow-sm transition-transform active:scale-95"
          >
            Browse Files
          </button>
        </div>

        {/* Formats badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          {['PDF', 'DOCX', 'PNG', 'JPG', 'WEBP', 'TXT', 'MD', 'HTML'].map((fmt) => (
            <span
              key={fmt}
              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-df-black/5 dark:bg-df-white/5 border border-df-black/10 dark:border-df-white/10 text-df-black/70 dark:text-df-white/70"
            >
              .{fmt.toLowerCase()}
            </span>
          ))}
        </div>

        {/* Privacy reassurance badge */}
        <div className="pt-2 flex items-center gap-1.5 text-xs text-df-black/60 dark:text-df-white/60">
          <ShieldCheck className="w-4 h-4 text-df-blue" />
          <span>Files stay private on your computer. 100% processed locally.</span>
        </div>
      </div>
    </div>
  );
};

