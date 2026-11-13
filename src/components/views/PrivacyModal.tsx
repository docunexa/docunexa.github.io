import React from 'react';
import { ShieldCheck, Lock, HardDrive, Cpu, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy & Security Architecture"
      subtitle="How DocuFlow guarantees total document confidentiality."
      maxWidth="xl"
    >
      <div className="space-y-6 text-xs sm:text-sm text-df-black/80 dark:text-df-white/80 leading-relaxed">
        {/* Core Guarantee */}
        <div className="p-4 rounded-lg bg-df-blue/10 border border-df-blue/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-df-blue shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-df-black dark:text-df-white">
              100% Client-Side Processing Architecture
            </h4>
            <p className="text-xs text-df-black/70 dark:text-df-white/70">
              DocuFlow runs entirely in your local browser sandbox. Your confidential documents, contracts, images, and text files are <strong>never</strong> transmitted over the internet or saved to any remote server or cloud bucket.
            </p>
          </div>
        </div>

        {/* Feature Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg border border-df-black/10 dark:border-df-white/10 space-y-2">
            <div className="flex items-center gap-2 font-bold text-df-black dark:text-df-white">
              <Cpu className="w-4 h-4 text-df-blue" />
              <span>In-Memory Execution</span>
            </div>
            <p className="text-xs text-df-black/60 dark:text-df-white/60">
              Files are parsed and transformed in volatile browser RAM using WebAssembly and Web Workers. Closing or refreshing the tab clears all buffers immediately.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-df-black/10 dark:border-df-white/10 space-y-2">
            <div className="flex items-center gap-2 font-bold text-df-black dark:text-df-white">
              <HardDrive className="w-4 h-4 text-df-blue" />
              <span>Zero Persistent Storage</span>
            </div>
            <p className="text-xs text-df-black/60 dark:text-df-white/60">
              DocuFlow strictly avoids storing file contents in `localStorage` or `sessionStorage`. Temporary object URLs are revoked immediately after user download.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-df-black/10 dark:border-df-white/10 space-y-2">
            <div className="flex items-center gap-2 font-bold text-df-black dark:text-df-white">
              <Lock className="w-4 h-4 text-df-blue" />
              <span>No Tracking or Telemetry</span>
            </div>
            <p className="text-xs text-df-black/60 dark:text-df-white/60">
              We do not track file names, hashes, page counts, or user document metadata. No third-party behavioral analytics or ad trackers are loaded.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-df-black/10 dark:border-df-white/10 space-y-2">
            <div className="flex items-center gap-2 font-bold text-df-black dark:text-df-white">
              <CheckCircle2 className="w-4 h-4 text-df-blue" />
              <span>Offline Ready</span>
            </div>
            <p className="text-xs text-df-black/60 dark:text-df-white/60">
              Because DocuFlow does not require a remote API or backend, conversions function smoothly even when your computer is disconnected from the network.
            </p>
          </div>
        </div>

        <div className="pt-2 text-xs text-df-black/50 dark:text-df-white/50 border-t border-df-black/10 dark:border-df-white/10">
          Last revised: November 2026. DocuFlow is compliant with GDPR, HIPAA, and strict data governance policies by virtue of zero data transmission.
        </div>
      </div>
    </Modal>
  );
};

