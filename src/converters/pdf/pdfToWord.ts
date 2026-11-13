import { Document, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from 'docx';
import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { ConversionProgressCallback } from '../../types';

interface TextItemObj {
  str: string;
  x: number;
  y: number;
  height: number;
  width: number;
}

export async function convertPdfToWord(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  ensurePdfWorker();
  onProgress?.(10, 'Loading PDF document...');

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  onProgress?.(25, `Analyzing ${numPages} page(s)...`);

  const docParagraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `[Reconstructed from ${file.name} by DocuFlow]`,
          italics: true,
          size: 18, // 9pt
          color: '666666',
        }),
      ],
      spacing: { after: 200 },
    }),
  ];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const pageProgress = 25 + Math.round((pageNum / numPages) * 55);
    onProgress?.(pageProgress, `Extracting page ${pageNum} of ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<{
      str: string;
      transform: number[];
      width: number;
      height: number;
    }>;

    // Filter non-empty items and map coordinates
    const parsedItems: TextItemObj[] = items
      .filter((it) => it.str && it.str.trim().length > 0)
      .map((it) => ({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5],
        height: Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || 12,
        width: it.width,
      }));

    if (parsedItems.length === 0) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[Page ${pageNum}: Scanned image or empty page. Text extraction requires OCR.]`,
              italics: true,
              color: '888888',
            }),
          ],
        })
      );
    } else {
      // Sort items top-to-bottom (higher y in PDF means higher on page), then left-to-right
      parsedItems.sort((a, b) => {
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 4) return yDiff;
        return a.x - b.x;
      });

      // Calculate baseline text height (median)
      const heights = parsedItems.map((i) => i.height).sort((a, b) => a - b);
      const medianHeight = heights[Math.floor(heights.length / 2)] || 12;

      // Group into lines/paragraphs
      let currentLine: TextItemObj[] = [];
      let lastY: number | null = null;

      const flushLine = (lineItems: TextItemObj[]) => {
        if (lineItems.length === 0) return;
        const lineText = lineItems.map((i) => i.str).join(' ').trim();
        if (!lineText) return;

        const maxH = Math.max(...lineItems.map((i) => i.height));
        const isH1 = maxH >= medianHeight * 1.5 && maxH > 16;
        const isH2 = maxH >= medianHeight * 1.25 && maxH > 13;

        if (isH1) {
          docParagraphs.push(
            new Paragraph({
              text: lineText,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            })
          );
        } else if (isH2) {
          docParagraphs.push(
            new Paragraph({
              text: lineText,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 180, after: 80 },
            })
          );
        } else {
          docParagraphs.push(
            new Paragraph({
              children: [new TextRun({ text: lineText, size: 24 })], // 12pt
              spacing: { after: 120 },
            })
          );
        }
      };

      for (const item of parsedItems) {
        if (lastY === null) {
          currentLine.push(item);
          lastY = item.y;
        } else if (Math.abs(lastY - item.y) <= 4) {
          // Same line
          currentLine.push(item);
        } else {
          // New line
          flushLine(currentLine);
          currentLine = [item];
          lastY = item.y;
        }
      }
      flushLine(currentLine);
    }

    // Add page break if not last page
    if (pageNum < numPages) {
      docParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  onProgress?.(85, 'Assembling Word (.docx) document...');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs,
      },
    ],
  });

  const { Packer } = await import('docx');
  const blob = await Packer.toBlob(doc);
  onProgress?.(100, 'Word document generated!');
  return blob;
}

