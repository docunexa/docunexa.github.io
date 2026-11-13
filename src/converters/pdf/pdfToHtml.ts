import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { escapeHtml } from '../../utils/sanitize';
import { ConversionProgressCallback } from '../../types';

export async function convertPdfToHtml(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  ensurePdfWorker();
  onProgress?.(10, 'Parsing PDF document...');

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const numPages = pdfDoc.numPages;

  let htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(file.name)} - Converted by DocuFlow</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #0B0B0F; line-height: 1.6; }
    .page { border: 1px solid #E5E7EB; border-radius: 8px; padding: 32px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); background: #FFFFFF; }
    .page-header { font-size: 12px; color: #6B7280; border-bottom: 1px solid #F3F4F6; padding-bottom: 8px; margin-bottom: 16px; font-weight: 600; }
    p { margin-bottom: 12px; }
    .heading-1 { font-size: 24px; font-weight: 700; margin: 24px 0 12px; color: #0B0B0F; }
    .heading-2 { font-size: 18px; font-weight: 600; margin: 20px 0 8px; color: #1F2937; }
  </style>
</head>
<body>
`;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const progress = 10 + Math.round((pageNum / numPages) * 80);
    onProgress?.(progress, `Generating HTML for page ${pageNum}...`);

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<{ str: string; transform: number[] }>;

    htmlBody += `  <div class="page">\n    <div class="page-header">Page ${pageNum} of ${numPages}</div>\n`;

    let currentParagraph: string[] = [];

    for (const item of items) {
      const text = item.str.trim();
      if (!text) continue;
      currentParagraph.push(escapeHtml(text));
    }

    if (currentParagraph.length > 0) {
      htmlBody += `    <p>${currentParagraph.join(' ')}</p>\n`;
    } else {
      htmlBody += `    <p><em>[Scanned page or no text detected]</em></p>\n`;
    }

    htmlBody += `  </div>\n`;
  }

  htmlBody += `
  <footer style="text-align: center; font-size: 12px; color: #9CA3AF; margin-top: 40px;">
    Converted with DocuFlow — Private Client-Side Document Converter
  </footer>
</body>
</html>`;

  onProgress?.(100, 'HTML generated successfully.');
  return new Blob([htmlBody], { type: 'text/html;charset=utf-8' });
}

