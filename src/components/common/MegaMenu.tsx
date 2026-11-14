import React from 'react';
import {
  Combine,
  Split,
  Copy,
  ArrowUpDown,
  RotateCw,
  Trash2,
  Minimize2,
  FileType,
  Images,
  FileCheck,
  Globe,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  FileCode,
  Code,
  FileCode2,
  FolderArchive,
  Hash,
  Stamp,
  Type,
  Crop,
  Lock,
  Unlock,
  Sparkles,
  ShieldCheck,
  Archive,
  Info,
  LucideIcon,
  X,
} from 'lucide-react';
import { ToolDefinition } from '../../types';
import { TOOLS_REGISTRY } from '../../tools/registry';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolDefinition) => void;
}

interface MenuCategory {
  title: string;
  toolIds: string[];
}

const MENU_CATEGORIES: MenuCategory[] = [
  {
    title: 'Organize PDF',
    toolIds: ['pdf-merge', 'pdf-split', 'pdf-extract-pages', 'pdf-delete-pages', 'pdf-reorder', 'pdf-rotate'],
  },
  {
    title: 'Optimize PDF',
    toolIds: ['pdf-compress', 'pdf-metadata'],
  },
  {
    title: 'Convert to PDF',
    toolIds: ['docx-to-pdf', 'images-to-pdf', 'txt-to-pdf', 'html-to-pdf', 'markdown-to-pdf'],
  },
  {
    title: 'Convert from PDF',
    toolIds: ['pdf-to-docx', 'pdf-to-images', 'pdf-to-txt', 'pdf-to-html', 'pdf-to-markdown', 'pdf-extract-images'],
  },
  {
    title: 'Edit PDF',
    toolIds: ['pdf-rotate', 'pdf-page-numbers', 'pdf-watermark-text', 'pdf-watermark-image', 'pdf-add-text', 'pdf-crop'],
  },
  {
    title: 'PDF Security',
    toolIds: ['pdf-protect', 'pdf-unlock', 'pdf-sign', 'pdf-redact', 'pdf-compare'],
  },
  {
    title: 'Web & Utilities',
    toolIds: ['zip-create', 'checksum-generator', 'file-info', 'markdown-to-html', 'docx-to-markdown'],
  },
];

const ICON_MAP: Record<string, LucideIcon> = {
  Combine,
  Split,
  Copy,
  ArrowUpDown,
  RotateCw,
  Trash2,
  Minimize2,
  FileType,
  Images,
  FileCheck,
  Globe,
  FileCheck2,
  FileText,
  Image: ImageIcon,
  FileCode,
  Code,
  FileCode2,
  FolderArchive,
  Hash,
  Stamp,
  Type,
  Crop,
  Lock,
  Unlock,
  Sparkles,
  ShieldCheck,
  Archive,
  Info,
};

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose, onSelectTool }) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 w-full bg-df-white/95 dark:bg-df-black/95 backdrop-blur-xl border-b border-df-black/10 dark:border-df-white/10 shadow-2xl z-50 animate-fadeIn"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Flagship Banner */}
        <div className="mb-6 p-4 rounded-xl bg-df-blue/10 border border-df-blue/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-df-blue text-df-white flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-5 h-5 text-df-pink" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-df-black dark:text-df-white text-sm">
                  DocuFlow All-in-One Workspace
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-df-pink/15 text-df-pink border border-df-pink/20">
                  100% Free &amp; Client-Side
                </span>
              </div>
              <p className="text-xs text-df-black/70 dark:text-df-white/70">
                Every document tool to convert, merge, split, compress, and sign PDFs locally with zero server uploads.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-df-black/50 hover:text-df-black dark:text-df-white/50 dark:hover:text-df-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7 Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
          {MENU_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="space-y-3">
              <div className="pb-1.5 border-b border-df-black/10 dark:border-df-white/10">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-df-black/60 dark:text-df-white/60">
                  {cat.title}
                </h4>
              </div>
              <ul className="space-y-1">
                {cat.toolIds.map((id) => {
                  const tool = TOOLS_REGISTRY.find((t) => t.id === id);
                  if (!tool) return null;
                  const Icon = ICON_MAP[tool.iconName] || FileText;

                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTool(tool);
                          onClose();
                        }}
                        className="w-full text-left flex items-center gap-2 p-1.5 rounded-lg text-xs font-medium text-df-black/80 dark:text-df-white/80 hover:bg-df-blue/10 hover:text-df-blue dark:hover:text-df-blue transition-colors group"
                      >
                        <Icon className="w-3.5 h-3.5 text-df-black/50 dark:text-df-white/50 group-hover:text-df-blue transition-colors shrink-0" />
                        <span className="truncate">{tool.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
