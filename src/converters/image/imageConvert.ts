import { ConversionProgressCallback } from '../../types';

export function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image file. Format may be corrupted or unsupported.'));
    };
    img.src = url;
  });
}

export async function convertImageFormat(
  file: File,
  targetFormat: 'png' | 'jpg' | 'webp',
  quality: number = 0.92,
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, `Loading image ${file.name}...`);
  const img = await loadImageElement(file);

  onProgress?.(60, `Converting to ${targetFormat.toUpperCase()}...`);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  // If converting to JPG, fill white background to avoid transparent black artifacts
  if (targetFormat === 'jpg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const mimeType =
    targetFormat === 'png' ? 'image/png' : targetFormat === 'webp' ? 'image/webp' : 'image/jpeg';

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Image canvas conversion failed.'));
      },
      mimeType,
      quality
    );
  });

  onProgress?.(100, 'Image conversion complete.');
  return blob;
}

