import React from 'react';
import { ShieldCheck, Zap, Lock, Sparkles } from 'lucide-react';
import { Dropzone } from '../common/Dropzone';

interface HeroProps {
  onFilesSelected: (files: File[]) => void;
  onExploreTools: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onFilesSelected, onExploreTools }) => {
  return (
    <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Brand Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-df-blue/10 border border-df-blue/20 text-xs font-semibold text-df-blue">
            <Sparkles className="w-3.5 h-3.5 text-df-pink" />
            <span>High-Fidelity Document Processing &bull; 100% In-Browser</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-df-black dark:text-df-white leading-[1.1]">
            Every document.{' '}
            <span className="text-df-blue underline decoration-df-pink decoration-wavy decoration-2">
              One simple workspace.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-df-black/70 dark:text-df-white/70 max-w-2xl mx-auto leading-relaxed">
            Convert, compress, merge, split, and organize your documents in seconds. Powered by client-side WebAssembly with uncompromising privacy.
          </p>
        </div>

        {/* Hero Dropzone */}
        <div className="max-w-3xl mx-auto">
          <Dropzone
            onFilesSelected={onFilesSelected}
            className="shadow-lg hover:shadow-xl transition-shadow bg-df-white dark:bg-df-black"
          />
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6">
          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black">
            <div className="w-9 h-9 rounded-lg bg-df-blue/10 text-df-blue flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-df-black dark:text-df-white">100% Private</h4>
              <p className="text-xs text-df-black/60 dark:text-df-white/60 mt-0.5">
                Processed strictly in your browser. Files never touch any remote server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black">
            <div className="w-9 h-9 rounded-lg bg-df-pink/10 text-df-pink flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-df-black dark:text-df-white">Instant Speed</h4>
              <p className="text-xs text-df-black/60 dark:text-df-white/60 mt-0.5">
                Zero upload waiting times. Transformations execute directly on your CPU.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black">
            <div className="w-9 h-9 rounded-lg bg-df-black/10 dark:bg-df-white/10 text-df-black dark:text-df-white flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-df-black dark:text-df-white">No Limits or Paywalls</h4>
              <p className="text-xs text-df-black/60 dark:text-df-white/60 mt-0.5">
                No forced signups, no subscriptions, and no watermark additions.
              </p>
            </div>
          </div>
        </div>

        {/* Quick jump to tool directory */}
        <div className="text-center pt-2">
          <button
            onClick={onExploreTools}
            className="text-xs font-semibold text-df-blue hover:text-df-blue/80 hover:underline"
          >
            Or browse all 50+ specialized document tools &darr;
          </button>
        </div>
      </div>
    </section>
  );
};

