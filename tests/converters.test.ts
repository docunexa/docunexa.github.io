import { describe, it, expect } from 'vitest';
import { convertMarkdownToHtml } from '../src/converters/text/markdownToHtml';
import { convertHtmlToTxt, convertTextToMarkdown } from '../src/converters/text/htmlToTxt';

describe('Text and Markdown Converters', () => {
  it('converts markdown to clean HTML', async () => {
    const mdFile = new File(['# Title\n\nThis is **bold** text.'], 'sample.md', {
      type: 'text/markdown',
    });

    const blob = await convertMarkdownToHtml(mdFile);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toContain('text/html');

    const html = await blob.text();
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('converts HTML to clean plain text', async () => {
    const htmlFile = new File(
      ['<h1>Heading</h1><p>First paragraph.</p><p>Second paragraph.</p>'],
      'doc.html',
      { type: 'text/html' }
    );

    const blob = await convertHtmlToTxt(htmlFile);
    expect(blob).toBeInstanceOf(Blob);

    const text = await blob.text();
    expect(text).toContain('Heading');
    expect(text).toContain('First paragraph.');
    expect(text).not.toContain('<h1>');
  });

  it('structures plain text to markdown format', async () => {
    const txtFile = new File(
      ['QUARTERLY SUMMARY\n\n- Task 1\n- Task 2\n\nGeneral prose notes here.'],
      'notes.txt',
      { type: 'text/plain' }
    );

    const blob = await convertTextToMarkdown(txtFile);
    expect(blob).toBeInstanceOf(Blob);

    const md = await blob.text();
    expect(md).toContain('## QUARTERLY SUMMARY');
    expect(md).toContain('- Task 1');
  });
});

