import { loadImageElement } from './imageConvert';
import { ConversionProgressCallback } from '../../types';

export async function resizeImage(
  file: File,
  options: {
    targetWidth?: number;
    targetHeight?: number;
    scalePercent?: number;
    maintainAspect?: boolean;
    quality?: number;
  },
  onProgress?: ConversionProgressCallback
): Promise<Blob> {
  onProgress?.(25, 'Loading image...');
  const img = await loadImageElement(file);

  let newWidth = img.naturalWidth;
  let newHeight = img.naturalHeight;

  if (options.scalePercent && options.scalePercent > 0) {
    const factor = options.scalePercent / 100;
    newWidth = Math.round(img.naturalWidth * factor);
    newHeight = Math.round(img.naturalHeight * factor);
  } else if (options.targetWidth || options.targetHeight) {
    const tw = options.targetWidth;
    const th = options.targetHeight;

    if (options.maintainAspect !== false) {
      const aspect = img.naturalWidth / img.naturalHeight;
      if (tw && th) {
        newWidth = tw;
        newHeight = Math.round(tw / aspect);
      } else if (tw) {
        newWidth = tw;
        newHeight = Math.round(tw / aspect);
      } else if (th) {
        newHeight = th;
        newWidth = Math.round(th * aspect);
      }
    } else {
      if (tw) newWidth = tw;
      if (th) newHeight = th;
    }
  }

  onProgress?.(60, `Resizing image to ${newWidth} x ${newHeight}px...`);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, newWidth);
  canvas.height = Math.max(1, newHeight);
  const ctx = canvas.getContext('2d')!;

  // Smooth scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const mime = file.type || 'image/png';
  const quality = options.quality ?? 0.92;

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), mime, quality);
  });

  onProgress?.(100, 'Image resized.');
  return blob;
}

