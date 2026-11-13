import { ConversionProgressCallback } from '../../types';

export async function computeFileChecksum(
  file: File,
  algorithm: 'SHA-256' | 'SHA-1' = 'SHA-256',
  onProgress?: ConversionProgressCallback
): Promise<string> {
  onProgress?.(20, `Reading ${file.name} for cryptographic hashing...`);
  const buffer = await file.arrayBuffer();

  onProgress?.(60, `Computing ${algorithm} checksum...`);
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  onProgress?.(100, 'Checksum calculated.');
  return hashHex;
}

export async function generateChecksumFile(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<{ blob: Blob; filename: string }> {
  const [sha256, sha1] = await Promise.all([
    computeFileChecksum(file, 'SHA-256', onProgress),
    computeFileChecksum(file, 'SHA-1'),
  ]);

  const output = `--- DocuFlow Cryptographic File Integrity Report ---
File Name: ${file.name}
File Size: ${file.size} bytes (${(file.size / 1024).toFixed(2)} KB)
MIME Type: ${file.type || 'unknown'}
Generated: ${new Date().toUTCString()}

SHA-256: ${sha256}
SHA-1:   ${sha1}
`;

  return {
    blob: new Blob([output], { type: 'text/plain;charset=utf-8' }),
    filename: `${file.name}-checksum.txt`,
  };
}

