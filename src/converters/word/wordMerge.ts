import mammoth from 'mammoth';
import { Document, Paragraph, TextRun, HeadingLevel, PageBreak, Packer } from 'docx';
import { ConversionProgressCallback } from '../../types';

export async function mergeDocxFiles(
  files: File[],
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error('Please select at least one DOCX file to merge.');
  }

  onProgress?.(10, 'Initializing DOCX merger...');
  const combinedParagraphs: Paragraph[] = [];

  for (let idx = 0; idx < files.length; idx++) {
    const file = files[idx];
    const progress = 10 + Math.round(((idx + 1) / files.length) * 75);
    onProgress?.(progress, `Extracting ${file.name} (${idx + 1}/${files.length})...`);

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value || '';
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

    // Document Section Header
    combinedParagraphs.push(
      new Paragraph({
        text: `--- Document ${idx + 1}: ${file.name} ---`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      })
    );

    for (const line of lines) {
      combinedParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 24 })],
          spacing: { after: 100 },
        })
      );
    }

    // Page break between documents
    if (idx < files.length - 1) {
      combinedParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  onProgress?.(90, 'Packaging merged DOCX...');
  const mergedDoc = new Document({
    sections: [
      {
        properties: {},
        children: combinedParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(mergedDoc);
  onProgress?.(100, 'DOCX merge complete.');
  return blob;
}

