import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Github,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Combine,
  Split,
  Minimize2,
  FileText,
  FileType,
  Images,
  Image as ImageIcon,
  Grid,
} from 'lucide-react';
import { ToolDefinition } from '../../types';
import { TOOLS_REGISTRY } from '../../tools/registry';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenPrivacy: () => void;
  onOpenAbout: () => void;
  onOpenFormats: () => void;
  onNavigateTools: () => void;
  onNavigateHome: () => void;
  onSelectTool: (tool: ToolDefinition) => void;
  onToggleMegaMenu: () => void;
  isMegaMenuOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenPrivacy,
  onOpenAbout,
  onOpenFormats,
  onNavigateTools,
  onNavigateHome,
  onSelectTool,
  onToggleMegaMenu,
  isMegaMenuOpen,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [convertDropdownOpen, setConvertDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setConvertDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolClick = (toolId: string) => {
    const tool = TOOLS_REGISTRY.find((t) => t.id === toolId);
    if (tool) {
      onSelectTool(tool);
      setConvertDropdownOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-df-black/10 dark:border-df-white/10 bg-df-white/95 dark:bg-df-black/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand + iLovePDF Style Primary Navigation */}
        <div className="flex items-center gap-8">
          {/* Brand Logo */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left group transition-transform active:scale-95"
            aria-label="DocuFlow Home"
          >
            <div className="w-9 h-9 rounded-lg bg-df-black dark:bg-df-white text-df-white dark:text-df-black flex items-center justify-center font-bold text-lg shadow-sm border border-df-black/10 dark:border-df-white/10">
              <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
                <path
                  d="M18 14H38L48 24V48C48 49.1 47.1 50 46 50H18C16.9 50 16 49.1 16 48V16C16 14.9 16.9 14 18 14Z"
                  fill="#2563EB"
                />
                <path
                  d="M24 32H38M38 32L33 27M38 32L33 37"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="44" cy="44" r="5" fill="#EC4899" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-df-black dark:text-df-white">
                  DocuFlow
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-df-pink/15 text-df-pink border border-df-pink/20">
                  Client-Side
                </span>
              </div>
            </div>
          </button>

          {/* iLovePDF-style Desktop Links */}
          <nav className="hidden lg:flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-df-black/85 dark:text-df-white/85">
            <button
              type="button"
              onClick={() => handleToolClick('pdf-merge')}
              className="px-3 py-2 rounded-lg hover:text-df-blue hover:bg-df-blue/10 transition-colors"
            >
              Merge PDF
            </button>

            <button
              type="button"
              onClick={() => handleToolClick('pdf-split')}
              className="px-3 py-2 rounded-lg hover:text-df-blue hover:bg-df-blue/10 transition-colors"
            >
              Split PDF
            </button>

            <button
              type="button"
              onClick={() => handleToolClick('pdf-compress')}
              className="px-3 py-2 rounded-lg hover:text-df-blue hover:bg-df-blue/10 transition-colors"
            >
              Compress PDF
            </button>

            {/* Convert PDF Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setConvertDropdownOpen(!convertDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg hover:text-df-blue hover:bg-df-blue/10 transition-colors ${
                  convertDropdownOpen ? 'text-df-blue bg-df-blue/10' : ''
                }`}
              >
                <span>Convert PDF</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {convertDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-df-black/50 dark:text-df-white/50 uppercase tracking-wider">
                    Convert From PDF
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToolClick('pdf-to-docx')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-df-black dark:text-df-white hover:bg-df-blue/10 hover:text-df-blue flex items-center gap-2.5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-df-blue" />
                    <span>PDF to Word (.docx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolClick('pdf-to-images')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-df-black dark:text-df-white hover:bg-df-blue/10 hover:text-df-blue flex items-center gap-2.5 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-df-pink" />
                    <span>PDF to JPG / PNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolClick('pdf-to-txt')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-df-black dark:text-df-white hover:bg-df-blue/10 hover:text-df-blue flex items-center gap-2.5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-df-black/60 dark:text-df-white/60" />
                    <span>PDF to Text (.txt)</span>
                  </button>

                  <div className="my-1.5 border-t border-df-black/10 dark:border-df-white/10" />

                  <div className="px-3 py-1.5 text-[10px] font-bold text-df-black/50 dark:text-df-white/50 uppercase tracking-wider">
                    Convert To PDF
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToolClick('docx-to-pdf')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-df-black dark:text-df-white hover:bg-df-blue/10 hover:text-df-blue flex items-center gap-2.5 transition-colors"
                  >
                    <FileType className="w-4 h-4 text-df-blue" />
                    <span>Word to PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolClick('images-to-pdf')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-df-black dark:text-df-white hover:bg-df-blue/10 hover:text-df-blue flex items-center gap-2.5 transition-colors"
                  >
                    <Images className="w-4 h-4 text-df-pink" />
                    <span>JPG / PNG to PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolClick('txt-to-pdf')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-df-black dark:text-df-white hover:bg-df-blue/10 hover:text-df-blue flex items-center gap-2.5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-df-black/60 dark:text-df-white/60" />
                    <span>Text (.txt) to PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToolClick('html-to-pdf')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-df-black dark:text-df-white hover:bg-df-blue/10 hover:text-df-blue flex items-center gap-2.5 transition-colors"
                  >
                    <FileType className="w-4 h-4 text-df-blue" />
                    <span>HTML to PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* All PDF Tools MegaMenu Trigger */}
            <button
              type="button"
              onClick={onToggleMegaMenu}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all ${
                isMegaMenuOpen
                  ? 'bg-df-blue text-df-white shadow-sm'
                  : 'hover:text-df-blue hover:bg-df-blue/10'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-df-pink" />
              <span>All PDF Tools</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMegaMenuOpen ? 'rotate-180 text-df-white' : ''
                }`}
              />
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Privacy Guarantee Pill */}
          <button
            onClick={onOpenPrivacy}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-df-black/10 dark:border-df-white/10 hover:bg-df-blue/10 hover:border-df-blue/30 text-xs font-semibold text-df-black/80 dark:text-df-white/80 hover:text-df-blue transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-df-blue" />
            <span>100% Client-Side</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg border border-df-black/10 dark:border-df-white/10 hover:bg-df-black/5 dark:hover:bg-df-white/5 text-df-black dark:text-df-white transition-colors"
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-df-pink" /> : <Moon className="w-4 h-4 text-df-blue" />}
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/mohdshamii/prototype"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-df-black/10 dark:border-df-white/10 hover:bg-df-black/5 dark:hover:bg-df-white/5 text-xs font-semibold text-df-black dark:text-df-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-df-black/10 dark:border-df-white/10 text-df-black dark:text-df-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black px-4 pt-3 pb-6 space-y-3">
          <div className="text-[10px] font-bold text-df-black/50 dark:text-df-white/50 uppercase tracking-wider">
            Popular PDF Tools
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleToolClick('pdf-merge')}
              className="p-2 text-left text-xs font-bold rounded-lg border border-df-black/10 dark:border-df-white/10 hover:bg-df-blue/10 hover:text-df-blue"
            >
              Merge PDF
            </button>
            <button
              onClick={() => handleToolClick('pdf-split')}
              className="p-2 text-left text-xs font-bold rounded-lg border border-df-black/10 dark:border-df-white/10 hover:bg-df-blue/10 hover:text-df-blue"
            >
              Split PDF
            </button>
            <button
              onClick={() => handleToolClick('pdf-compress')}
              className="p-2 text-left text-xs font-bold rounded-lg border border-df-black/10 dark:border-df-white/10 hover:bg-df-blue/10 hover:text-df-blue"
            >
              Compress PDF
            </button>
            <button
              onClick={() => handleToolClick('pdf-to-docx')}
              className="p-2 text-left text-xs font-bold rounded-lg border border-df-black/10 dark:border-df-white/10 hover:bg-df-blue/10 hover:text-df-blue"
            >
              PDF to Word
            </button>
            <button
              onClick={() => handleToolClick('docx-to-pdf')}
              className="p-2 text-left text-xs font-bold rounded-lg border border-df-black/10 dark:border-df-white/10 hover:bg-df-blue/10 hover:text-df-blue"
            >
              Word to PDF
            </button>
            <button
              onClick={() => handleToolClick('pdf-sign')}
              className="p-2 text-left text-xs font-bold rounded-lg border border-df-black/10 dark:border-df-white/10 hover:bg-df-blue/10 hover:text-df-blue"
            >
              Sign PDF
            </button>
          </div>

          <div className="pt-2 border-t border-df-black/10 dark:border-df-white/10 space-y-2">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-1 text-sm font-medium text-df-black dark:text-df-white hover:text-df-blue"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigateTools();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-1 text-sm font-medium text-df-black dark:text-df-white hover:text-df-blue"
            >
              All 50+ Tools
            </button>
            <button
              onClick={() => {
                onOpenFormats();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-1 text-sm font-medium text-df-black dark:text-df-white hover:text-df-blue"
            >
              Supported Formats
            </button>
            <button
              onClick={() => {
                onOpenPrivacy();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-1 text-sm font-medium text-df-black dark:text-df-white hover:text-df-blue"
            >
              Privacy Guarantee
            </button>
            <button
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-1 text-sm font-medium text-df-black dark:text-df-white hover:text-df-blue"
            >
              About DocuFlow
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
