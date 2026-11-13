import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
let isConfigured = false;

export function ensurePdfWorker(): void {
  if (isConfigured) return;
  
  try {
    // Standard cdnjs fallback that matches pdfjs-dist 3.11.174
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    isConfigured = true;
  } catch (err) {
    console.warn('PDF.js worker could not be set automatically', err);
  }
}

export { pdfjsLib };

