import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { sanitizeHtml } from '../../utils/sanitize';
import { ConversionProgressCallback } from '../../types';

export async function convertDocxToPdf(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(15, 'Extracting Word document structure with Mammoth...');
  const arrayBuffer = await file.arrayBuffer();
  const conversionResult = await mammoth.convertToHtml({ arrayBuffer });
  const rawHtml = conversionResult.value;

  if (!rawHtml || rawHtml.trim().length === 0) {
    throw new Error('Could not extract readable content from this DOCX document.');
  }

  onProgress?.(40, 'Rendering document layout for PDF export...');
  const cleanHtml = sanitizeHtml(rawHtml);

  // Create temporary container for high-fidelity rendering
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
      h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #0B0B0F; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
      h2 { font-size: 18px; font-weight: 600; margin-top: 20px; margin-bottom: 12px; color: #1F2937; }
      h3 { font-size: 16px; font-weight: 600; margin-top: 16px; margin-bottom: 8px; color: #374151; }
      p { margin-bottom: 12px; }
      ul, ol { margin-left: 24px; margin-bottom: 14px; }
      li { margin-bottom: 4px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th, td { border: 1px solid #D1D5DB; padding: 8px 12px; text-align: left; }
      th { background-color: #F3F4F6; font-weight: 600; }
      blockquote { border-left: 4px solid #2563EB; padding-left: 16px; margin-left: 0; color: #4B5563; font-style: italic; }
      img { max-width: 100%; height: auto; }
    </style>
    ${cleanHtml}
  `;

  document.body.appendChild(container);

  try {
    onProgress?.(65, 'Capturing multi-page document...');
    const canvas = await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    onProgress?.(85, 'Assembling printable PDF pages...');
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

    onProgress?.(100, 'PDF generation complete.');
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } finally {
    document.body.removeChild(container);
  }
}

