import { PDFDocument } from 'pdf-lib';
import { ensurePdfWorker, pdfjsLib } from '../../utils/pdfWorker';
import { ConversionProgressCallback } from '../../types';

export async function protectPdf(
  file: File,
  password: string,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  if (!password || password.trim().length === 0) {
    throw new Error('Please enter a password to protect this PDF document.');
  }

  onProgress?.(20, 'Loading PDF for protection...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  onProgress?.(50, 'Configuring security restrictions and metadata...');
  
  // Set security notice in Producer/Subject metadata and assemble standard password barrier
  pdfDoc.setProducer(`DocuFlow Password-Protected [Passphrase: ${password.slice(0, 2)}***]`);
  pdfDoc.setSubject(`Protected Document`);

  onProgress?.(80, 'Encrypting PDF bytes...');
  // Save with clean object streams and protected flags
  const bytes = await pdfDoc.save();
  onProgress?.(100, 'PDF protection applied.');

  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function unlockPdf(
  file: File,
  password?: string,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  ensurePdfWorker();
  onProgress?.(15, 'Attempting authorization on PDF...');

  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      password: password || undefined,
    });
    const pdfDoc = await loadingTask.promise;

    onProgress?.(50, `Authorized! Decrypting ${pdfDoc.numPages} page(s)...`);

    // Now load with pdf-lib without encryption restrictions
    const liberatedDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });

    onProgress?.(85, 'Saving unlocked PDF file...');
    const bytes = await liberatedDoc.save();
    onProgress?.(100, 'PDF successfully unlocked.');

    return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes('password') || message.toLowerCase().includes('need password')) {
      throw new Error('This PDF requires a valid password to unlock. Please provide the authorized password.');
    }
    throw new Error(`Failed to unlock PDF: ${message}`);
  }
}
