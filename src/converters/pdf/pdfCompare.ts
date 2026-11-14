import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { ConversionProgressCallback } from '../../types';

export interface PdfComparisonResult {
  docA: { name: string; pageCount: number; charCount: number; wordCount: number };
  docB: { name: string; pageCount: number; charCount: number; wordCount: number };
  diffSummary: string;
  reportText: string;
}

export async function comparePdfFiles(
  fileA: File,
  fileB: File,
  onProgress?: ConversionProgressCallback
): Promise<{ result: PdfComparisonResult; reportBlob: Blob }> {
  ensurePdfWorker();
  onProgress?.(15, `Loading ${fileA.name}...`);

  const [bufA, bufB] = await Promise.all([fileA.arrayBuffer(), fileB.arrayBuffer()]);

  const [docA, docB] = await Promise.all([
    pdfjsLib.getDocument({ data: new Uint8Array(bufA) }).promise,
    pdfjsLib.getDocument({ data: new Uint8Array(bufB) }).promise,
  ]);

  onProgress?.(45, 'Extracting text and comparing structure...');

  let totalCharsA = 0;
  let totalWordsA = 0;
  let totalCharsB = 0;
  let totalWordsB = 0;

  for (let i = 1; i <= docA.numPages; i++) {
    const page = await docA.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str || '').join(' ');
    totalCharsA += text.length;
    totalWordsA += text.trim().split(/\s+/).filter(Boolean).length;
  }

  for (let i = 1; i <= docB.numPages; i++) {
    const page = await docB.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str || '').join(' ');
    totalCharsB += text.length;
    totalWordsB += text.trim().split(/\s+/).filter(Boolean).length;
  }

  const pageDiff = docB.numPages - docA.numPages;
  const wordDiff = totalWordsB - totalWordsA;

  const diffSummary =
    pageDiff === 0 && wordDiff === 0
      ? 'Documents appear identical in page count and volume.'
      : `Document B has ${Math.abs(pageDiff)} ${pageDiff >= 0 ? 'more' : 'fewer'} page(s) and ${Math.abs(wordDiff)} ${wordDiff >= 0 ? 'more' : 'fewer'} words than Document A.`;

  const reportText = `--- DocuFlow PDF Comparison Report ---
Generated: ${new Date().toUTCString()}

Document A: ${fileA.name}
- Page Count: ${docA.numPages}
- Total Words: ${totalWordsA}
- Characters: ${totalCharsA}

Document B: ${fileB.name}
- Page Count: ${docB.numPages}
- Total Words: ${totalWordsB}
- Characters: ${totalCharsB}

Analysis Summary:
${diffSummary}
`;

  onProgress?.(100, 'Comparison complete.');

  const result: PdfComparisonResult = {
    docA: { name: fileA.name, pageCount: docA.numPages, charCount: totalCharsA, wordCount: totalWordsA },
    docB: { name: fileB.name, pageCount: docB.numPages, charCount: totalCharsB, wordCount: totalWordsB },
    diffSummary,
    reportText,
  };

  const reportBlob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
  return { result, reportBlob };
}
