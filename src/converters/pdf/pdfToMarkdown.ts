import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { ConversionProgressCallback } from '../../types';

export async function convertPdfToMarkdown(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  ensurePdfWorker();
  onProgress?.(10, 'Extracting document structure...');

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const numPages = pdfDoc.numPages;

  let mdContent = `# ${file.name.replace(/\.[^/.]+$/, '')}\n\n`;
  mdContent += `> Converted from PDF by DocuFlow\n\n---\n\n`;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = 10 + Math.round((pageNum / numPages) * 80);
    onProgress?.(progress, `Processing page ${pageNum} of ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<{
      str: string;
      transform: number[];
      height?: number;
    }>;

    mdContent += `### Page ${pageNum}\n\n`;

    const validItems = items.filter((it) => it.str && it.str.trim());
    if (validItems.length === 0) {
      mdContent += `*[Page ${pageNum} has no extractable text (scanned or image)]*\n\n`;
      continue;
    }

    const lines: string[] = [];
    let currentLine: string[] = [];
    let lastY: number | null = null;

    for (const item of validItems) {
      const y = item.transform[5];
      if (lastY === null) {
        currentLine.push(item.str);
        lastY = y;
      } else if (Math.abs(lastY - y) <= 4) {
        currentLine.push(item.str);
      } else {
        lines.push(currentLine.join(' '));
        currentLine = [item.str];
        lastY = y;
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }

    mdContent += lines.join('\n\n') + '\n\n';
  }

  onProgress?.(100, 'Markdown conversion complete.');
  return new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
}

