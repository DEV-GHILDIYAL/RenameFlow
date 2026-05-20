import { useState, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ImageFile, NamingColumn, ProcessingState } from './types';
import {
  generateFilename,
  deduplicateFilename,
  generateId,
  convertToWebp,
} from './utils';
import Header from './components/Header';
import DropZone from './components/DropZone';
import ColumnManager from './components/ColumnManager';
import ImageTable from './components/ImageTable';
import ActionBar from './components/ActionBar';
import ProcessingBar from './components/ProcessingBar';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [columns, setColumns] = useState<NamingColumn[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    completed: 0,
    total: 0,
    message: '',
  });

  // Store converted blobs for ZIP download
  const convertedBlobsRef = useRef<Map<string, { blob: Blob; filename: string }>>(
    new Map()
  );

  // ===== Compute result filenames reactively =====
  const computeResultFilenames = useCallback(
    (imgs: ImageFile[], cols: NamingColumn[]): ImageFile[] => {
      const usedNames = new Set<string>();

      return imgs.map((img) => {
        const values = cols.map((col) => img.columnValues[col.id] || '');
        const rawFilename = generateFilename(values);

        if (!rawFilename) {
          return { ...img, resultFilename: '' };
        }

        const uniqueFilename = deduplicateFilename(rawFilename, usedNames);
        usedNames.add(uniqueFilename);

        return { ...img, resultFilename: uniqueFilename };
      });
    },
    []
  );

  // ===== File Upload =====
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const newImages: ImageFile[] = files.map((file) => ({
        id: generateId(),
        file,
        previewUrl: URL.createObjectURL(file),
        originalName: file.name,
        columnValues: {},
        resultFilename: '',
      }));

      setImages((prev) => {
        const merged = [...prev, ...newImages];
        return computeResultFilenames(merged, columns);
      });
    },
    [columns, computeResultFilenames]
  );

  // ===== Column Management =====
  const handleAddColumn = useCallback(
    (name: string) => {
      const newCol: NamingColumn = { id: generateId(), name };
      setColumns((prev) => {
        const updated = [...prev, newCol];
        // Recompute filenames with new column set
        setImages((imgs) => computeResultFilenames(imgs, updated));
        return updated;
      });
    },
    [computeResultFilenames]
  );

  const handleRemoveColumn = useCallback(
    (id: string) => {
      setColumns((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        setImages((imgs) => {
          // Clean column values and recompute
          const cleaned = imgs.map((img) => {
            const newVals = { ...img.columnValues };
            delete newVals[id];
            return { ...img, columnValues: newVals };
          });
          return computeResultFilenames(cleaned, updated);
        });
        return updated;
      });
    },
    [computeResultFilenames]
  );

  const handleRenameColumn = useCallback((id: string, newName: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  }, []);

  // ===== Cell Editing =====
  const handleUpdateColumnValue = useCallback(
    (imageId: string, columnId: string, value: string) => {
      setImages((prev) => {
        const updated = prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                columnValues: { ...img.columnValues, [columnId]: value },
              }
            : img
        );
        return computeResultFilenames(updated, columns);
      });
    },
    [columns, computeResultFilenames]
  );

  const handleBulkFillColumn = useCallback(
    (columnId: string, value: string) => {
      setImages((prev) => {
        const updated = prev.map((img) => ({
          ...img,
          columnValues: { ...img.columnValues, [columnId]: value },
        }));
        return computeResultFilenames(updated, columns);
      });
    },
    [columns, computeResultFilenames]
  );

  // ===== Remove Image =====
  const handleRemoveImage = useCallback(
    (imageId: string) => {
      setImages((prev) => {
        const target = prev.find((img) => img.id === imageId);
        if (target) URL.revokeObjectURL(target.previewUrl);
        const filtered = prev.filter((img) => img.id !== imageId);
        return computeResultFilenames(filtered, columns);
      });
      convertedBlobsRef.current.delete(imageId);
    },
    [columns, computeResultFilenames]
  );

  // ===== Clear All =====
  const handleClearAll = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setProcessing({ isProcessing: false, completed: 0, total: 0, message: '' });
    convertedBlobsRef.current.clear();
  }, [images]);

  // ===== Apply Rename & Convert =====
  const handleApplyRename = useCallback(async () => {
    const toProcess = images.filter((img) => img.resultFilename);
    if (toProcess.length === 0) return;

    setProcessing({
      isProcessing: true,
      completed: 0,
      total: toProcess.length,
      message: 'Converting images to WEBP…',
    });
    convertedBlobsRef.current.clear();

    // Process in batches to avoid overwhelming the browser
    const BATCH_SIZE = 5;
    let completed = 0;

    for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
      const batch = toProcess.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (img) => {
          try {
            const blob = await convertToWebp(img.file);
            convertedBlobsRef.current.set(img.id, {
              blob,
              filename: img.resultFilename,
            });
          } catch (err) {
            console.error(`Failed to convert ${img.originalName}:`, err);
            // Still count as completed even on failure
          }
          completed++;
          setProcessing((prev) => ({
            ...prev,
            completed,
            message: `Converting images to WEBP… (${completed}/${toProcess.length})`,
          }));
        })
      );
    }

    setProcessing({
      isProcessing: false,
      completed: toProcess.length,
      total: toProcess.length,
      message: 'All images converted! Ready to download.',
    });
  }, [images]);

  // ===== Download ZIP =====
  const handleDownloadZip = useCallback(async () => {
    const zip = new JSZip();
    const blobs = convertedBlobsRef.current;

    if (blobs.size === 0) return;

    setProcessing((prev) => ({
      ...prev,
      isProcessing: true,
      message: 'Creating ZIP archive…',
    }));

    blobs.forEach(({ blob, filename }) => {
      zip.file(filename, blob);
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'renameflow-images.zip');
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    }

    setProcessing((prev) => ({
      ...prev,
      isProcessing: false,
      message: 'ZIP downloaded successfully!',
    }));
  }, []);

  const isDone =
    !processing.isProcessing &&
    processing.completed > 0 &&
    processing.completed === processing.total;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12">
        <div className="flex flex-col gap-5">
          {/* Drop Zone */}
          <DropZone
            onFilesSelected={handleFilesSelected}
            fileCount={images.length}
          />

          {/* Column Manager */}
          {images.length > 0 && (
            <ColumnManager
              columns={columns}
              onAddColumn={handleAddColumn}
              onRemoveColumn={handleRemoveColumn}
              onRenameColumn={handleRenameColumn}
            />
          )}

          {/* Image Table */}
          <ImageTable
            images={images}
            columns={columns}
            onUpdateColumnValue={handleUpdateColumnValue}
            onRemoveImage={handleRemoveImage}
            onBulkFillColumn={handleBulkFillColumn}
          />

          {/* Processing Bar */}
          <ProcessingBar state={processing} />

          {/* Action Bar */}
          <ActionBar
            imageCount={images.length}
            hasColumns={columns.length > 0}
            isProcessing={processing.isProcessing}
            isDone={isDone}
            onApplyRename={handleApplyRename}
            onDownloadZip={handleDownloadZip}
            onClearAll={handleClearAll}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--rf-border)] mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--rf-text-muted)] text-center sm:text-left">
            RenameFlow — Fully client-side. No data leaves your browser.
          </p>
          <p className="text-xs text-[var(--rf-text-secondary)] font-medium text-center sm:text-right flex items-center gap-1.5">
            <span>Developed by</span>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-bold tracking-wide uppercase">
              DEV GHILDIYAL
            </span>
            <span className="text-[var(--rf-text-muted)]">| Built with React & Tailwind</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
