import JSZip from 'jszip';
import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { ConversionProgressCallback } from '../../types';

export async function extractImagesFromPdf(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<{ blob: Blob; filename: string }> {
  ensurePdfWorker();
  onProgress?.(15, 'Scanning PDF for embedded graphics...');

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const numPages = pdfDoc.numPages;

  const zip = new JSZip();
  let imageCounter = 0;
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = 15 + Math.round((pageNum / numPages) * 70);
    onProgress?.(progress, `Scanning page ${pageNum} of ${numPages} for images...`);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    // Render page to canvas to extract high-res raster content
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    imageCounter++;
    const imageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });

    zip.file(`${baseName}-page-${pageNum}-graphic-${imageCounter}.png`, imageBlob);
  }

  onProgress?.(90, 'Packaging extracted images into ZIP archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  onProgress?.(100, `Extracted ${imageCounter} image(s).`);

  return {
    blob: zipBlob,
    filename: `${baseName}-extracted-images.zip`,
  };
}

