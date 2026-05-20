import React, { useEffect, useState } from 'react';
import type { ImageFile } from '../types';
import { formatFileSize } from '../utils';

interface PreviewModalProps {
  image: ImageFile | null;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ image, onClose }) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [image, onClose]);

  if (!image) return null;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
      id="preview-modal-backdrop"
    >
      <div
        className="relative glass-card max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in border border-[var(--rf-border)] bg-[var(--rf-bg-card)]/90 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        id="preview-modal-content"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--rf-border)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[var(--rf-text-secondary)] uppercase tracking-wider">
              File Preview
            </span>
            <h3 className="text-base font-semibold text-[var(--rf-text-primary)] truncate max-w-[500px]" title={image.originalName}>
              {image.originalName}
            </h3>
          </div>
          <button
            className="btn-icon !p-1.5 rounded-lg text-[var(--rf-text-muted)] hover:text-[var(--rf-text-primary)] hover:bg-[var(--rf-bg-elevated)] transition-all cursor-pointer"
            onClick={onClose}
            aria-label="Close preview"
            id="close-preview-btn"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body (Image view) */}
        <div className="flex-1 flex items-center justify-center p-6 bg-black/35 overflow-y-auto min-h-[300px]">
          <img
            src={image.previewUrl}
            alt={image.originalName}
            onLoad={handleImageLoad}
            className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-xl border border-[var(--rf-border)]/50 transition-transform duration-300"
          />
        </div>

        {/* Modal Footer / Metadata */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--rf-border)] bg-[var(--rf-bg-secondary)]/50">
          <div className="flex items-center gap-5 text-xs text-[var(--rf-text-secondary)]">
            <div className="flex flex-col">
              <span className="text-[var(--rf-text-muted)] font-medium">File Size</span>
              <span className="font-mono mt-0.5 text-[var(--rf-text-primary)]">
                {formatFileSize(image.file.size)}
              </span>
            </div>
            {dimensions && (
              <div className="flex flex-col">
                <span className="text-[var(--rf-text-muted)] font-medium">Dimensions</span>
                <span className="font-mono mt-0.5 text-[var(--rf-text-primary)]">
                  {dimensions.width} × {dimensions.height} px
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[var(--rf-text-muted)] font-medium">File Format</span>
              <span className="font-mono mt-0.5 uppercase text-[var(--rf-text-primary)]">
                {image.file.type.split('/')[1] || 'Unknown'}
              </span>
            </div>
          </div>

          {image.resultFilename && (
            <div className="flex flex-col items-end">
              <span className="text-right text-[var(--rf-text-muted)] text-[10px] font-medium uppercase tracking-wider">
                Target Name
              </span>
              <span className="result-filename font-mono text-xs mt-0.5">
                {image.resultFilename}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
