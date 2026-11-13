import { loadImageElement } from './imageConvert';
import { ConversionProgressCallback } from '../../types';

export async function cropImage(
  file: File,
  cropBox: { x: number; y: number; width: number; height: number },
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, 'Loading image for cropping...');
  const img = await loadImageElement(file);

  onProgress?.(60, 'Applying crop bounding box...');
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, cropBox.width);
  canvas.height = Math.max(1, cropBox.height);
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    img,
    cropBox.x,
    cropBox.y,
    cropBox.width,
    cropBox.height,
    0,
    0,
    cropBox.width,
    cropBox.height
  );

  const mime = file.type || 'image/png';
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), mime, 0.95);
  });

  onProgress?.(100, 'Image cropped.');
  return blob;
}

