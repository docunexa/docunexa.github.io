import { PDFDocument } from 'pdf-lib';
import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { ConversionProgressCallback } from '../../types';

export async function compressPdf(
  file: File,
  quality: number = 0.75, // 0.1 to 1.0
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  ensurePdfWorker();
  onProgress?.(10, 'Analyzing PDF streams...');

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const numPages = pdfDoc.numPages;

  const newPdf = await PDFDocument.create();

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = 10 + Math.round((pageNum / numPages) * 75);
    onProgress?.(progress, `Compressing page ${pageNum} of ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convert canvas to compressed JPEG
    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    const jpegBytes = await fetch(jpegDataUrl).then((r) => r.arrayBuffer());

    const embeddedImage = await newPdf.embedJpg(jpegBytes);
    const newPage = newPdf.addPage([viewport.width, viewport.height]);

    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }

  onProgress?.(90, 'Optimizing PDF dictionary...');
  const compressedBytes = await newPdf.save({ useObjectStreams: true });
  onProgress?.(100, 'PDF compression complete.');

  return new Blob([compressedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
