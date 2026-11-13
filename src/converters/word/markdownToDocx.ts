import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { ConversionProgressCallback } from '../../types';

export async function convertMarkdownToDocx(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(20, 'Reading Markdown file...');
  const mdText = await file.text();
  const lines = mdText.split(/\r?\n/);

  onProgress?.(50, 'Parsing Markdown syntax into DOCX blocks...');
  const paragraphs: Paragraph[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      continue;
    }

    if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: line.slice(2).trim(),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: line.slice(3).trim(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
        })
      );
    } else if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: line.slice(4).trim(),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 140, after: 60 },
        })
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${line.slice(2).trim()}`, size: 24 })],
          spacing: { after: 80 },
        })
      );
    } else if (/^\d+\.\s/.test(line)) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 24 })],
          spacing: { after: 80 },
        })
      );
    } else if (line.startsWith('> ')) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line.slice(2).trim(), italics: true, size: 22 })],
          spacing: { before: 100, after: 100 },
        })
      );
    } else {
      // Clean inline bold / italic markers
      const cleanLine = line
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1');

      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: cleanLine, size: 24 })],
          spacing: { after: 120 },
        })
      );
    }
  }

  onProgress?.(80, 'Creating DOCX package...');
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  onProgress?.(100, 'Markdown to DOCX complete.');
  return blob;
}

