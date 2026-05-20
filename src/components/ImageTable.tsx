import React, { useCallback, useMemo, useState } from 'react';
import type { ImageFile, NamingColumn } from '../types';
import { formatFileSize } from '../utils';
import PreviewModal from './PreviewModal';

interface ImageTableProps {
  images: ImageFile[];
  columns: NamingColumn[];
  onUpdateColumnValue: (imageId: string, columnId: string, value: string) => void;
  onRemoveImage: (imageId: string) => void;
  onBulkFillColumn: (columnId: string, value: string) => void;
}

const ImageTable: React.FC<ImageTableProps> = ({
  images,
  columns,
  onUpdateColumnValue,
  onRemoveImage,
  onBulkFillColumn,
}) => {
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null);

  // Memoize rendered rows for performance with 100+ images
  const rows = useMemo(() => images, [images]);

  const handleBulkFill = useCallback(
    (columnId: string) => {
      const value = prompt('Enter value to fill all rows:');
      if (value !== null) {
        onBulkFillColumn(columnId, value);
      }
    },
    [onBulkFillColumn]
  );

  const handleClosePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  if (images.length === 0) return null;

  return (
    <div
      id="image-table-container"
      className="glass-card overflow-hidden animate-fade-in-up"
      style={{ animationDelay: '0.2s' }}
    >
      {/* Table Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--rf-border)]">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[var(--rf-text-secondary)] uppercase tracking-wider">
            Image Queue
          </h2>
          <span className="badge badge-accent text-xs">
            {images.length} file{images.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-xs text-[var(--rf-text-muted)]">
          Total: {formatFileSize(images.reduce((sum, img) => sum + img.file.size, 0))}
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table className="rf-table">
          <thead>
            <tr>
              <th className="w-16">#</th>
              <th className="w-16">Preview</th>
              <th className="min-w-[180px]">Original Name</th>
              {columns.map((col) => (
                <th key={col.id} className="min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <span>{col.name}</span>
                    <button
                      className="btn-icon !p-0.5 opacity-60 hover:opacity-100"
                      onClick={() => handleBulkFill(col.id)}
                      title={`Fill all rows for "${col.name}"`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    </button>
                  </div>
                </th>
              ))}
              <th className="min-w-[220px]">Result Filename</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((img, idx) => (
              <ImageRow
                key={img.id}
                image={img}
                index={idx}
                columns={columns}
                onUpdateColumnValue={onUpdateColumnValue}
                onRemoveImage={onRemoveImage}
                onPreviewImage={setPreviewImage}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Large Image Preview Modal */}
      <PreviewModal image={previewImage} onClose={handleClosePreview} />
    </div>
  );
};

/* ===== Individual Row ===== */
interface ImageRowProps {
  image: ImageFile;
  index: number;
  columns: NamingColumn[];
  onUpdateColumnValue: (imageId: string, columnId: string, value: string) => void;
  onRemoveImage: (imageId: string) => void;
  onPreviewImage: (image: ImageFile) => void;
}

const ImageRow: React.FC<ImageRowProps> = React.memo(
  ({ image, index, columns, onUpdateColumnValue, onRemoveImage, onPreviewImage }) => {
    return (
      <tr id={`row-${image.id}`}>
        <td className="text-[var(--rf-text-muted)] text-sm font-mono select-none">
          {index + 1}
        </td>
        <td>
          <div
            className="relative group w-12 h-12 cursor-pointer rounded-lg overflow-hidden border border-[var(--rf-border)] hover:border-[var(--rf-accent)] hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-200"
            onClick={() => onPreviewImage(image)}
            title="Click to view large preview"
            id={`thumbnail-${image.id}`}
          >
            <img
              src={image.previewUrl}
              alt={image.originalName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Interactive hover overlay with search icon */}
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg className="w-4 h-4 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </div>
        </td>
        <td>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[var(--rf-text-primary)] truncate max-w-[200px]" title={image.originalName}>
              {image.originalName}
            </span>
            <span className="text-xs text-[var(--rf-text-muted)]">
              {formatFileSize(image.file.size)}
            </span>
          </div>
        </td>
        {columns.map((col) => (
          <td key={col.id}>
            <input
              className="rf-input"
              placeholder={col.name}
              value={image.columnValues[col.id] || ''}
              onChange={(e) =>
                onUpdateColumnValue(image.id, col.id, e.target.value)
              }
              id={`cell-${image.id}-${col.id}`}
            />
          </td>
        ))}
        <td>
          {image.resultFilename ? (
            <span className="result-filename">{image.resultFilename}</span>
          ) : (
            <span className="text-[var(--rf-text-muted)] text-sm italic">
              Enter values to generate…
            </span>
          )}
        </td>
        <td>
          <button
            className="btn-icon"
            onClick={() => onRemoveImage(image.id)}
            title="Remove image"
            id={`remove-${image.id}`}
          >
            <svg
              className="w-4 h-4 text-[var(--rf-text-muted)] hover:text-[var(--rf-danger)] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </td>
      </tr>
    );
  }
);

ImageRow.displayName = 'ImageRow';

export default ImageTable;
