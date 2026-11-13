import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export async function addTextWatermarkToPdf(
  file: File,
  watermarkText: string = 'CONFIDENTIAL',
  opacity: number = 0.3,
  fontSize: number = 48,
  rotationAngle: number = 45,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Loading PDF for watermarking...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  onProgress?.(45, `Applying text watermark across ${pages.length} pages...`);

  const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
  const textHeight = font.heightAtSize(fontSize);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font,
      color: rgb(0.145, 0.388, 0.921), // Blue #2563EB in RGB
      opacity: Math.max(0.05, Math.min(1, opacity)),
      rotate: degrees(rotationAngle),
    });
  }

  onProgress?.(85, 'Rendering watermarked document...');
  const bytes = await pdfDoc.save();
  onProgress?.(100, 'Watermark applied.');

  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function addImageWatermarkToPdf(
  pdfFile: File,
  imageFile: File,
  opacity: number = 0.3,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Loading PDF and image asset...');
  const [pdfBuffer, imageBuffer] = await Promise.all([
    pdfFile.arrayBuffer(),
    imageFile.arrayBuffer(),
  ]);

  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  let embeddedImage;

  const isPng = imageFile.type.includes('png') || imageFile.name.endsWith('.png');
  if (isPng) {
    embeddedImage = await pdfDoc.embedPng(imageBuffer);
  } else {
    embeddedImage = await pdfDoc.embedJpg(imageBuffer);
  }

  const pages = pdfDoc.getPages();
  onProgress?.(50, `Stamping image watermark on ${pages.length} pages...`);

  for (const page of pages) {
    const { width, height } = page.getSize();
    const imgDims = embeddedImage.scale(0.5);

    // Center image
    page.drawImage(embeddedImage, {
      x: width / 2 - imgDims.width / 2,
      y: height / 2 - imgDims.height / 2,
      width: imgDims.width,
      height: imgDims.height,
      opacity: Math.max(0.05, Math.min(1, opacity)),
    });
  }

  onProgress?.(85, 'Saving watermarked PDF...');
  const bytes = await pdfDoc.save();
  onProgress?.(100, 'Image watermark applied.');

  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
