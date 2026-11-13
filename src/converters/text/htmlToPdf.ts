import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { sanitizeHtml } from '../../utils/sanitize';
import { ConversionProgressCallback } from '../../types';

export async function convertHtmlToPdf(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Reading and sanitizing HTML file...');
  const rawHtml = await file.text();
  const cleanHtml = sanitizeHtml(rawHtml);

  onProgress?.(40, 'Rendering document layout for PDF export...');
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // A4 width at 96 DPI
  container.style.minHeight = '1123px';
  container.style.padding = '48px 40px';
  container.style.background = '#FFFFFF';
  container.style.color = '#0B0B0F';
  container.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.6';
  container.innerHTML = `
    <style>
      h1, h2, h3, h4, h5, h6 { color: #0B0B0F; margin-top: 1.2em; margin-bottom: 0.6em; }
      p { margin-bottom: 1em; }
      table { border-collapse: collapse; width: 100%; margin: 1em 0; }
      th, td { border: 1px solid #D1D5DB; padding: 6px 10px; }
      th { background-color: #F3F4F6; }
      img { max-width: 100%; }
    </style>
    ${cleanHtml}
  `;

  document.body.appendChild(container);

  try {
    onProgress?.(65, 'Capturing rendered layout...');
    const canvas = await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    onProgress?.(85, 'Assembling PDF pages...');
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

    onProgress?.(100, 'HTML to PDF complete.');
    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}

