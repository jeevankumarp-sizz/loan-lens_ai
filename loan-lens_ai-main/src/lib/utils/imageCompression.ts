/**
 * imageCompression.ts
 * Client-side image compression using Canvas API.
 * Prevents Gemini 400 "Request Entity Too Large" errors from large mobile photos.
 */

export interface CompressionOptions {
  /** Max width/height in px. Default 1024 */
  maxDimension?: number;
  /** JPEG quality 0–1. Default 0.82 */
  quality?: number;
  /** Max output size in bytes. Default 900_000 (≈900KB) */
  maxBytes?: number;
  /** Output mime type. Default image/jpeg */
  mimeType?: 'image/jpeg' | 'image/webp';
}

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
}

const DEFAULTS: Required<CompressionOptions> = {
  maxDimension: 1024,
  quality: 0.82,
  maxBytes: 900_000,
  mimeType: 'image/jpeg',
};

/**
 * Compress an image File using the Canvas API.
 * Returns original file unchanged if already small enough.
 * Safe to call in browser only — throws if called server-side.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULTS, ...options };

  // Already small enough — skip compression
  if (file.size <= opts.maxBytes) {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      dataUrl,
      originalSize: file.size,
      compressedSize: file.size,
      wasCompressed: false,
    };
  }

  const bitmap = await createImageBitmap(file);
  const { width: origW, height: origH } = bitmap;

  // Compute scaled dimensions preserving aspect ratio
  let w = origW;
  let h = origH;
  if (w > opts.maxDimension || h > opts.maxDimension) {
    if (w >= h) {
      h = Math.round((h / w) * opts.maxDimension);
      w = opts.maxDimension;
    } else {
      w = Math.round((w / h) * opts.maxDimension);
      h = opts.maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // Iteratively reduce quality until under maxBytes
  let quality = opts.quality;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    blob = await canvasToBlob(canvas, opts.mimeType, quality);
    if (blob.size <= opts.maxBytes) break;
    quality = Math.max(0.4, quality - 0.12);
  }

  if (!blob) throw new Error('Canvas toBlob failed');

  const compressedFile = new File(
    [blob],
    file.name.replace(/\.[^.]+$/, '.jpg'),
    { type: opts.mimeType, lastModified: Date.now() }
  );

  const dataUrl = await fileToDataUrl(compressedFile);

  console.log(
    `[ImageCompression] ${(file.size / 1024).toFixed(0)}KB → ` +
    `${(compressedFile.size / 1024).toFixed(0)}KB ` +
    `(${w}×${h}px, q=${quality.toFixed(2)})`
  );

  return {
    file: compressedFile,
    dataUrl,
    originalSize: file.size,
    compressedSize: compressedFile.size,
    wasCompressed: true,
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('canvas.toBlob returned null'));
      },
      type,
      quality
    );
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate a file before compression.
 * Returns null if valid, or an error message string.
 */
export function validateImageFile(file: File): string | null {
  const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!ALLOWED.has(file.type)) {
    return 'Only JPEG, PNG, and WEBP images are supported.';
  }
  if (file.size > 20 * 1024 * 1024) {
    return 'Photo size exceeds 20MB. Please use a smaller image.';
  }
  return null;
}
