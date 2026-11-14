import React from 'react';
import {
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Combine,
  Split,
  Minimize2,
  FileText,
  FileType,
  Image as ImageIcon,
  Images,
  Stamp,
  RotateCw,
  Unlock,
  Hash,
  Crop,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { Dropzone } from '../common/Dropzone';
import { ToolDefinition } from '../../types';
import { TOOLS_REGISTRY } from '../../tools/registry';

interface HeroProps {
  onFilesSelected: (files: File[]) => void;
  onExploreTools: () => void;
  onSelectTool: (tool: ToolDefinition) => void;
}

interface HeroQuickTool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  isPink?: boolean;
}

const HERO_QUICK_TOOLS: HeroQuickTool[] = [
  {
    id: 'pdf-merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one unified document in any order.',
    icon: Combine,
    badge: 'Popular',
  },
  {
    id: 'pdf-split',
    name: 'Split PDF',
    description: 'Extract custom page ranges or separate all pages into individual files.',
    icon: Split,
    badge: 'Popular',
  },
  {
    id: 'pdf-compress',
    name: 'Compress PDF',
    description: 'Reduce PDF file size drastically while retaining pristine visual quality.',
    icon: Minimize2,
    badge: 'Optimized',
  },
  {
    id: 'pdf-to-docx',
    name: 'PDF to Word',
    description: 'Convert PDF documents into editable Microsoft Word (.docx) files.',
    icon: FileText,
    badge: 'High-Fidelity',
  },
  {
    id: 'docx-to-pdf',
    name: 'Word to PDF',
    description: 'Transform DOCX documents into clean, universal PDF documents.',
    icon: FileType,
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to JPG',
    description: 'Extract pages as high-resolution JPG or PNG images in seconds.',
    icon: ImageIcon,
  },
  {
    id: 'images-to-pdf',
    name: 'JPG to PDF',
    description: 'Turn your JPG/PNG images into a single professional PDF document.',
    icon: Images,
  },
  {
    id: 'pdf-sign',
    name: 'Sign PDF',
    description: 'Draw, type, or upload your signature directly onto your PDF pages.',
    icon: Sparkles,
    badge: 'New',
    isPink: true,
  },
  {
    id: 'pdf-watermark-text',
    name: 'Watermark',
    description: 'Stamp customized text or image watermarks with precise opacity and angle.',
    icon: Stamp,
  },
  {
    id: 'pdf-rotate',
    name: 'Rotate PDF',
    description: 'Rotate individual pages or entire documents 90° or 180° clockwise.',
    icon: RotateCw,
  },
  {
    id: 'pdf-page-numbers',
    name: 'Page Numbers',
    description: 'Insert formatted page numbers into any corner or center of your PDF.',
    icon: Hash,
  },
  {
    id: 'pdf-protect',
    name: 'Protect PDF',
    description: 'Encrypt your PDF with standard password protection for security.',
    icon: Lock,
  },
  {
    id: 'pdf-unlock',
    name: 'Unlock PDF',
    description: 'Remove password restrictions with client-side decryption.',
    icon: Unlock,
  },
  {
    id: 'pdf-crop',
    name: 'Crop PDF',
    description: 'Trim page margins or set custom bounding box coordinates.',
    icon: Crop,
    badge: 'New',
  },
  {
    id: 'pdf-redact',
    name: 'Redact PDF',
    description: 'Permanently black out sensitive or confidential information.',
    icon: ShieldCheck,
    badge: 'Secure',
  },
  {
    id: 'pdf-compare',
    name: 'Compare PDFs',
    description: 'Analyze side-by-side textual and structural differences.',
    icon: Split,
  },
];

export const Hero: React.FC<HeroProps> = ({ onFilesSelected, onExploreTools, onSelectTool }) => {
  const handleQuickToolClick = (toolId: string) => {
    const tool = TOOLS_REGISTRY.find((t) => t.id === toolId);
    if (tool) {
      onSelectTool(tool);
    }
  };

  return (
    <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Brand Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-df-blue/10 border border-df-blue/20 text-xs font-bold text-df-blue shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-df-pink" />
            <span>Every tool you need to work with PDFs in one place</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-df-black dark:text-df-white leading-[1.1]">
            Every document.{' '}
            <span className="text-df-blue underline decoration-df-pink decoration-wavy decoration-2">
              One simple workspace.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-df-black/75 dark:text-df-white/75 max-w-2xl mx-auto leading-relaxed font-normal">
            Every tool you need to use PDFs, at your fingertips. All are <strong className="text-df-blue font-semibold">100% FREE</strong> and easy to use! Merge, split, compress, convert, rotate, sign, crop, and watermark PDFs with just a few clicks.
          </p>
        </div>

        {/* Signature iLovePDF-Style Quick Tools Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-df-black/10 dark:border-df-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-df-black/60 dark:text-df-white/60">
                Most Popular PDF Tools
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-df-blue/10 text-df-blue border border-df-blue/20">
                Direct Interactive Mode
              </span>
            </div>
            <button
              type="button"
              onClick={onExploreTools}
              className="text-xs font-bold text-df-blue hover:text-df-blue/80 flex items-center gap-1 group"
            >
              <span>View all 50+ tools</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {HERO_QUICK_TOOLS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleQuickToolClick(item.id)}
                  className="group text-left p-5 rounded-2xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black hover:border-df-blue/50 dark:hover:border-df-blue/50 hover:shadow-lg shadow-sm transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                          item.isPink
                            ? 'bg-df-pink/15 text-df-pink border border-df-pink/20'
                            : 'bg-df-blue/10 text-df-blue border border-df-blue/20'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.isPink
                              ? 'bg-df-pink/15 text-df-pink border border-df-pink/20'
                              : 'bg-df-blue/10 text-df-blue border border-df-blue/20'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-df-black dark:text-df-white group-hover:text-df-blue transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-df-black/65 dark:text-df-white/65 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-df-black/5 dark:border-df-white/5 flex items-center text-[11px] font-bold text-df-blue opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open tool</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Universal Multi-Format Dropzone */}
        <div className="max-w-4xl mx-auto pt-6 space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-df-black dark:text-df-white">
              Or Convert Any Document Instantly
            </h3>
            <p className="text-xs text-df-black/60 dark:text-df-white/60">
              Drag &amp; drop any Word (.docx), PDF, Image (PNG/JPG/WebP), TXT, Markdown, or HTML file below
            </p>
          </div>
          <Dropzone
            onFilesSelected={onFilesSelected}
            className="shadow-md hover:shadow-xl transition-shadow bg-df-white dark:bg-df-black border-2 border-dashed border-df-black/15 dark:border-df-white/15 hover:border-df-blue"
          />
        </div>

        {/* 3 Pillars Trust Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-4">
          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black">
            <div className="w-9 h-9 rounded-lg bg-df-blue/10 text-df-blue flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-df-black dark:text-df-white">100% Client-Side Privacy</h4>
              <p className="text-xs text-df-black/60 dark:text-df-white/60 mt-0.5">
                Every document is processed in your local browser sandbox. Zero bytes ever leave your device.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black">
            <div className="w-9 h-9 rounded-lg bg-df-pink/10 text-df-pink flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-df-black dark:text-df-white">Instant Local Processing</h4>
              <p className="text-xs text-df-black/60 dark:text-df-white/60 mt-0.5">
                Eliminate upload delays and file queue wait times. Powered by high-speed client WebAssembly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black">
            <div className="w-9 h-9 rounded-lg bg-df-black/10 dark:bg-df-white/10 text-df-black dark:text-df-white flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-df-black dark:text-df-white">Completely Free Forever</h4>
              <p className="text-xs text-df-black/60 dark:text-df-white/60 mt-0.5">
                No credit cards, no premium tiers, no hidden limits, and no watermark additions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
