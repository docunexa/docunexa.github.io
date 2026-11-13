import { Document, Paragraph, TextRun, Packer } from 'docx';
import { ConversionProgressCallback } from '../../types';

export async function convertTxtToDocx(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(20, 'Reading text file...');
  const text = await file.text();
  const lines = text.split(/\r?\n/);

  onProgress?.(50, `Formatting ${lines.length} lines into DOCX paragraphs...`);

  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    if (line.trim().length === 0) {
      paragraphs.push(new Paragraph({ spacing: { after: 120 } }));
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24, // 12pt
              font: 'Calibri',
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  onProgress?.(80, 'Packaging DOCX document...');
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  onProgress?.(100, 'DOCX document created.');
  return blob;
}

