import { ConversionOptions, ConversionProgressCallback, DocumentFormat } from '../types';
import { convertPdfToWord } from './pdf/pdfToWord';
import { convertPdfToText } from './pdf/pdfToText';
import { convertPdfToImages } from './pdf/pdfToImages';
import { convertPdfToHtml } from './pdf/pdfToHtml';
import { convertPdfToMarkdown } from './pdf/pdfToMarkdown';
import { mergePdfs } from './pdf/pdfMerge';
import { splitPdf } from './pdf/pdfSplit';
import { extractPdfPages } from './pdf/pdfExtract';
import { reorderPdfPages } from './pdf/pdfReorder';
import { rotatePdfPages } from './pdf/pdfRotate';
import { deletePdfPages } from './pdf/pdfDelete';
import { compressPdf } from './pdf/pdfCompress';
import { protectPdf, unlockPdf } from './pdf/pdfSecurity';
import { addPageNumbersToPdf } from './pdf/pdfPageNumbers';
import { addTextWatermarkToPdf, addImageWatermarkToPdf } from './pdf/pdfWatermark';
import { addTextToPdf } from './pdf/pdfAddText';
import { extractImagesFromPdf } from './pdf/pdfExtractImages';
import { updatePdfMetadata } from './pdf/pdfMetadata';
import { signPdf } from './pdf/pdfSign';
import { cropPdf } from './pdf/pdfCrop';
import { redactPdf } from './pdf/pdfRedact';
import { comparePdfFiles } from './pdf/pdfCompare';

import { convertDocxToPdf } from './word/wordToPdf';
import { convertDocxToTxt, convertDocxToHtml, convertDocxToMarkdown } from './word/wordToTxt';
import { convertTxtToDocx } from './word/txtToDocx';
import { convertHtmlToDocx } from './word/htmlToDocx';
import { convertMarkdownToDocx } from './word/markdownToDocx';
import { mergeDocxFiles } from './word/wordMerge';

import { convertImageFormat } from './image/imageConvert';
import { convertImagesToPdf } from './image/imagesToPdf';
import { resizeImage } from './image/imageResize';
import { compressImage } from './image/imageCompress';
import { rotateImage } from './image/imageRotate';
import { cropImage } from './image/imageCrop';
import { batchConvertImages } from './image/batchImageConvert';

import { convertTxtToPdf } from './text/txtToPdf';
import { convertHtmlToPdf } from './text/htmlToPdf';
import { convertMarkdownToHtml } from './text/markdownToHtml';
import { convertMarkdownToPdf } from './text/markdownToPdf';
import { convertHtmlToTxt, convertTextToMarkdown } from './text/htmlToTxt';

import { createZipArchive } from './utilities/zipArchive';
import { generateChecksumFile } from './utilities/fileChecksum';

export interface ExecuteConversionResult {
  blob: Blob;
  filename: string;
}

export async function executeToolConversion(
  toolId: string,
  files: File[],
  options: ConversionOptions = {},
  onProgress?: ConversionProgressCallback
): Promise<ExecuteConversionResult> {
  if (files.length === 0) {
    throw new Error('No files provided for conversion.');
  }

  const primaryFile = files[0];
  const baseName = primaryFile.name.replace(/\.[^/.]+$/, '');

  switch (toolId) {
    // --- PDF Tools ---
    case 'pdf-to-docx': {
      const blob = await convertPdfToWord(primaryFile, onProgress);
      return { blob, filename: `${baseName}.docx` };
    }
    case 'pdf-to-txt': {
      const blob = await convertPdfToText(primaryFile, onProgress);
      return { blob, filename: `${baseName}.txt` };
    }
    case 'pdf-to-images': {
      const targetFmt = options.imageTargetFormat === 'jpg' ? 'jpg' : 'png';
      return await convertPdfToImages(primaryFile, targetFmt, onProgress);
    }
    case 'pdf-to-html': {
      const blob = await convertPdfToHtml(primaryFile, onProgress);
      return { blob, filename: `${baseName}.html` };
    }
    case 'pdf-to-markdown': {
      const blob = await convertPdfToMarkdown(primaryFile, onProgress);
      return { blob, filename: `${baseName}.md` };
    }
    case 'docx-to-pdf': {
      const blob = await convertDocxToPdf(primaryFile, onProgress);
      return { blob, filename: `${baseName}.pdf` };
    }
    case 'images-to-pdf': {
      const blob = await convertImagesToPdf(files, onProgress);
      return { blob, filename: `${baseName}-converted.pdf` };
    }
    case 'txt-to-pdf': {
      const blob = await convertTxtToPdf(primaryFile, onProgress);
      return { blob, filename: `${baseName}.pdf` };
    }
    case 'html-to-pdf': {
      const blob = await convertHtmlToPdf(primaryFile, onProgress);
      return { blob, filename: `${baseName}.pdf` };
    }
    case 'markdown-to-pdf': {
      const blob = await convertMarkdownToPdf(primaryFile, onProgress);
      return { blob, filename: `${baseName}.pdf` };
    }
    case 'pdf-merge': {
      const blob = await mergePdfs(files, onProgress);
      return { blob, filename: `merged-document.pdf` };
    }
    case 'pdf-split': {
      return await splitPdf(primaryFile, options.pageRange, onProgress);
    }
    case 'pdf-extract-pages': {
      const blob = await extractPdfPages(primaryFile, options.pageRange || '1', onProgress);
      return { blob, filename: `${baseName}-extracted.pdf` };
    }
    case 'pdf-reorder': {
      const blob = await reorderPdfPages(primaryFile, options.pageOrder || [1], onProgress);
      return { blob, filename: `${baseName}-reordered.pdf` };
    }
    case 'pdf-rotate': {
      const blob = await rotatePdfPages(
        primaryFile,
        options.rotationAngle || 90,
        options.pageRange,
        onProgress
      );
      return { blob, filename: `${baseName}-rotated.pdf` };
    }
    case 'pdf-delete-pages': {
      const blob = await deletePdfPages(
        primaryFile,
        options.pagesToDelete || '1',
        onProgress
      );
      return { blob, filename: `${baseName}-edited.pdf` };
    }
    case 'pdf-compress': {
      const blob = await compressPdf(primaryFile, options.imageQuality || 0.75, onProgress);
      return { blob, filename: `${baseName}-compressed.pdf` };
    }
    case 'pdf-protect': {
      const blob = await protectPdf(primaryFile, options.pdfPassword || '1234', onProgress);
      return { blob, filename: `${baseName}-protected.pdf` };
    }
    case 'pdf-unlock': {
      const blob = await unlockPdf(primaryFile, options.pdfPassword, onProgress);
      return { blob, filename: `${baseName}-unlocked.pdf` };
    }
    case 'pdf-page-numbers': {
      const blob = await addPageNumbersToPdf(
        primaryFile,
        options.pageNumberPosition || 'bottom-center',
        options.pageNumberFormat || 'Page {n} of {total}',
        onProgress
      );
      return { blob, filename: `${baseName}-numbered.pdf` };
    }
    case 'pdf-watermark-text': {
      const blob = await addTextWatermarkToPdf(
        primaryFile,
        options.watermarkText || 'CONFIDENTIAL',
        options.watermarkOpacity || 0.3,
        options.watermarkFontSize || 48,
        options.watermarkRotation || 45,
        onProgress
      );
      return { blob, filename: `${baseName}-watermarked.pdf` };
    }
    case 'pdf-watermark-image': {
      if (!options.imageWatermarkFile) {
        throw new Error('Please select an image file to use as the watermark.');
      }
      const blob = await addImageWatermarkToPdf(
        primaryFile,
        options.imageWatermarkFile,
        options.watermarkOpacity || 0.3,
        onProgress
      );
      return { blob, filename: `${baseName}-watermarked.pdf` };
    }
    case 'pdf-add-text': {
      const blob = await addTextToPdf(
        primaryFile,
        options.watermarkText || 'Document Annotation',
        { fontSize: 14, position: 'top' },
        onProgress
      );
      return { blob, filename: `${baseName}-annotated.pdf` };
    }
    case 'pdf-extract-images': {
      return await extractImagesFromPdf(primaryFile, onProgress);
    }
    case 'pdf-metadata': {
      const blob = await updatePdfMetadata(
        primaryFile,
        {
          title: options.pdfTitle,
          author: options.pdfAuthor,
          subject: options.pdfSubject,
          keywords: options.pdfKeywords,
        },
        onProgress
      );
      return { blob, filename: `${baseName}-metadata.pdf` };
    }
    case 'pdf-sign': {
      if (!options.signatureDataUrl) {
        throw new Error('Please provide a signature to apply.');
      }
      const blob = await signPdf(
        primaryFile,
        options.signatureDataUrl,
        options.signaturePage || 1,
        options.signatureX,
        options.signatureY,
        options.signatureWidth || 180,
        options.signatureHeight || 60,
        onProgress
      );
      return { blob, filename: `${baseName}-signed.pdf` };
    }
    case 'pdf-crop': {
      const blob = await cropPdf(
        primaryFile,
        {
          marginPercent: options.cropMarginPercent || 5,
          cropBox: options.cropBox,
        },
        onProgress
      );
      return { blob, filename: `${baseName}-cropped.pdf` };
    }
    case 'pdf-redact': {
      const blob = await redactPdf(
        primaryFile,
        options.redactions || [{ page: 1, x: 50, y: 500, width: 200, height: 40 }],
        onProgress
      );
      return { blob, filename: `${baseName}-redacted.pdf` };
    }
    case 'pdf-compare': {
      if (files.length < 2) {
        throw new Error('Please select at least 2 PDF documents to compare.');
      }
      const comparison = await comparePdfFiles(files[0], files[1], onProgress);
      return { blob: comparison.reportBlob, filename: 'comparison-report.txt' };
    }

    // --- Word Tools ---
    case 'docx-to-txt': {
      const blob = await convertDocxToTxt(primaryFile, onProgress);
      return { blob, filename: `${baseName}.txt` };
    }
    case 'docx-to-html': {
      const blob = await convertDocxToHtml(primaryFile, onProgress);
      return { blob, filename: `${baseName}.html` };
    }
    case 'docx-to-markdown': {
      const blob = await convertDocxToMarkdown(primaryFile, onProgress);
      return { blob, filename: `${baseName}.md` };
    }
    case 'txt-to-docx': {
      const blob = await convertTxtToDocx(primaryFile, onProgress);
      return { blob, filename: `${baseName}.docx` };
    }
    case 'html-to-docx': {
      const blob = await convertHtmlToDocx(primaryFile, onProgress);
      return { blob, filename: `${baseName}.docx` };
    }
    case 'markdown-to-docx': {
      const blob = await convertMarkdownToDocx(primaryFile, onProgress);
      return { blob, filename: `${baseName}.docx` };
    }
    case 'docx-merge': {
      const blob = await mergeDocxFiles(files, onProgress);
      return { blob, filename: `merged-document.docx` };
    }

    // --- Image Tools ---
    case 'jpg-to-png': {
      const blob = await convertImageFormat(primaryFile, 'png', 1.0, onProgress);
      return { blob, filename: `${baseName}.png` };
    }
    case 'png-to-jpg': {
      const blob = await convertImageFormat(
        primaryFile,
        'jpg',
        options.imageQuality || 0.92,
        onProgress
      );
      return { blob, filename: `${baseName}.jpg` };
    }
    case 'webp-to-png': {
      const blob = await convertImageFormat(primaryFile, 'png', 1.0, onProgress);
      return { blob, filename: `${baseName}.png` };
    }
    case 'image-to-webp': {
      const blob = await convertImageFormat(
        primaryFile,
        'webp',
        options.imageQuality || 0.9,
        onProgress
      );
      return { blob, filename: `${baseName}.webp` };
    }
    case 'image-resize':
    case 'image-dimensions': {
      const blob = await resizeImage(
        primaryFile,
        {
          targetWidth: options.resizeWidth,
          targetHeight: options.resizeHeight,
          scalePercent: options.resizeScalePercent,
          maintainAspect: options.resizeMaintainAspect ?? true,
          quality: options.imageQuality || 0.92,
        },
        onProgress
      );
      const ext = primaryFile.name.split('.').pop() || 'png';
      return { blob, filename: `${baseName}-resized.${ext}` };
    }
    case 'image-compress': {
      const blob = await compressImage(
        primaryFile,
        options.imageQuality || 0.75,
        onProgress
      );
      const ext = primaryFile.type === 'image/png' ? 'webp' : primaryFile.name.split('.').pop() || 'jpg';
      return { blob, filename: `${baseName}-compressed.${ext}` };
    }
    case 'image-rotate': {
      const blob = await rotateImage(
        primaryFile,
        options.imageRotateAngle || 90,
        onProgress
      );
      const ext = primaryFile.name.split('.').pop() || 'png';
      return { blob, filename: `${baseName}-rotated.${ext}` };
    }
    case 'image-crop': {
      if (!options.cropBox) {
        throw new Error('Please specify crop dimensions.');
      }
      const blob = await cropImage(primaryFile, options.cropBox, onProgress);
      const ext = primaryFile.name.split('.').pop() || 'png';
      return { blob, filename: `${baseName}-cropped.${ext}` };
    }
    case 'batch-image-convert': {
      const targetFmt = options.imageTargetFormat || 'png';
      return await batchConvertImages(
        files,
        targetFmt,
        options.imageQuality || 0.9,
        onProgress
      );
    }

    // --- Text & Web Tools ---
    case 'markdown-to-html': {
      const blob = await convertMarkdownToHtml(primaryFile, onProgress);
      return { blob, filename: `${baseName}.html` };
    }
    case 'html-to-txt': {
      const blob = await convertHtmlToTxt(primaryFile, onProgress);
      return { blob, filename: `${baseName}.txt` };
    }
    case 'text-to-markdown': {
      const blob = await convertTextToMarkdown(primaryFile, onProgress);
      return { blob, filename: `${baseName}.md` };
    }

    // --- Utilities ---
    case 'zip-create': {
      return await createZipArchive(files, 'bundle.zip', onProgress);
    }
    case 'checksum-generator': {
      return await generateChecksumFile(primaryFile, onProgress);
    }

    default:
      throw new Error(`Tool "${toolId}" is not currently configured for execution.`);
  }
}

// Intelligent source-to-target mapping function for the main drag-and-drop workspace
export async function convertSourceToTarget(
  file: File,
  targetFormat: DocumentFormat,
  options: ConversionOptions = {},
  onProgress?: ConversionProgressCallback
): Promise<ExecuteConversionResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf') {
    if (targetFormat === 'docx') return executeToolConversion('pdf-to-docx', [file], options, onProgress);
    if (targetFormat === 'txt') return executeToolConversion('pdf-to-txt', [file], options, onProgress);
    if (targetFormat === 'png' || targetFormat === 'jpg') {
      options.imageTargetFormat = targetFormat;
      return executeToolConversion('pdf-to-images', [file], options, onProgress);
    }
    if (targetFormat === 'html') return executeToolConversion('pdf-to-html', [file], options, onProgress);
    if (targetFormat === 'md') return executeToolConversion('pdf-to-markdown', [file], options, onProgress);
  } else if (ext === 'docx') {
    if (targetFormat === 'pdf') return executeToolConversion('docx-to-pdf', [file], options, onProgress);
    if (targetFormat === 'txt') return executeToolConversion('docx-to-txt', [file], options, onProgress);
    if (targetFormat === 'html') return executeToolConversion('docx-to-html', [file], options, onProgress);
    if (targetFormat === 'md') return executeToolConversion('docx-to-markdown', [file], options, onProgress);
  } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    if (targetFormat === 'pdf') return executeToolConversion('images-to-pdf', [file], options, onProgress);
    if (targetFormat === 'png') return executeToolConversion('jpg-to-png', [file], options, onProgress);
    if (targetFormat === 'jpg') return executeToolConversion('png-to-jpg', [file], options, onProgress);
    if (targetFormat === 'webp') return executeToolConversion('image-to-webp', [file], options, onProgress);
  } else if (ext === 'txt') {
    if (targetFormat === 'pdf') return executeToolConversion('txt-to-pdf', [file], options, onProgress);
    if (targetFormat === 'docx') return executeToolConversion('txt-to-docx', [file], options, onProgress);
    if (targetFormat === 'md') return executeToolConversion('text-to-markdown', [file], options, onProgress);
  } else if (ext === 'html') {
    if (targetFormat === 'pdf') return executeToolConversion('html-to-pdf', [file], options, onProgress);
    if (targetFormat === 'docx') return executeToolConversion('html-to-docx', [file], options, onProgress);
    if (targetFormat === 'txt') return executeToolConversion('html-to-txt', [file], options, onProgress);
  } else if (ext === 'md') {
    if (targetFormat === 'pdf') return executeToolConversion('markdown-to-pdf', [file], options, onProgress);
    if (targetFormat === 'docx') return executeToolConversion('markdown-to-docx', [file], options, onProgress);
    if (targetFormat === 'html') return executeToolConversion('markdown-to-html', [file], options, onProgress);
  }

  throw new Error(`Direct conversion from .${ext} to .${targetFormat} is not supported directly. Please select a compatible format.`);
}

