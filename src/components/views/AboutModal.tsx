import React from 'react';
import { Layers, ShieldCheck, Zap, Code2 } from 'lucide-react';
import { Modal } from '../common/Modal';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="About DocuFlow"
      subtitle="Free, private in-browser document tools."
      maxWidth="xl"
    >
      <div className="space-y-6 text-xs sm:text-sm text-df-black/80 dark:text-df-white/80 leading-relaxed">
        <p>
          <strong>DocuFlow</strong> was built on a simple premise: everyday document conversion should be instantaneous, private, and effortless. You shouldn't have to upload sensitive bank statements, contracts, or confidential drafts to opaque web servers just to merge two PDFs or convert a Word doc.
        </p>

        <div className="space-y-3">
          <h4 className="font-bold text-df-black dark:text-df-white">Core Engineering Principles</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-df-blue shrink-0 mt-0.5" />
              <span><strong>Pure Client-Side Speed:</strong> Harnesses modern WebAssembly, Canvas, and HTML5 Web Worker standards to achieve desktop-class conversion throughput in the browser.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-df-blue shrink-0 mt-0.5" />
              <span><strong>Zero Knowledge & Confidentiality:</strong> Your documents never leave your browser sandbox. No server queues, no file leaks.</span>
            </li>
            <li className="flex items-start gap-2">
              <Layers className="w-4 h-4 text-df-pink shrink-0 mt-0.5" />
              <span><strong>Restrained SaaS Design:</strong> A crisp, four-color design system (#0B0B0F, #2563EB, #FFFFFF, #EC4899) inspired by Stripe and Linear, eliminating unnecessary animations and visual clutter.</span>
            </li>
            <li className="flex items-start gap-2">
              <Code2 className="w-4 h-4 text-df-blue shrink-0 mt-0.5" />
              <span><strong>GitHub Pages Static Deployment:</strong> Built as a pure static web application that deploys anywhere with zero runtime Node.js server dependencies.</span>
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-lg bg-df-black/5 dark:bg-df-white/5 border border-df-black/10 dark:border-df-white/10 text-xs space-y-1.5">
          <div className="font-bold text-df-black dark:text-df-white">Creator & Launch</div>
          <p className="text-df-black/70 dark:text-df-white/70">
            Developed and launched by <a href="https://mohdshamii.github.io" target="_blank" rel="noopener noreferrer" className="text-df-blue font-semibold hover:underline">Mohd Shami (mohdshamii.github.io)</a> as an all-in-one private document product.
          </p>
          <div className="font-bold text-df-black dark:text-df-white pt-1">Open Source Technology Stack</div>
          <div className="text-df-black/60 dark:text-df-white/60">
            React 18 &bull; TypeScript &bull; Vite &bull; Tailwind CSS &bull; PDF-Lib &bull; PDF.js &bull; Mammoth &bull; docx &bull; JSZip &bull; jsPDF &bull; DOMPurify &bull; Web Crypto API.
          </div>
        </div>
      </div>
    </Modal>
  );
};

