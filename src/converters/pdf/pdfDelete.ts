import { PDFDocument } from 'pdf-lib';
import { parsePageRanges } from './pdfSplit';
import { ConversionProgressCallback } from '../../types';

export async function deletePdfPages(
  file: File,
  pagesToDeleteStr: string,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Loading PDF...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const toDelete = new Set(parsePageRanges(pagesToDeleteStr, totalPages));
  if (toDelete.size === 0) {
    throw new Error('Please specify at least one page number to delete.');
  }

  if (toDelete.size >= totalPages) {
    throw new Error('Cannot delete all pages of the document.');
  }

  // PDFDocument.removePage modifies indices in place, so delete from highest index down to lowest!
  const sortedIndicesToDelete = Array.from(toDelete)
    .map((p) => p - 1)
    .sort((a, b) => b - a);

  onProgress?.(50, `Removing ${sortedIndicesToDelete.length} page(s)...`);

  for (const idx of sortedIndicesToDelete) {
    pdfDoc.removePage(idx);
  }

  onProgress?.(85, 'Saving updated PDF...');
  const bytes = await pdfDoc.save();
  onProgress?.(100, 'Pages deleted.');

  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
