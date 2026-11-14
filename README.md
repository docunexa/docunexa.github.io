# DocuFlow Aka DOCuNEXA — All-in-One Document Converter

> **Free, private in-browser document tools.**  
> Convert, compress, merge, split, and organize your documents in seconds — 100% locally in your browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue.svg)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-pink.svg)
![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-black.svg)

---

## Overview

**DocuFlow** is a modern, high-performance web application designed for professional document workflows. Unlike traditional document converters that force users to upload confidential contracts, financial sheets, and sensitive personal files to unknown third-party servers, DocuFlow runs **entirely client-side** using modern WebAssembly, HTML5 Canvas, Web Crypto, and Web Workers.

Your files never leave your computer. There are no server upload bottlenecks, no subscriptions, no daily limits, and no watermark additions.

---

## Design System

DocuFlow strictly adheres to an uncompromising **four-color design system** inspired by the minimalism and craftsmanship of Stripe and Linear:

| Token | Hex Code | Purpose |
|---|---|---|
| **Black** | `#0B0B0F` | Primary text, dark-mode surfaces, bold borders |
| **Blue** | `#2563EB` | Primary action buttons, active tabs, verified indicators |
| **White** | `#FFFFFF` | Light-mode backgrounds, card surfaces, dark-mode text |
| **Pink** | `#EC4899` | Accent highlights, warnings, status notices |

- **Restrained SaaS Interface:** Clean typography (Inter/system-ui), rounded cards (`rounded-card`), subtle borders (`10%` opacity), and zero visual clutter.
- **Light & Dark Theme:** System-responsive with a persistent toggle.
- **Fully Responsive:** Fluid layouts designed for mobile phones, tablets, and desktop displays.
- **Accessible & Transparent:** Clear focus states, ARIA compliance, and honest status disclosures.

---

## Toolkit Directory (50+ Specialized Tools)

### A. PDF Suite
- **PDF to Word (.docx):** Reconstructs text, font scales, headings, and paragraphs into real `.docx` files.
- **PDF to Text (.txt):** Clean plain-text extraction with page separation markers.
- **PDF to Images (PNG/JPG):** High-DPI canvas rendering per page; multi-page PDFs download as a packaged ZIP.
- **PDF to HTML:** Semantic HTML5 document reconstruction.
- **PDF to Markdown:** Headings, blockquotes, and paragraphs extracted to `.md`.
- **Word (.docx) to PDF:** Real Mammoth HTML parsing with high-fidelity canvas rendering.
- **Images to PDF:** Merges one or multiple JPG, PNG, or WebP images into a unified multi-page PDF.
- **Text (.txt) to PDF:** Automated word-wrapping, page pagination, headers, and page numbering.
- **HTML to PDF:** Sanitized DOM rendering to printable PDF pages.
- **Markdown to PDF:** Formatted PDF generation preserving Markdown headings, tables, and blockquotes.
- **Merge Multiple PDFs:** Fast client-side page concatenation using `pdf-lib`.
- **Split PDF by Pages:** Extract individual pages or custom intervals (e.g., `1-3, 5`) into separate documents or ZIP.
- **Extract Selected Pages:** Isolate target pages to form a new focused PDF.
- **Reorder PDF Pages:** Rearrange pages into any custom sequence.
- **Rotate PDF Pages:** 90°, 180°, or 270° clockwise page rotation.
- **Delete Selected Pages:** Remove unwanted pages or ranges.
- **Compress PDF:** Client-side stream optimization and calibrated canvas re-encoding to reduce MBs.
- **Protect PDF:** Set document owner/user passwords and metadata protection dictionaries.
- **Unlock PDF:** Decrypt and save unprotected PDF copies when authorized with valid credentials.
- **Add Page Numbers:** Stamp customizable page numbers (`Page {n} of {total}`) in various positions.
- **Add Text Watermark:** Stamp semi-transparent diagonal watermarks with configurable opacity and size.
- **Add Image Watermark:** Overlay logos or brand stamps onto document pages.
- **Add Text / Annotate:** Add header, footer, or body text annotations.
- **Extract PDF Images:** Detects raster images and extracts them into a single ZIP archive.
- **PDF Metadata Editor:** Inspect and update Title, Author, Subject, Keywords, and Producer tags.

### B. Microsoft Word (.docx) Tools
- **Word to PDF:** High-fidelity DOCX rendering and PDF export.
- **PDF to Word:** Structural document reconstruction with heading detection.
- **DOCX to TXT:** Raw text and paragraph extraction.
- **DOCX to HTML:** Semantic HTML5 transformation via Mammoth.
- **DOCX to Markdown:** Heading and list structure converted to Markdown.
- **TXT to DOCX:** Formatted paragraphs packaged into valid `.docx` files.
- **HTML to DOCX:** DOM nodes (H1-H3, P, LI, Blockquote) translated to DOCX elements.
- **Markdown to DOCX:** Markdown headings, bullet points, and text runs converted to DOCX.
- **Merge DOCX Documents:** Combine multiple Word documents into a unified file.
- **Word Document Preview:** In-browser live preview of DOCX files without needing MS Office.

### C. Image Studio
- **JPG to PNG:** Lossless conversion.
- **PNG to JPG:** Lightweight JPG conversion with adjustable compression quality.
- **WebP to PNG:** Universal format conversion.
- **PNG/JPG to WebP:** Next-gen web image compression.
- **Images to PDF:** Single or multi-image PDF compilation.
- **Resize Images:** Pixel dimensions with aspect ratio lock or custom dimensions.
- **Compress Images:** Lossy/lossless canvas re-encoding with target quality slider.
- **Rotate Images:** 90°, 180°, 270°, or arbitrary degree angles.
- **Crop Images:** Crop to specific bounding boxes.
- **Change Image Dimensions:** Scale by percentage or exact pixel dimensions.
- **Batch Image Conversion:** Convert batches of images at once and download as a ZIP.

### D. Text & Web Document Tools
- **Markdown to HTML:** GitHub-flavored Markdown rendered into sanitized HTML.
- **HTML to Plain Text:** Strip tags and extract clean, readable text.
- **Text to Markdown:** Auto-structure plain text into Markdown headings and lists.

### E. Archive & Utilities
- **ZIP Archive Creator:** Bundle multiple files of any type into a `.zip` archive.
- **File Information Viewer:** Deep inspection of byte sizes, MIME types, dimensions, page counts, and word counts.
- **File Size Calculator:** Estimate compression ratios and storage savings.
- **SHA-256 Checksum Generator:** Compute cryptographic SHA-256 and SHA-1 hash digests with the Web Crypto API.

---

## Technical Architecture

DocuFlow is built purely as a **static single-page application (SPA)**:

```
src/
├── types/                 # Shared data contracts (ToolDefinition, FileItem, Options)
├── tools/                 # Tool directory registry and categorization
├── converters/
│   ├── pdf/               # PDF manipulation (pdf-lib, pdfjs-dist)
│   ├── word/              # DOCX parsing and generation (docx, mammoth)
│   ├── image/             # Canvas-based raster transformations
│   ├── text/              # Text, Markdown, and HTML conversions
│   └── utilities/         # ZIP compression, crypto digests, file metadata
├── components/
│   ├── common/            # Navbar, Footer, Dropzone, Modal, StatusBadge, ProgressBar
│   ├── workspace/         # Multi-file conversion queue, batch selectors, settings
│   ├── tools/             # ToolDirectory, ToolCard, ToolModal
│   ├── preview/           # In-memory document previewer (PDF canvas, DOCX HTML, image)
│   └── views/             # PrivacyModal, AboutModal, FormatsModal, ContactModal
├── utils/                 # Download helpers, formatters, HTML sanitization, PDF worker
├── App.tsx
├── main.tsx
└── index.css
```

### Key Libraries
- **PDF Manipulation:** `pdf-lib` (v1.17.1)
- **PDF Parsing & Canvas Rendering:** `pdfjs-dist` (v3.11.174)
- **DOCX Creation:** `docx` (v9.1.1)
- **DOCX Parsing:** `mammoth` (v1.9.0)
- **HTML/Markdown PDF Generation:** `jspdf` & `html2canvas`
- **ZIP Packaging:** `jszip` (v3.10.1)
- **Markdown Engine:** `marked` (v15.0.7)
- **XSS Sanitization:** `dompurify` (v3.2.4)
- **Icons:** `lucide-react`

---

## Privacy & Security Guarantees

1. **Zero Remote Transmission:** Files are parsed exclusively in your browser's RAM via JavaScript and WebAssembly. No files or metadata are uploaded to any server.
2. **Volatile Memory:** Document bytes are discarded as soon as the tab is closed or the "Clear All" button is clicked. No document content is ever written to `localStorage` or `sessionStorage`.
3. **Strict HTML Sanitization:** User-supplied HTML or Markdown is sanitized through `DOMPurify` before rendering to block script injection and cross-site scripting (XSS).
4. **Local Cryptography:** File hash checksums are calculated using the browser's hardware-accelerated `window.crypto.subtle` API.

---

## Honest Technical Notes & Limitations

- **PDF to Word:** Native text lines, coordinates, and font sizes are analyzed to reconstruct headings, paragraphs, and page order. Complex multi-column brochure layouts or scanned image-only PDFs will produce text-based reconstructions rather than exact pixel-perfect graphical layouts.
- **Word to PDF:** High-fidelity conversion preserves paragraphs, headings, bullet lists, tables, and standard formatting. Advanced Microsoft Office-proprietary macros or complex drawing canvases are not rendered by standard browser layout engines.
- **Memory Footprint:** Conversions are tested for files up to 100MB. For exceptionally massive files (>250MB), browser tab memory limits apply.

---

## Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/docunexa/docunexa.github.io.git
cd docunexa.github.io

# Install dependencies
npm install --legacy-peer-deps
```

### Development Server
```bash
# Start local development server with Hot Module Replacement (HMR)
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Tests
```bash
# Run Vitest test suite
npm run test
```

### Production Build
```bash
# Type check and build static site for production
npm run build

# Preview production build locally
npm run preview
```
The compiled, optimized static assets will be located in the `dist/` directory.

---

## GitHub Pages Deployment

DocuFlow is designed to deploy seamlessly to GitHub Pages at `https://USERNAME.github.io/REPOSITORY/` or a custom domain.

### Automated Deployment (GitHub Actions)
The repository includes `.github/workflows/deploy.yml`. When you push to the `main` branch, GitHub Actions will:
1. Check out the code.
2. Install dependencies with `npm ci --legacy-peer-deps`.
3. Run the automated test suite (`npm run test`).
4. Build the static site (`npm run build`).
5. Deploy the `dist/` output directory directly to GitHub Pages.

To enable GitHub Pages in your repository:
1. Navigate to **Settings** &rarr; **Pages**.
2. Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
3. Push a commit to `main` or trigger the workflow manually from the **Actions** tab.

### SPA Routing Fallback
A `public/404.html` redirect script is included so that refreshing nested routes or URLs on GitHub Pages never returns a 404 error.

---
### Auther

[Mohd Shami](https://mohdshamii.github.io)

## License

This project is open source and available under the [MIT License](LICENSE).

