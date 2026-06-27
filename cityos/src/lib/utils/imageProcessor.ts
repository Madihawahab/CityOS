// ─── Image Processing Pipeline ────────────────────────────────────────────────
// Compress, resize, convert to WebP, strip EXIF.
// Runs in the browser using Canvas API — no server required.

import { MAX_UPLOAD_SIZE_BYTES, IMAGE_MAX_DIMENSION, IMAGE_QUALITY } from "./constants";

export interface ProcessedImage {
  file: File;
  preview: string;    // Object URL for display
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
}

export interface ProcessingError {
  type: "too_large" | "invalid_type" | "processing_failed";
  message: string;
}

/**
 * Process a list of image files:
 * - Validate size and type
 * - Resize to max dimension
 * - Convert to WebP
 * - Strip EXIF (by re-drawing on canvas)
 * - Return processed File objects with previews
 */
export async function processImages(
  files: File[]
): Promise<{ results: ProcessedImage[]; errors: ProcessingError[] }> {
  const results: ProcessedImage[] = [];
  const errors: ProcessingError[] = [];

  for (const file of files) {
    // ── Validate file type ─────────────────────────────────────────────────
    if (!file.type.startsWith("image/")) {
      errors.push({ type: "invalid_type", message: `${file.name}: Not an image file` });
      continue;
    }

    // ── Validate file size ─────────────────────────────────────────────────
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      errors.push({
        type: "too_large",
        message: `${file.name}: File size exceeds 20MB limit`,
      });
      continue;
    }

    try {
      const processed = await processImage(file);
      results.push(processed);
    } catch {
      errors.push({
        type: "processing_failed",
        message: `${file.name}: Failed to process image`,
      });
    }
  }

  return { results, errors };
}

/**
 * Process a single image file
 */
async function processImage(file: File): Promise<ProcessedImage> {
  const originalSize = file.size;

  // ── Load image ─────────────────────────────────────────────────────────────
  const imageBitmap = await createImageBitmap(file);
  const { width: origW, height: origH } = imageBitmap;

  // ── Calculate new dimensions ───────────────────────────────────────────────
  let width = origW;
  let height = origH;

  if (origW > IMAGE_MAX_DIMENSION || origH > IMAGE_MAX_DIMENSION) {
    const ratio = Math.min(IMAGE_MAX_DIMENSION / origW, IMAGE_MAX_DIMENSION / origH);
    width = Math.round(origW * ratio);
    height = Math.round(origH * ratio);
  }

  // ── Draw on canvas (strips EXIF) ───────────────────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  // ── Convert to WebP Blob ───────────────────────────────────────────────────
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Canvas to blob failed"));
      },
      "image/webp",
      IMAGE_QUALITY
    );
  });

  const processedFile = new File(
    [blob],
    file.name.replace(/\.[^.]+$/, ".webp"),
    { type: "image/webp" }
  );

  const preview = URL.createObjectURL(blob);

  return {
    file: processedFile,
    preview,
    width,
    height,
    originalSize,
    processedSize: blob.size,
    compressionRatio: Math.round((1 - blob.size / originalSize) * 100),
  };
}

/**
 * Revoke all preview URLs to free memory
 */
export function revokeImagePreviews(images: ProcessedImage[]): void {
  images.forEach((img) => URL.revokeObjectURL(img.preview));
}

/**
 * Create a preview URL for a file (raw, no processing)
 */
export function createPreview(file: File): string {
  return URL.createObjectURL(file);
}
