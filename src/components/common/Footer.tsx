import React from 'react';
import { ShieldCheck, Heart, Github } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenAbout: () => void;
  onOpenFormats: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenAbout,
  onOpenFormats,
  onOpenContact,
}) => {
  return (
    <footer className="border-t border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-df-black dark:bg-df-white text-df-white dark:text-df-black flex items-center justify-center font-bold text-base">
                <svg className="w-4 h-4" viewBox="0 0 64 64" fill="none">
                  <path d="M18 14H38L48 24V48C48 49.1 47.1 50 46 50H18C16.9 50 16 49.1 16 48V16C16 14.9 16.9 14 18 14Z" fill="#2563EB" />
                  <path d="M24 32H38M38 32L33 27M38 32L33 37" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="44" cy="44" r="5" fill="#EC4899" />
                </svg>
              </div>
              <span className="font-bold text-lg text-df-black dark:text-df-white">DocuFlow</span>
            </div>
            <p className="text-sm text-df-black/70 dark:text-df-white/70 max-w-md leading-relaxed">
              Free client-side document tools. Convert, compress, merge, split, sign, and organize documents directly in your browser without uploading files to remote servers.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-full bg-df-black/5 dark:bg-df-white/5 border border-df-black/10 dark:border-df-white/10 text-df-black/80 dark:text-df-white/80">
              <ShieldCheck className="w-4 h-4 text-df-blue" />
              <span>100% Client-Side Privacy Guarantee</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-df-black/50 dark:text-df-white/50 mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={onOpenFormats}
                  className="text-df-black/80 dark:text-df-white/80 hover:text-df-blue transition-colors"
                >
                  Supported Formats
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="text-df-black/80 dark:text-df-white/80 hover:text-df-blue transition-colors"
                >
                  Privacy Policy & Safety
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAbout}
                  className="text-df-black/80 dark:text-df-white/80 hover:text-df-blue transition-colors"
                >
                  About DocuFlow
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="text-df-black/80 dark:text-df-white/80 hover:text-df-blue transition-colors"
                >
                  Contact & Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Open Source / Deploy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-df-black/50 dark:text-df-white/50 mb-3">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-df-black/80 dark:text-df-white/80 hover:text-df-blue transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="https://pages.github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-df-black/80 dark:text-df-white/80 hover:text-df-blue transition-colors"
                >
                  GitHub Pages Hosted
                </a>
              </li>
              <li>
                <span className="text-xs text-df-black/50 dark:text-df-white/50">MIT Open Source License</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-df-black/10 dark:border-df-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-df-black/60 dark:text-df-white/60">
          <div>
            &copy; {new Date().getFullYear()} DocuFlow. Developed by{' '}
            <a
              href="https://mohdshamii.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-df-blue hover:underline"
            >
              Mohd Shami (mohdshamii.github.io)
            </a>
            {' '}— A flagship document product launched by Mohd Shami.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision</span>
            <Heart className="w-3.5 h-3.5 text-df-pink fill-df-pink mx-0.5" />
            <span>by Mohd Shami</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

