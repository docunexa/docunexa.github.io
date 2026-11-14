export type ToolCategory = 'all' | 'pdf' | 'word' | 'image' | 'text' | 'utility';

export type ToolImplementationStatus = 
  | 'fully-implemented'
  | 'partially-supported'
  | 'requires-external-service'
  | 'not-yet-supported';

export type DocumentFormat = 
  | 'pdf' 
  | 'docx' 
  | 'txt' 
  | 'html' 
  | 'md' 
  | 'png' 
  | 'jpg' 
  | 'jpeg' 
  | 'webp'
  | 'zip'
  | 'any';

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  sourceFormats: DocumentFormat[];
  targetFormat?: DocumentFormat;
  status: ToolImplementationStatus;
  statusNotice?: string;
  badge?: string;
  iconName: string;
  featured?: boolean;
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  previewUrl?: string;
  customOutputName?: string;
  targetFormat?: DocumentFormat;
  status: 'idle' | 'processing' | 'done' | 'error';
  progress?: number;
  progressMessage?: string;
  resultBlob?: Blob;
  resultFilename?: string;
  resultUrl?: string;
  resultSize?: number;
  errorMessage?: string;
  meta?: {
    pageCount?: number;
    dimensions?: { width: number; height: number };
    wordCount?: number;
    checksumSha256?: string;
  };
}

export interface ConversionOptions {
  // PDF Options
  pageRange?: string; // e.g. "1-3, 5"
  rotationAngle?: 90 | 180 | 270;
  pagesToDelete?: string;
  pageOrder?: number[];
  watermarkText?: string;
  watermarkOpacity?: number; // 0.1 to 1.0
  watermarkFontSize?: number;
  watermarkRotation?: number;
  imageWatermarkFile?: File;
  pageNumberPosition?: 'bottom-center' | 'bottom-right' | 'top-center' | 'top-right';
  pageNumberFormat?: string; // "Page {n} of {total}"
  pdfPassword?: string;
  pdfTitle?: string;
  pdfAuthor?: string;
  pdfSubject?: string;
  pdfKeywords?: string;
  
  // Signature & Redaction & Crop
  signatureDataUrl?: string;
  signaturePage?: number;
  signatureX?: number;
  signatureY?: number;
  signatureWidth?: number;
  signatureHeight?: number;
  cropMarginPercent?: number;
  redactions?: Array<{ page: number; x: number; y: number; width: number; height: number }>;
  
  // Image Options
  imageTargetFormat?: 'png' | 'jpg' | 'webp';
  imageQuality?: number; // 0.1 to 1.0
  resizeWidth?: number;
  resizeHeight?: number;
  resizeMaintainAspect?: boolean;
  resizeScalePercent?: number;
  imageRotateAngle?: number;
  cropBox?: { x: number; y: number; width: number; height: number };

  // Text / Markdown / Word options
  docHeading?: string;
  sanitizeHtml?: boolean;
}

export interface ConversionProgressCallback {
  (progress: number, message: string): void;
}

