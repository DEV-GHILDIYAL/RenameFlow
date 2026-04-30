import React from 'react';

interface ActionBarProps {
  imageCount: number;
  hasColumns: boolean;
  isProcessing: boolean;
  isDone: boolean;
  onApplyRename: () => void;
  onDownloadZip: () => void;
  onClearAll: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  imageCount,
  hasColumns,
  isProcessing,
  isDone,
  onApplyRename,
  onDownloadZip,
  onClearAll,
}) => {
  if (imageCount === 0) return null;

  const canProcess = imageCount > 0 && hasColumns && !isProcessing;

  return (
    <div
      id="action-bar"
      className="glass-card p-5 animate-fade-in-up flex flex-wrap items-center justify-between gap-4"
      style={{ animationDelay: '0.25s' }}
    >
      <div className="flex items-center gap-3">
        <button
          className="btn-primary flex items-center gap-2"
          onClick={onApplyRename}
          disabled={!canProcess}
          id="apply-rename-btn"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Apply Rename & Convert
        </button>

        {isDone && (
          <button
            className="btn-primary flex items-center gap-2 !from-emerald-500 !to-green-600"
            onClick={onDownloadZip}
            id="download-zip-btn"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download ZIP
          </button>
        )}
      </div>

      <button
        className="btn-danger flex items-center gap-2"
        onClick={onClearAll}
        disabled={isProcessing}
        id="clear-all-btn"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear All
      </button>
    </div>
  );
};

export default ActionBar;
