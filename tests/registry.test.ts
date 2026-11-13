import { describe, it, expect } from 'vitest';
import { TOOLS_REGISTRY } from '../src/tools/registry';

describe('TOOLS_REGISTRY', () => {
  it('contains expected registered tools', () => {
    expect(TOOLS_REGISTRY.length).toBeGreaterThanOrEqual(45);
  });

  it('ensures all tool IDs are unique', () => {
    const ids = TOOLS_REGISTRY.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('validates every tool has required metadata', () => {
    TOOLS_REGISTRY.forEach((tool) => {
      expect(tool.id).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.category).toBeTruthy();
      expect(tool.sourceFormats.length).toBeGreaterThan(0);
      expect(['fully-implemented', 'partially-supported', 'requires-external-service', 'not-yet-supported']).toContain(tool.status);
    });
  });

  it('verifies critical PDF and Word tools exist', () => {
    const ids = TOOLS_REGISTRY.map((t) => t.id);
    expect(ids).toContain('pdf-to-docx');
    expect(ids).toContain('docx-to-pdf');
    expect(ids).toContain('pdf-merge');
    expect(ids).toContain('pdf-split');
    expect(ids).toContain('images-to-pdf');
    expect(ids).toContain('checksum-generator');
    expect(ids).toContain('zip-create');
  });
});

