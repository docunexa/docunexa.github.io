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
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-df-black/10 dark:border-df-white/10">
          <div>
            <h3 className="font-bold text-base text-df-black dark:text-df-white">All PDF &amp; Document Tools</h3>
            <p className="text-xs text-df-black/60 dark:text-df-white/60">Select any tool to open directly in the editor</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-df-black/50 hover:text-df-black dark:text-df-white/50 dark:hover:text-df-white hover:bg-df-black/5 dark:hover:bg-df-white/5 transition-colors"
            aria-label="Close menu"
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
