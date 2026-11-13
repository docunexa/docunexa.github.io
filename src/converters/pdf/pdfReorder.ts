import { PDFDocument } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export async function reorderPdfPages(
  file: File,
  newOrder: number[], // 1-based page numbers e.g. [3, 1, 2]
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Reading PDF pages...');
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  if (newOrder.length === 0) {
    throw new Error('Please specify a new page sequence.');
  }

  // Validate page numbers
  const validIndices = newOrder
    .filter((p) => p >= 1 && p <= totalPages)
    .map((p) => p - 1);

  if (validIndices.length === 0) {
    throw new Error(`Invalid page sequence. Document has ${totalPages} pages.`);
  }

  onProgress?.(50, `Reordering into sequence: ${newOrder.join(', ')}...`);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(srcPdf, validIndices);

  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  onProgress?.(85, 'Saving reordered PDF...');
  const bytes = await newPdf.save();
  onProgress?.(100, 'Reorder complete.');

  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
