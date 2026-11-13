import React from 'react';
import { Modal } from '../common/Modal';

interface FormatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormatsModal: React.FC<FormatsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supported File Formats & Technical Reference"
      subtitle="Exhaustive format compatibility and browser-side implementation notes."
      maxWidth="2xl"
    >
      <div className="space-y-6 text-xs text-df-black/80 dark:text-df-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-df-black/15 dark:border-df-white/15 text-[11px] font-bold uppercase tracking-wider text-df-black/50 dark:text-df-white/50">
                <th className="pb-3 pr-4">Format</th>
                <th className="pb-3 pr-4">Extensions</th>
                <th className="pb-3 pr-4">Supported Operations</th>
                <th className="pb-3">Technical Engine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-df-black/10 dark:divide-df-white/10">
              <tr>
                <td className="py-3 pr-4 font-bold text-df-black dark:text-df-white">PDF</td>
                <td className="py-3 pr-4 font-mono">.pdf</td>
                <td className="py-3 pr-4">To DOCX, TXT, Images, HTML, MD, Merge, Split, Rotate, Compress, Watermark, Password, Page Numbers</td>
                <td className="py-3 text-df-blue font-mono">PDF-Lib &amp; PDF.js</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-df-black dark:text-df-white">Word</td>
                <td className="py-3 pr-4 font-mono">.docx</td>
                <td className="py-3 pr-4">To PDF, TXT, HTML, MD, Merge DOCX, In-browser Preview</td>
                <td className="py-3 text-df-blue font-mono">Mammoth &amp; docx</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-df-black dark:text-df-white">Images</td>
                <td className="py-3 pr-4 font-mono">.png, .jpg, .jpeg, .webp</td>
                <td className="py-3 pr-4">Cross-convert, Multi-image to PDF, Resize, Compress, Rotate, Crop, Batch to ZIP</td>
                <td className="py-3 text-df-blue font-mono">HTML5 Canvas 2D</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-df-black dark:text-df-white">Text</td>
                <td className="py-3 pr-4 font-mono">.txt</td>
                <td className="py-3 pr-4">To PDF with auto-pagination, To DOCX, To Markdown</td>
                <td className="py-3 text-df-blue font-mono">PDF-Lib / docx</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-df-black dark:text-df-white">Markdown</td>
                <td className="py-3 pr-4 font-mono">.md</td>
                <td className="py-3 pr-4">To HTML, To PDF with typography, To DOCX with heading styles</td>
                <td className="py-3 text-df-blue font-mono">Marked &amp; DOMPurify</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-df-black dark:text-df-white">Web / HTML</td>
                <td className="py-3 pr-4 font-mono">.html, .htm</td>
                <td className="py-3 pr-4">To PDF, To DOCX, To Plain Text (with sanitization)</td>
                <td className="py-3 text-df-blue font-mono">html2canvas &amp; jsPDF</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-df-black dark:text-df-white">Archives</td>
                <td className="py-3 pr-4 font-mono">.zip</td>
                <td className="py-3 pr-4">Multi-file batch bundling, Extraction, Checksums</td>
                <td className="py-3 text-df-blue font-mono">JSZip &amp; Web Crypto</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 rounded-lg bg-df-black/5 dark:bg-df-white/5 border border-df-black/10 dark:border-df-white/10 space-y-2">
          <h4 className="font-bold text-df-black dark:text-df-white">Honest Technical Notes &amp; Disclosures</h4>
          <ul className="list-disc list-inside space-y-1 text-df-black/70 dark:text-df-white/70 text-xs">
            <li><strong>PDF to Word:</strong> DocuFlow extracts native text blocks, font heights, and geometric baselines to reconstruct headings and paragraphs in DOCX format. Scanned non-OCR PDFs or complex multi-column brochure art may lose exact typography.</li>
            <li><strong>Word to PDF:</strong> Formatted tables, headings, blockquotes, and lists are converted with high fidelity. Proprietary Office SmartArt, complex VBA macros, or custom embedded Active-X controls are not rendered in standard browser engines.</li>
            <li><strong>File Size Threshold:</strong> Client-side conversions are comfortably suited for documents up to 100MB depending on your machine's available RAM.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

