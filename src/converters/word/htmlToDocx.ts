import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { sanitizeHtml } from '../../utils/sanitize';
import { ConversionProgressCallback } from '../../types';

export async function convertHtmlToDocx(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(20, 'Reading and sanitizing HTML content...');
  const rawHtml = await file.text();
  const cleanHtml = sanitizeHtml(rawHtml);

  const parser = new DOMParser();
  const docDOM = parser.parseFromString(cleanHtml, 'text/html');

  onProgress?.(50, 'Converting HTML nodes into Word paragraphs...');
  const paragraphs: Paragraph[] = [];

  const traverseNodes = (nodes: NodeListOf<ChildNode>) => {
    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();
        const text = el.innerText || el.textContent || '';

        if (!text.trim() && tagName !== 'hr') return;

        if (tagName === 'h1') {
          paragraphs.push(
            new Paragraph({
              text: text.trim(),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            })
          );
        } else if (tagName === 'h2') {
          paragraphs.push(
            new Paragraph({
              text: text.trim(),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 180, after: 80 },
            })
          );
        } else if (tagName === 'h3') {
          paragraphs.push(
            new Paragraph({
              text: text.trim(),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 140, after: 60 },
            })
          );
        } else if (tagName === 'li') {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${text.trim()}`, size: 24 })],
              spacing: { after: 80 },
            })
          );
        } else if (tagName === 'p') {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: text.trim(), size: 24 })],
              spacing: { after: 120 },
            })
          );
        } else if (tagName === 'blockquote') {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: `"${text.trim()}"`, italics: true, size: 22 })],
              spacing: { before: 100, after: 120 },
            })
          );
        } else {
          // Fallback recursion if container
          if (el.children.length > 0) {
            traverseNodes(el.childNodes);
          } else if (text.trim()) {
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: text.trim(), size: 24 })],
                spacing: { after: 100 },
              })
            );
          }
        }
      }
    });
  };

  traverseNodes(docDOM.body.childNodes);

  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({ text: 'No text content found in HTML.' }));
  }

  onProgress?.(80, 'Generating DOCX file...');
  const wordDoc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(wordDoc);
  onProgress?.(100, 'HTML to DOCX complete.');
  return blob;
}

