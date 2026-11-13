import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export async function convertTxtToPdf(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Reading text file...');
  const text = await file.text();
  const lines = text.split(/\r?\n/);

  onProgress?.(40, 'Formatting text layout for PDF...');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 11;
  const lineHeight = 16;
  const margin = 50;
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const linesPerPage = Math.floor(usableHeight / lineHeight);

  // Simple word wrapping
  const wrappedLines: string[] = [];
  for (const rawLine of lines) {
    if (!rawLine) {
      wrappedLines.push('');
      continue;
    }
    const words = rawLine.split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > usableWidth && currentLine) {
        wrappedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  const totalPages = Math.max(1, Math.ceil(wrappedLines.length / linesPerPage));

  for (let p = 0; p < totalPages; p++) {
    const progress = 40 + Math.round(((p + 1) / totalPages) * 50);
    onProgress?.(progress, `Rendering page ${p + 1} of ${totalPages}...`);

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Header
    page.drawText(file.name, {
      x: margin,
      y: pageHeight - 35,
      size: 9,
      font: boldFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pageSlice = wrappedLines.slice(p * linesPerPage, (p + 1) * linesPerPage);
    let y = pageHeight - margin - 15;

    for (const line of pageSlice) {
      if (line) {
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.043, 0.043, 0.059),
        });
      }
      y -= lineHeight;
    }

    // Footer page number
    const footerText = `Page ${p + 1} of ${totalPages}`;
    const footerWidth = font.widthOfTextAtSize(footerText, 9);
    page.drawText(footerText, {
      x: pageWidth - margin - footerWidth,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  onProgress?.(95, 'Finalizing PDF output...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.(100, 'Text to PDF complete.');

  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
