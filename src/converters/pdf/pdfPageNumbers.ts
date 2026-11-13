import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export async function addPageNumbersToPdf(
  file: File,
  position: 'bottom-center' | 'bottom-right' | 'top-center' | 'top-right' = 'bottom-center',
  formatStr: string = 'Page {n} of {total}',
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Loading PDF for page numbering...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const totalPages = pdfDoc.getPageCount();

  onProgress?.(40, `Stamping numbers on ${totalPages} pages...`);

  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const pageNum = i + 1;

    const text = formatStr
      .replace('{n}', pageNum.toString())
      .replace('{total}', totalPages.toString());

    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = (width - textWidth) / 2;
    let y = 24; // bottom margin

    if (position === 'bottom-right') {
      x = width - textWidth - 36;
      y = 24;
    } else if (position === 'top-center') {
      x = (width - textWidth) / 2;
      y = height - 32;
    } else if (position === 'top-right') {
      x = width - textWidth - 36;
      y = height - 32;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  onProgress?.(85, 'Finalizing PDF...');
  const bytes = await pdfDoc.save();
  onProgress?.(100, 'Page numbers added.');

  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
