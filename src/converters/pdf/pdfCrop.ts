import { PDFDocument } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export interface PdfCropOptions {
  marginPercent?: number; // e.g. 5 for 5% margin trim
  trimTopPercent?: number;
  trimBottomPercent?: number;
  cropBox?: { x: number; y: number; width: number; height: number };
  targetPages?: number[];
}

export async function cropPdf(
  file: File,
  options: PdfCropOptions = { marginPercent: 5 },
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Loading PDF for cropping...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  if (pages.length === 0) {
    throw new Error('PDF document has 0 pages to crop.');
  }

  onProgress?.(50, `Cropping ${pages.length} page(s)...`);

  pages.forEach((page, idx) => {
    const pageNum = idx + 1;
    if (!options.targetPages || options.targetPages.length === 0 || options.targetPages.includes(pageNum)) {
      const { width: pWidth, height: pHeight } = page.getSize();
      let x = 0;
      let y = 0;
      let w = pWidth;
      let h = pHeight;

      if (options.marginPercent !== undefined && options.marginPercent > 0) {
        const mx = pWidth * (options.marginPercent / 100);
        const my = pHeight * (options.marginPercent / 100);
        x = mx;
        y = my;
        w = Math.max(20, pWidth - 2 * mx);
        h = Math.max(20, pHeight - 2 * my);
      } else if (options.trimTopPercent || options.trimBottomPercent) {
        const top = options.trimTopPercent ? pHeight * (options.trimTopPercent / 100) : 0;
        const bottom = options.trimBottomPercent ? pHeight * (options.trimBottomPercent / 100) : 0;
        x = 0;
        y = bottom;
        w = pWidth;
        h = Math.max(20, pHeight - top - bottom);
      } else if (options.cropBox) {
        x = Math.max(0, Math.min(options.cropBox.x, pWidth - 10));
        y = Math.max(0, Math.min(options.cropBox.y, pHeight - 10));
        w = Math.max(10, Math.min(options.cropBox.width, pWidth - x));
        h = Math.max(10, Math.min(options.cropBox.height, pHeight - y));
      }

      page.setCropBox(x, y, w, h);
      page.setMediaBox(x, y, w, h);
    }
  });

  onProgress?.(85, 'Saving cropped PDF document...');
  const croppedBytes = await pdfDoc.save();
  onProgress?.(100, 'Crop applied.');

  return new Blob([croppedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
