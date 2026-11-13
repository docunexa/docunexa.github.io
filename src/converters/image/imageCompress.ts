import { loadImageElement } from './imageConvert';
import { ConversionProgressCallback } from '../../types';

export async function compressImage(
  file: File,
  quality: number = 0.75, // 0.1 to 1.0
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, 'Loading image for compression...');
  const img = await loadImageElement(file);

  onProgress?.(60, `Re-encoding image at quality ${Math.round(quality * 100)}%...`);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0);

  // Compress using WebP or JPEG for lossy optimization
  const mimeType = file.type === 'image/png' ? 'image/webp' : file.type || 'image/jpeg';

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), mimeType, quality);
  });

  onProgress?.(100, 'Image compressed.');
  return blob;
}

