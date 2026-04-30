import React, { useCallback, useRef, useState } from 'react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  fileCount: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml'];

const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, fileCount }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filterImageFiles = useCallback((fileList: FileList | null): File[] => {
    if (!fileList) return [];
    return Array.from(fileList).filter(
      (f) => ACCEPTED_TYPES.includes(f.type) || f.type.startsWith('image/')
    );
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = filterImageFiles(e.dataTransfer.files);
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected, filterImageFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = filterImageFiles(e.target.files);
      if (files.length > 0) onFilesSelected(files);
      // Reset input so re-selecting same files triggers change
      if (inputRef.current) inputRef.current.value = '';
    },
    [onFilesSelected, filterImageFiles]
  );

  return (
    <div
      id="drop-zone"
      className={`drop-zone p-10 text-center animate-fade-in-up ${isDragOver ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
        id="file-input"
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Upload Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <div>
          <p className="text-lg font-semibold text-[var(--rf-text-primary)] mb-1">
            {isDragOver ? 'Drop images here' : 'Drag & drop images here'}
          </p>
          <p className="text-sm text-[var(--rf-text-muted)]">
            or <span className="text-indigo-400 font-medium cursor-pointer hover:text-indigo-300 transition-colors">browse files</span> — supports JPG, PNG, GIF, BMP, TIFF, SVG, WEBP
          </p>
        </div>

        {fileCount > 0 && (
          <div className="badge badge-accent mt-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            {fileCount} image{fileCount !== 1 ? 's' : ''} loaded — drop more to add
          </div>
        )}
      </div>
    </div>
  );
};

export default DropZone;
