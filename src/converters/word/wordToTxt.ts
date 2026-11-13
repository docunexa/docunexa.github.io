import mammoth from 'mammoth';
import { sanitizeHtml, escapeHtml } from '../../utils/sanitize';
import { ConversionProgressCallback } from '../../types';

export async function convertDocxToTxt(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, 'Reading DOCX archive...');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(60, 'Extracting raw text strings...');
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value || '';

  onProgress?.(100, 'Text extracted.');
  return new Blob([rawText], { type: 'text/plain;charset=utf-8' });
}

export async function convertDocxToHtml(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, 'Reading DOCX structure...');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(65, 'Converting DOCX to HTML5...');
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const cleanBody = sanitizeHtml(result.value || '');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(file.name)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #0B0B0F; line-height: 1.6; }
    h1 { font-size: 24px; border-bottom: 2px solid #2563EB; padding-bottom: 8px; margin-top: 24px; }
    h2 { font-size: 20px; margin-top: 20px; }
    h3 { font-size: 16px; margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #D1D5DB; padding: 8px 12px; }
    th { background: #F3F4F6; }
    blockquote { border-left: 4px solid #2563EB; padding-left: 16px; color: #4B5563; font-style: italic; }
  </style>
</head>
<body>
  ${cleanBody}
</body>
</html>`;

  onProgress?.(100, 'HTML document ready.');
  return new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
}

export async function convertDocxToMarkdown(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, 'Parsing Word XML...');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(60, 'Transforming headings and content to Markdown...');
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value || '';

  // Simple, robust HTML-to-Markdown converter
  let md = html
    .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<ul>([\s\S]*?)<\/ul>/gi, '$1\n')
    .replace(/<ol>([\s\S]*?)<\/ol>/gi, '$1\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<hr\s*[\/]?>/gi, '\n---\n\n')
    .replace(/<[^>]+>/g, '') // strip remaining tags
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const header = `# ${file.name.replace(/\.[^/.]+$/, '')}\n\n> Converted from Word (.docx) by DocuFlow\n\n---\n\n`;
  const finalMd = header + md;

  onProgress?.(100, 'Markdown generated.');
  return new Blob([finalMd], { type: 'text/markdown;charset=utf-8' });
}

