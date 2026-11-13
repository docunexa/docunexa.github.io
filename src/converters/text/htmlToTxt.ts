import { sanitizeHtml } from '../../utils/sanitize';
import { ConversionProgressCallback } from '../../types';

export async function convertHtmlToTxt(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, 'Reading and sanitizing HTML...');
  const rawHtml = await file.text();
  const cleanHtml = sanitizeHtml(rawHtml);

  onProgress?.(65, 'Extracting formatted text...');

  let text = '';
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, 'text/html');
    text = doc.body.innerText || doc.body.textContent || '';
  } else {
    // Fallback for non-browser environments
    text = cleanHtml
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/(p|div|h\d|li|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, '');
  }

  const cleanText = text.replace(/\n{3,}/g, '\n\n').trim();

  onProgress?.(100, 'Plain text extracted.');
  return new Blob([cleanText], { type: 'text/plain;charset=utf-8' });
}

export async function convertTextToMarkdown(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, 'Analyzing text structure...');
  const rawText = await file.text();
  const lines = rawText.split(/\r?\n/);

  onProgress?.(65, 'Formatting headings and paragraphs...');
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  let md = `# ${baseName}\n\n`;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      md += '\n';
      continue;
    }

    // Auto-detect headings if all uppercase and short
    if (trimmed.length < 50 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
      md += `## ${trimmed}\n\n`;
    } else if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
      md += `${trimmed}\n`;
    } else {
      md += `${trimmed}\n\n`;
    }
  }

  onProgress?.(100, 'Text to Markdown complete.');
  return new Blob([md], { type: 'text/markdown;charset=utf-8' });
}
