import { PDFDocument } from 'pdf-lib';
import { ConversionProgressCallback } from '../../types';

export interface PdfMetadataInfo {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  pageCount: number;
}

export async function readPdfMetadata(file: File): Promise<PdfMetadataInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  return {
    title: pdfDoc.getTitle() || '',
    author: pdfDoc.getAuthor() || '',
    subject: pdfDoc.getSubject() || '',
    keywords: pdfDoc.getKeywords() || '',
    creator: pdfDoc.getCreator() || '',
    producer: pdfDoc.getProducer() || '',
    pageCount: pdfDoc.getPageCount(),
  };
}

export async function updatePdfMetadata(
  file: File,
  meta: Partial<PdfMetadataInfo>,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(20, 'Loading PDF metadata...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  onProgress?.(50, 'Updating document properties...');

  if (meta.title !== undefined) pdfDoc.setTitle(meta.title);
  if (meta.author !== undefined) pdfDoc.setAuthor(meta.author);
  if (meta.subject !== undefined) pdfDoc.setSubject(meta.subject);
  if (meta.keywords !== undefined) {
    pdfDoc.setKeywords(
      meta.keywords.split(/[,;]+/).map((k) => k.trim()).filter(Boolean)
    );
  }
  if (meta.producer !== undefined) pdfDoc.setProducer(meta.producer || 'DocuFlow');
  pdfDoc.setModificationDate(new Date());

  onProgress?.(80, 'Saving updated PDF file...');
  const bytes = await pdfDoc.save();
  onProgress?.(100, 'Metadata updated.');

  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
