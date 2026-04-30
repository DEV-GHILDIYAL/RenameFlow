import React from 'react';
import type { ProcessingState } from '../types';

interface ProcessingBarProps {
  state: ProcessingState;
}

const ProcessingBar: React.FC<ProcessingBarProps> = ({ state }) => {
  if (!state.isProcessing && state.completed === 0) return null;

  const progress =
    state.total > 0 ? Math.round((state.completed / state.total) * 100) : 0;
  const isDone = !state.isProcessing && state.completed === state.total && state.total > 0;

  return (
    <div
      id="processing-bar"
      className="glass-card p-5 animate-fade-in-up"
      style={{ animationDelay: '0.15s' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {state.isProcessing && (
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          )}
          {isDone && (
            <div className="w-5 h-5 rounded-full bg-[var(--rf-success)] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <span className="text-sm font-medium text-[var(--rf-text-primary)]">
            {state.message}
          </span>
        </div>
        <span className="text-sm font-mono text-[var(--rf-text-secondary)]">
          {state.completed}/{state.total} — {progress}%
        </span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${progress}%`,
            ...(isDone && {
              background: 'var(--rf-success)',
              animation: 'none',
            }),
          }}
        />
      </div>
    </div>
  );
};

export default ProcessingBar;
