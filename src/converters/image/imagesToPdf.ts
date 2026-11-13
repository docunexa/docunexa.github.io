import { PDFDocument } from 'pdf-lib';
import { loadImageElement } from './imageConvert';
import { ConversionProgressCallback } from '../../types';

export async function convertImagesToPdf(
  files: File[],
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  onProgress?.(10, 'Initializing PDF document for images...');
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = 10 + Math.round(((i + 1) / files.length) * 80);
    onProgress?.(progress, `Adding image ${i + 1} of ${files.length} (${file.name})...`);

    // Normalize image to PNG or JPG bytes via canvas if needed (handles webp, svgs, etc.)
    const isJpeg = file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg');
    const isPng = file.type === 'image/png' || file.name.endsWith('.png');

    let embeddedImage;

    if (isJpeg) {
      const buffer = await file.arrayBuffer();
      embeddedImage = await pdfDoc.embedJpg(buffer);
    } else if (isPng) {
      const buffer = await file.arrayBuffer();
      embeddedImage = await pdfDoc.embedPng(buffer);
    } else {
      // Decode image and export clean PNG
      const img = await loadImageElement(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const pngDataUrl = canvas.toDataURL('image/png');
      const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());
      embeddedImage = await pdfDoc.embedPng(pngBytes);
    }

    const { width, height } = embeddedImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  onProgress?.(95, 'Saving PDF document...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.(100, 'Images converted to PDF.');

  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
