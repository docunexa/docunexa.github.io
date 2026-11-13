import { marked } from 'marked';
import { sanitizeHtml } from '../../utils/sanitize';
import { ConversionProgressCallback } from '../../types';

export async function convertMarkdownToHtml(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, 'Reading Markdown file...');
  const mdText = await file.text();

  onProgress?.(60, 'Parsing Markdown into HTML5...');
  const rawHtml = await marked.parse(mdText);
  const cleanBody = sanitizeHtml(rawHtml);

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${file.name.replace(/\.[^/.]+$/, '')}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 24px; color: #0B0B0F; line-height: 1.6; }
    h1 { font-size: 26px; border-bottom: 2px solid #2563EB; padding-bottom: 8px; margin-top: 24px; }
    h2 { font-size: 20px; margin-top: 20px; }
    h3 { font-size: 16px; margin-top: 16px; }
    code { background: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #0B0B0F; color: #FFFFFF; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: transparent; color: inherit; padding: 0; }
    blockquote { border-left: 4px solid #2563EB; padding-left: 16px; margin-left: 0; color: #4B5563; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #D1D5DB; padding: 8px 12px; }
    th { background: #F3F4F6; }
  </style>
</head>
<body>
  ${cleanBody}
</body>
</html>`;

  onProgress?.(100, 'HTML generated.');
  return new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
}

