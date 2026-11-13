import React, { useState } from 'react';
import { Sun, Moon, Github, Menu, X, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenPrivacy: () => void;
  onOpenAbout: () => void;
  onOpenFormats: () => void;
  onNavigateTools: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenPrivacy,
  onOpenAbout,
  onOpenFormats,
  onNavigateTools,
  onNavigateHome,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-df-black/10 dark:border-df-white/10 bg-df-white/95 dark:bg-df-black/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left group transition-transform active:scale-95"
          aria-label="DocuFlow Home"
        >
          <div className="w-9 h-9 rounded-lg bg-df-black dark:bg-df-white text-df-white dark:text-df-black flex items-center justify-center font-bold text-lg shadow-sm border border-df-black/10 dark:border-df-white/10">
            <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
              <path d="M18 14H38L48 24V48C48 49.1 47.1 50 46 50H18C16.9 50 16 49.1 16 48V16C16 14.9 16.9 14 18 14Z" fill="#2563EB" />
              <path d="M24 32H38M38 32L33 27M38 32L33 37" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="44" cy="44" r="5" fill="#EC4899" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-df-black dark:text-df-white">DocuFlow</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-df-pink/15 text-df-pink border border-df-pink/20">Client-Side</span>
            </div>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={onNavigateHome}
            className="text-df-black/80 dark:text-df-white/80 hover:text-df-blue dark:hover:text-df-blue transition-colors"
          >
            Home
          </button>
          <button
            onClick={onNavigateTools}
            className="text-df-black/80 dark:text-df-white/80 hover:text-df-blue dark:hover:text-df-blue transition-colors"
          >
            All Tools
          </button>
          <button
            onClick={onOpenFormats}
            className="text-df-black/80 dark:text-df-white/80 hover:text-df-blue dark:hover:text-df-blue transition-colors"
          >
            Supported Formats
          </button>
          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 text-df-black/80 dark:text-df-white/80 hover:text-df-blue dark:hover:text-df-blue transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-df-blue" />
            <span>Privacy</span>
          </button>
          <button
            onClick={onOpenAbout}
            className="text-df-black/80 dark:text-df-white/80 hover:text-df-blue dark:hover:text-df-blue transition-colors"
          >
            About
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
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
            href="https://github.com"
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
            className="md:hidden p-2 rounded-lg border border-df-black/10 dark:border-df-white/10 text-df-black dark:text-df-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => {
              onNavigateHome();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-df-black dark:text-df-white hover:text-df-blue"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigateTools();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-df-black dark:text-df-white hover:text-df-blue"
          >
            All Tools
          </button>
          <button
            onClick={() => {
              onOpenFormats();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-df-black dark:text-df-white hover:text-df-blue"
          >
            Supported Formats
          </button>
          <button
            onClick={() => {
              onOpenPrivacy();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-df-black dark:text-df-white hover:text-df-blue"
          >
            Privacy Guarantee
          </button>
          <button
            onClick={() => {
              onOpenAbout();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-df-black dark:text-df-white hover:text-df-blue"
          >
            About DocuFlow
          </button>
          <div className="pt-2 border-t border-df-black/10 dark:border-df-white/10">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-df-blue"
            >
              <Github className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

