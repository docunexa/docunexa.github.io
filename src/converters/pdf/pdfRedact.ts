import { PDFDocument, rgb } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export interface RedactionArea {
  page: number; // 1-based
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function redactPdf(
  file: File,
  redactions: RedactionArea[],
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Loading PDF for redaction...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  onProgress?.(50, `Applying ${redactions.length} redaction area(s)...`);

  for (const r of redactions) {
    if (r.page >= 1 && r.page <= pages.length) {
      const page = pages[r.page - 1];
      page.drawRectangle({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        color: rgb(0.043, 0.043, 0.059), // #0B0B0F Black
      });
    }
  }

  onProgress?.(85, 'Rendering redacted PDF...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.(100, 'Redaction applied successfully.');

  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
