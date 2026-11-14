import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Upload,
  X,
  FileText,
  FileCode,
  Image as ImageIcon,
  Images,
  Code,
  FileType,
  FileCheck,
  Globe,
  Combine,
  Split,
  Copy,
  ArrowUpDown,
  RotateCw,
  Trash2,
  Minimize2,
  Lock,
  Unlock,
  Hash,
  Stamp,
  Sparkles,
  Type,
  FolderArchive,
  Info,
  FilePlus,
  Files,
  Eye,
  Maximize2,
  Minimize,
  Crop,
  Sliders,
  Layers,
  Archive,
  HelpCircle,
  Calculator,
  ShieldCheck,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { ToolDefinition, ToolCategory } from '../../types';
import { TOOLS_REGISTRY } from '../../tools/registry';

interface HeroProps {
  onFilesSelected: (files: File[]) => void;
  onSelectTool: (tool: ToolDefinition) => void;
}

const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'all', label: 'All Tools' },
  { id: 'pdf', label: 'PDF Tools' },
  { id: 'word', label: 'Word (.docx)' },
  { id: 'image', label: 'Images' },
  { id: 'text', label: 'Text & Web' },
  { id: 'utility', label: 'Utilities' },
];

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  FileCode,
  Image: ImageIcon,
  Images,
  Code,
  FileType,
  FileCheck,
  Globe,
  Combine,
  Split,
  Copy,
  ArrowUpDown,
  RotateCw,
  Trash2,
  Minimize2,
  Lock,
  Unlock,
  Hash,
  Stamp,
  Sparkles,
  Type,
  FolderArchive,
  Info,
  FilePlus,
  Files,
  Eye,
  Maximize2,
  Minimize,
  Crop,
  Sliders,
  Layers,
  Archive,
  HelpCircle,
  Calculator,
  ShieldCheck,
};

// Priority order for the primary PDF tools
const PRIORITY_TOOL_IDS = [
  'pdf-merge',
  'pdf-split',
  'pdf-compress',
  'pdf-to-docx',
  'docx-to-pdf',
  'pdf-to-images',
  'images-to-pdf',
  'pdf-sign',
  'pdf-watermark-text',
  'pdf-rotate',
  'pdf-page-numbers',
  'pdf-protect',
  'pdf-unlock',
  'pdf-crop',
  'pdf-redact',
  'pdf-compare',
];

export const Hero: React.FC<HeroProps> = ({ onFilesSelected, onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter tools with priority ordering
  const displayTools = useMemo(() => {
    let list = TOOLS_REGISTRY.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.sourceFormats.some((fmt) => fmt.toLowerCase().includes(q)) ||
        (tool.targetFormat && tool.targetFormat.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });

    if (selectedCategory === 'all' && !searchQuery.trim()) {
      // Sort priority tools to the front
      list = [...list].sort((a, b) => {
        const indexA = PRIORITY_TOOL_IDS.indexOf(a.id);
        const indexB = PRIORITY_TOOL_IDS.indexOf(b.id);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
    }

    return list;
  }, [selectedCategory, searchQuery]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <section className="pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Simple & Human Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-df-black dark:text-df-white">
            Every tool you need to work with PDFs in one place
          </h1>
          <p className="text-sm sm:text-base text-df-black/65 dark:text-df-white/65 max-w-xl mx-auto leading-relaxed">
            Free, fast, and completely in your browser. Merge, split, compress, convert, rotate, and sign documents with zero server uploads.
          </p>
        </div>

        {/* Compact Quick-Drop Bar */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`max-w-3xl mx-auto p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
            isDragOver
              ? 'border-df-blue bg-df-blue/5 scale-[1.01]'
              : 'border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black hover:border-df-blue/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-df-blue/10 text-df-blue flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-df-black dark:text-df-white">
                Convert or manage any document directly
              </p>
              <p className="text-[11px] text-df-black/55 dark:text-df-white/55">
                Drop your file here (PDF, Word, Images, TXT, HTML) or choose a tool below
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-df-blue hover:bg-df-blue/90 text-df-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Select Document
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div id="all-tools" className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-df-black/10 dark:border-df-white/10">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-df-blue text-df-white shadow-sm'
                      : 'text-df-black/70 dark:text-df-white/70 hover:bg-df-black/5 dark:hover:bg-df-white/5 hover:text-df-black dark:hover:text-df-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Clean Search Input */}
            <div className="w-full sm:w-64 relative">
              <Search className="w-4 h-4 text-df-black/40 dark:text-df-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black text-xs text-df-black dark:text-df-white placeholder:text-df-black/40 dark:placeholder:text-df-white/40 focus:outline-none focus:border-df-blue transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-df-black/40 hover:text-df-black dark:text-df-white/40 dark:hover:text-df-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Unified Tool Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayTools.map((tool) => {
              const Icon = ICON_MAP[tool.iconName] || FileText;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => onSelectTool(tool)}
                  className="group text-left p-5 rounded-2xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black hover:border-df-blue dark:hover:border-df-blue hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-df-blue/10 text-df-blue flex items-center justify-center group-hover:bg-df-blue group-hover:text-df-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-df-black dark:text-df-white group-hover:text-df-blue transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-df-black/60 dark:text-df-white/60 mt-1 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-df-black/5 dark:border-df-white/5 flex items-center text-xs font-semibold text-df-blue opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </button>
              );
            })}
          </div>

          {displayTools.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm font-semibold text-df-black/60 dark:text-df-white/60">
                No tools match &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-bold text-df-blue hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Clean, Subtle Trust Bar */}
        <div className="pt-8 border-t border-df-black/10 dark:border-df-white/10 text-center">
          <p className="text-xs text-df-black/50 dark:text-df-white/50">
            &bull; Processed 100% locally in your browser &bull; Your files never leave your computer &bull; Free forever with no limits
          </p>
        </div>
      </div>
    </section>
  );
};
