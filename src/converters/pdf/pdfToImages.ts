import JSZip from 'jszip';
import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { ConversionProgressCallback } from '../../types';

export async function convertPdfToImages(
  file: File,
  format: 'png' | 'jpg' = 'png',
  onProgress?: ConversionProgressCallback
): Promise<{ blob: Blob; filename: string }> {
  ensurePdfWorker();
  onProgress?.(10, 'Loading PDF for rendering...');

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const numPages = pdfDoc.numPages;

  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';

  if (numPages === 1) {
    onProgress?.(40, 'Rendering single page image...');
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), mimeType, 0.92);
    });

    onProgress?.(100, 'Image ready.');
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return { blob, filename: `${baseName}-page1.${ext}` };
  }

  // Multi-page PDF: Bundle pages into a ZIP
  const zip = new JSZip();
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = 10 + Math.round((pageNum / numPages) * 75);
    onProgress?.(progress, `Rendering page ${pageNum} of ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.75 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const pageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), mimeType, 0.90);
    });

    zip.file(`${baseName}-page-${pageNum}.${ext}`, pageBlob);
  }

  onProgress?.(90, 'Packaging image archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  onProgress?.(100, 'Images archive ready.');

  return { blob: zipBlob, filename: `${baseName}-images.zip` };
}

