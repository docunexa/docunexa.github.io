import { describe, it, expect } from 'vitest';
import { formatBytes, getFileExtension, truncateFilename } from '../src/utils/formatters';
import { sanitizeHtml } from '../src/utils/sanitize';
import { parsePageRanges } from '../src/converters/pdf/pdfSplit';

describe('formatters', () => {
  it('formats byte numbers accurately', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1073741824)).toBe('1 GB');
    expect(formatBytes(2500000, 1)).toBe('2.4 MB');
  });

  it('extracts lowercased file extensions reliably', () => {
    expect(getFileExtension('report.pdf')).toBe('pdf');
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
    expect(getFileExtension('IMAGE.JPEG')).toBe('jpeg');
    expect(getFileExtension('noextension')).toBe('');
  });

  it('truncates long filenames cleanly while keeping extension', () => {
    const longName = 'this-is-an-extremely-long-document-filename-for-a-contract.pdf';
    const truncated = truncateFilename(longName, 25);
    expect(truncated.endsWith('.pdf')).toBe(true);
    expect(truncated.length).toBeLessThanOrEqual(25);
  });
});

describe('sanitizeHtml', () => {
  it('strips script tags and dangerous event handlers', () => {
    const malicious = '<p>Hello</p><script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const safe = sanitizeHtml(malicious);
    expect(safe).not.toContain('<script>');
    expect(safe).not.toContain('onerror');
    expect(safe).toContain('<p>Hello</p>');
  });
});

describe('parsePageRanges', () => {
  it('parses comma-separated pages and hyphenated intervals', () => {
    const pages = parsePageRanges('1-3, 5, 8-9', 10);
    expect(pages).toEqual([1, 2, 3, 5, 8, 9]);
  });

  it('clamps invalid ranges within total page count', () => {
    const pages = parsePageRanges('0, 4, 15', 5);
    expect(pages).toEqual([4]);
  });

  it('returns all pages when range string is empty', () => {
    const pages = parsePageRanges('', 4);
    expect(pages).toEqual([1, 2, 3, 4]);
  });
});

