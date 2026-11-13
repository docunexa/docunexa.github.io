import { PDFDocument, degrees } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export async function rotatePdfPages(
  file: File,
  angle: 90 | 180 | 270 = 90,
  pagesToRotate?: string, // optional range, otherwise all
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Loading PDF for rotation...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const pages = pdfDoc.getPages();
  const targetIndices = new Set<number>();

  if (pagesToRotate && pagesToRotate.trim()) {
    const parts = pagesToRotate.split(/[,;\s]+/).filter(Boolean);
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        targetIndices.add(num - 1);
      }
    }
  } else {
    for (let i = 0; i < totalPages; i++) targetIndices.add(i);
  }

  onProgress?.(50, `Rotating ${targetIndices.size} page(s) by ${angle}°...`);

  pages.forEach((page, idx) => {
    if (targetIndices.has(idx)) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + angle) % 360));
    }
  });

  onProgress?.(85, 'Saving rotated document...');
  const bytes = await pdfDoc.save();
  onProgress?.(100, 'Rotation complete.');

  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
