import { PDFDocument } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export async function signPdf(
  file: File,
  signatureDataUrl: string,
  pageNumber: number = 1,
  x?: number,
  y?: number,
  width: number = 180,
  height: number = 60,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Loading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  const safePageNum = Math.max(1, Math.min(pageNumber, pages.length));
  const targetPage = pages[safePageNum - 1];
  const pageSize = targetPage.getSize();

  onProgress?.(45, `Embedding signature on page ${safePageNum}...`);

  // Convert base64 dataUrl to bytes
  const base64Data = signatureDataUrl.includes(',')
    ? signatureDataUrl.split(',')[1]
    : signatureDataUrl;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const pngImage = await pdfDoc.embedPng(bytes.buffer as ArrayBuffer);

  // Default to bottom right if coordinates not provided
  const targetX = x !== undefined ? x : pageSize.width - width - 40;
  const targetY = y !== undefined ? y : 40;

  targetPage.drawImage(pngImage, {
    x: targetX,
    y: targetY,
    width,
    height,
  });

  onProgress?.(85, 'Finalizing signed document...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.(100, 'Signature applied successfully.');

  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
