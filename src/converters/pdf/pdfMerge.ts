import { PDFDocument } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export async function mergePdfs(
  files: File[],
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error('Please select at least one PDF file to merge.');
  }

  onProgress?.(10, 'Initializing PDF merger...');
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = 10 + Math.round(((i + 1) / files.length) * 75);
    onProgress?.(progress, `Merging ${file.name} (${i + 1}/${files.length})...`);

    const arrayBuffer = await file.arrayBuffer();
    const donorPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  onProgress?.(90, 'Saving merged PDF document...');
  const pdfBytes = await mergedPdf.save();
  onProgress?.(100, 'Merge complete.');

  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
