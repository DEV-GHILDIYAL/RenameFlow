/**
 * Generates an SEO-friendly filename from an array of field values.
 *
 * Rules applied in order:
 * 1. Convert to lowercase
 * 2. Replace & with "and"
 * 3. Replace spaces with hyphens
 * 4. Remove special characters (keep only alphanumeric and hyphens)
 * 5. Collapse duplicate hyphens
 * 6. Trim leading/trailing hyphens
 * 7. Skip empty fields
 * 8. Append .webp extension
 */
export function generateFilename(values: string[]): string {
  const parts = values
    .map((v) => v.trim())
    .filter((v) => v.length > 0) // Rule 7: skip empty fields
    .map((v) => {
      let s = v.toLowerCase(); // Rule 1
      s = s.replace(/&/g, 'and'); // Rule 2
      s = s.replace(/\s+/g, '-'); // Rule 3
      s = s.replace(/[^a-z0-9-]/g, ''); // Rule 4
      s = s.replace(/-{2,}/g, '-'); // Rule 5
      s = s.replace(/^-+|-+$/g, ''); // Rule 6
      return s;
    })
    .filter((v) => v.length > 0);

  if (parts.length === 0) return '';

  let combined = parts.join('-');
  combined = combined.replace(/-{2,}/g, '-'); // Clean up join artifacts
  combined = combined.replace(/^-+|-+$/g, '');

  return combined + '.webp'; // Rule 8
}

/**
 * Given a filename and a set of already-used filenames,
 * returns a unique filename by appending -2, -3, etc.
 */
export function deduplicateFilename(
  filename: string,
  usedNames: Set<string>
): string {
  if (!usedNames.has(filename)) {
    return filename;
  }

  const baseName = filename.replace(/\.webp$/, '');
  let counter = 2;

  while (usedNames.has(`${baseName}-${counter}.webp`)) {
    counter++;
  }

  return `${baseName}-${counter}.webp`;
}

/**
 * Generate a short unique ID for internal tracking.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Convert an image File to WEBP format using the Canvas API.
 * Returns a Blob of the WEBP image.
 */
export function convertToWebp(file: File, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob returned null'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
