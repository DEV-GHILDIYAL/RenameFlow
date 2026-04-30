/** Represents an uploaded image file with its metadata and column values */
export interface ImageFile {
  /** Unique identifier for this image entry */
  id: string;
  /** Original File object from the upload */
  file: File;
  /** Object URL for previewing the image */
  previewUrl: string;
  /** Original filename from the user's filesystem */
  originalName: string;
  /** Key-value pairs mapping column IDs to user-entered values */
  columnValues: Record<string, string>;
  /** The computed SEO-friendly result filename */
  resultFilename: string;
}

/** Represents a custom naming column */
export interface NamingColumn {
  /** Unique identifier */
  id: string;
  /** Display name shown in the table header */
  name: string;
}

/** Processing status for the bulk rename operation */
export interface ProcessingState {
  /** Whether processing is currently active */
  isProcessing: boolean;
  /** Number of files completed */
  completed: number;
  /** Total number of files to process */
  total: number;
  /** Current status message */
  message: string;
}
