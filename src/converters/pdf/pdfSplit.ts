import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { ConversionProgressCallback } from '../../types';

export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);

  if (parts.length === 0) {
    // If empty, return all pages
    for (let i = 1; i <= totalPages; i++) pages.add(i);
    return Array.from(pages);
  }

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let i = min; i <= max; i++) pages.add(i);
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        pages.add(num);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function splitPdf(
  file: File,
  rangeStr?: string,
  onProgress?: ConversionProgressCallback
): Promise<{ blob: Blob; filename: string }> {
  onProgress?.(10, 'Loading PDF for splitting...');
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const selectedPages = rangeStr ? parsePageRanges(rangeStr, totalPages) : [];
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  // If specific range produces a single contiguous subset or user supplied range, create subset PDF
  if (rangeStr && selectedPages.length > 0 && selectedPages.length < totalPages) {
    onProgress?.(50, `Creating subset PDF with ${selectedPages.length} pages...`);
    const newPdf = await PDFDocument.create();
    const zeroBasedIndices = selectedPages.map((p) => p - 1);
    const copiedPages = await newPdf.copyPages(srcPdf, zeroBasedIndices);
    for (const page of copiedPages) {
      newPdf.addPage(page);
    }
    const bytes = await newPdf.save();
    onProgress?.(100, 'Split complete.');
    return {
      blob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
      filename: `${baseName}-pages-${selectedPages[0]}-to-${selectedPages[selectedPages.length - 1]}.pdf`,
    };
  }

  // Otherwise split all pages into separate PDFs in a ZIP
  onProgress?.(25, `Splitting ${totalPages} pages into archive...`);
  const zip = new JSZip();

  for (let i = 0; i < totalPages; i++) {
    const progress = 25 + Math.round(((i + 1) / totalPages) * 65);
    onProgress?.(progress, `Extracting page ${i + 1} of ${totalPages}...`);

    const singlePagePdf = await PDFDocument.create();
    const [copiedPage] = await singlePagePdf.copyPages(srcPdf, [i]);
    singlePagePdf.addPage(copiedPage);

    const bytes = await singlePagePdf.save();
    zip.file(`${baseName}-page-${i + 1}.pdf`, bytes);
  }

  onProgress?.(95, 'Building zip archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  onProgress?.(100, 'Split complete.');

  return { blob: zipBlob, filename: `${baseName}-split-pages.zip` };
}
