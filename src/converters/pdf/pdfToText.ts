import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { ConversionProgressCallback } from '../../types';

export async function convertPdfToText(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  ensurePdfWorker();
  onProgress?.(10, 'Reading PDF file...');

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const numPages = pdfDoc.numPages;

  let fullText = `--- Extracted from ${file.name} by DocuFlow ---\n\n`;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = 10 + Math.round((pageNum / numPages) * 80);
    onProgress?.(progress, `Extracting text from page ${pageNum} of ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageStrings = content.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .filter(Boolean);

    fullText += `=== Page ${pageNum} ===\n\n`;
    fullText += pageStrings.join(' ') + '\n\n';
  }

  onProgress?.(100, 'Text extraction complete.');
  return new Blob([fullText], { type: 'text/plain;charset=utf-8' });
}

