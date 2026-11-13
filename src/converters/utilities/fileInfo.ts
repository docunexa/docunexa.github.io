import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import { loadImageElement } from '../image/imageConvert';
import { computeFileChecksum } from './fileChecksum';

export interface DetailedFileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  sha256?: string;
  pdfPages?: number;
  imageDimensions?: { width: number; height: number };
  wordCount?: number;
}

export async function inspectFileDetails(file: File): Promise<DetailedFileInfo> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const info: DetailedFileInfo = {
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    lastModified: file.lastModified,
  };

  try {
    info.sha256 = await computeFileChecksum(file, 'SHA-256');
  } catch (err) {
    console.warn('Checksum failed', err);
  }

  // Inspect PDF
  if (ext === 'pdf') {
    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      info.pdfPages = doc.getPageCount();
    } catch (e) {
      console.warn('PDF inspection failed', e);
    }
  }

  // Inspect Image
  if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext || '')) {
    try {
      const img = await loadImageElement(file);
      info.imageDimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    } catch (e) {
      console.warn('Image dimensions check failed', e);
    }
  }

  // Inspect DOCX
  if (ext === 'docx') {
    try {
      const buffer = await file.arrayBuffer();
      const res = await mammoth.extractRawText({ arrayBuffer: buffer });
      const words = (res.value || '').trim().split(/\s+/).filter(Boolean);
      info.wordCount = words.length;
    } catch (e) {
      console.warn('DOCX word count failed', e);
    }
  }

  // Inspect Text/MD/HTML
  if (['txt', 'md', 'html', 'json', 'csv'].includes(ext || '')) {
    try {
      const text = await file.text();
      const words = text.trim().split(/\s+/).filter(Boolean);
      info.wordCount = words.length;
    } catch (e) {
      console.warn('Text word count failed', e);
    }
  }

  return info;
}

