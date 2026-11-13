import JSZip from 'jszip';
import { ConversionProgressCallback } from '../../types';

export async function createZipArchive(
  files: File[] | { name: string; blob: Blob }[],
  archiveName: string = 'archive.zip',
  onProgress?: ConversionProgressCallback
): Promise<{ blob: Blob; filename: string }> {
  if (files.length === 0) {
    throw new Error('Please select at least one file to archive.');
  }

  onProgress?.(10, 'Initializing ZIP archiver...');
  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const item = files[i];
    const progress = 10 + Math.round(((i + 1) / files.length) * 80);
    const name = item.name;
    const blob = 'blob' in item ? item.blob : item;

    onProgress?.(progress, `Compressing ${name} (${i + 1}/${files.length})...`);
    zip.file(name, blob);
  }

  onProgress?.(95, 'Finalizing ZIP archive...');
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  onProgress?.(100, 'Archive created.');
  return { blob: zipBlob, filename: archiveName };
}

