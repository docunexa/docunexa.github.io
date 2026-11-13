import JSZip from 'jszip';
import { convertImageFormat } from './imageConvert';
import { ConversionProgressCallback } from '../../types';

export async function batchConvertImages(
  files: File[],
  targetFormat: 'png' | 'jpg' | 'webp' = 'png',
  quality: number = 0.9,
  onProgress?: ConversionProgressCallback
): Promise<{ blob: Blob; filename: string }> {
  if (files.length === 0) {
    throw new Error('Please select images to convert.');
  }

  onProgress?.(10, 'Initializing batch image converter...');
  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = 10 + Math.round(((i + 1) / files.length) * 80);
    onProgress?.(progress, `Converting ${file.name} to ${targetFormat.toUpperCase()} (${i + 1}/${files.length})...`);

    const convertedBlob = await convertImageFormat(file, targetFormat, quality);
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    zip.file(`${baseName}.${targetFormat}`, convertedBlob);
  }

  onProgress?.(95, 'Assembling ZIP bundle...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  onProgress?.(100, 'Batch image conversion complete.');

  return {
    blob: zipBlob,
    filename: `converted-images-${targetFormat}.zip`,
  };
}

