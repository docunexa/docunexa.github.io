import { marked } from 'marked';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { sanitizeHtml } from '../../utils/sanitize';
import { ConversionProgressCallback } from '../../types';

export async function convertMarkdownToPdf(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(20, 'Reading and parsing Markdown...');
  const mdText = await file.text();
  const rawHtml = await marked.parse(mdText);
  const cleanHtml = sanitizeHtml(rawHtml);

  onProgress?.(45, 'Rendering formatted layout for PDF export...');
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.padding = '48px 40px';
  container.style.background = '#FFFFFF';
  container.style.color = '#0B0B0F';
  container.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.6';
  container.innerHTML = `
    <style>
      h1 { font-size: 24px; font-weight: 700; border-bottom: 2px solid #2563EB; padding-bottom: 8px; margin-top: 16px; margin-bottom: 16px; }
      h2 { font-size: 18px; font-weight: 600; margin-top: 20px; margin-bottom: 12px; }
      h3 { font-size: 16px; font-weight: 600; margin-top: 16px; margin-bottom: 8px; }
      p { margin-bottom: 12px; }
      code { background: #F3F4F6; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
      pre { background: #0B0B0F; color: #FFFFFF; padding: 12px; border-radius: 6px; }
      table { border-collapse: collapse; width: 100%; margin: 16px 0; }
      th, td { border: 1px solid #D1D5DB; padding: 6px 10px; }
      th { background-color: #F3F4F6; }
      blockquote { border-left: 4px solid #2563EB; padding-left: 14px; margin-left: 0; color: #4B5563; font-style: italic; }
    </style>
    ${cleanHtml}
  `;

  document.body.appendChild(container);

  try {
    onProgress?.(70, 'Capturing document pages...');
    const canvas = await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    onProgress?.(85, 'Assembling PDF...');
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    onProgress?.(100, 'Markdown to PDF complete.');
    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}

