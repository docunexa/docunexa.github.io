export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts.pop()?.toLowerCase() || '';
}

export function truncateFilename(name: string, maxLength: number = 32): string {
  if (name.length <= maxLength) return name;
  const ext = getFileExtension(name);
  const extLength = ext ? ext.length + 1 : 0;
  const baseName = ext ? name.slice(0, -(extLength)) : name;
  const keep = Math.max(4, maxLength - extLength - 3);
  return `${baseName.slice(0, keep)}...${ext ? '.' + ext : ''}`;
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

