import { PDFDocument } from 'pdf-lib';
import { parsePageRanges } from './pdfSplit';
import { ConversionProgressCallback } from '../../types';

export async function extractPdfPages(
  file: File,
  pagesStr: string,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(10, 'Reading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const selectedPages = parsePageRanges(pagesStr, totalPages);
  if (selectedPages.length === 0) {
    throw new Error(`Please specify valid page numbers between 1 and ${totalPages}.`);
  }

  onProgress?.(40, `Extracting ${selectedPages.length} pages (${selectedPages.join(', ')})...`);
  const newPdf = await PDFDocument.create();
  const zeroBasedIndices = selectedPages.map((p) => p - 1);
  const copiedPages = await newPdf.copyPages(srcPdf, zeroBasedIndices);

  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  onProgress?.(80, 'Generating extracted PDF...');
  const bytes = await newPdf.save();
  onProgress?.(100, 'Pages extracted successfully.');

  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
