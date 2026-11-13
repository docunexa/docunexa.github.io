import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export async function addTextToPdf(
  file: File,
  text: string,
  options?: {
    fontSize?: number;
    position?: 'top' | 'bottom' | 'center';
    pageNumber?: number; // 0 for all pages
  },
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Loading PDF for annotation...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSize = options?.fontSize || 14;
  const position = options?.position || 'top';
  const targetPageNum = options?.pageNumber ?? 0;

  const pages = pdfDoc.getPages();
  const targetPages = targetPageNum > 0 && targetPageNum <= pages.length
    ? [pages[targetPageNum - 1]]
    : pages;

  onProgress?.(50, `Annotating text onto ${targetPages.length} page(s)...`);

  const textWidth = font.widthOfTextAtSize(text, fontSize);

  for (const page of targetPages) {
    const { width, height } = page.getSize();
    let x = (width - textWidth) / 2;
    let y = height - 40;

    if (position === 'bottom') {
      y = 30;
    } else if (position === 'center') {
      y = height / 2;
    }

    page.drawText(text, {
      x: Math.max(20, x),
      y,
      size: fontSize,
      font,
      color: rgb(0.043, 0.043, 0.059), // #0B0B0F
    });
  }

  onProgress?.(85, 'Rendering annotated PDF...');
  const bytes = await pdfDoc.save();
  onProgress?.(100, 'Text annotation complete.');

  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
