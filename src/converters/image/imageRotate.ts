import { loadImageElement } from './imageConvert';
import { ConversionProgressCallback } from '../../types';

export async function rotateImage(
  file: File,
  degrees: number = 90,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, 'Loading image...');
  const img = await loadImageElement(file);

  onProgress?.(60, `Rotating image by ${degrees}°...`);

  const rads = (degrees * Math.PI) / 180;
  const isRightAngle = Math.abs(degrees % 180) === 90;

  const width = isRightAngle ? img.naturalHeight : img.naturalWidth;
  const height = isRightAngle ? img.naturalWidth : img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.translate(width / 2, height / 2);
  ctx.rotate(rads);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  const mime = file.type || 'image/png';
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), mime, 0.95);
  });

  onProgress?.(100, 'Image rotated.');
  return blob;
}

