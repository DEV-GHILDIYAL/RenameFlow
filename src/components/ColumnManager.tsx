import React, { useState, useRef, useEffect } from 'react';
import type { NamingColumn } from '../types';

interface ColumnManagerProps {
  columns: NamingColumn[];
  onAddColumn: (name: string) => void;
  onRemoveColumn: (id: string) => void;
  onRenameColumn: (id: string, newName: string) => void;
  sameClientName: boolean;
  onToggleSameClientName: (enabled: boolean) => void;
}

const ColumnManager: React.FC<ColumnManagerProps> = ({
  columns,
  onAddColumn,
  onRemoveColumn,
  onRenameColumn,
  sameClientName,
  onToggleSameClientName,
}) => {
  const [newColumnName, setNewColumnName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleAdd = () => {
    const name = newColumnName.trim();
    if (name) {
      onAddColumn(name);
      setNewColumnName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const startEdit = (col: NamingColumn) => {
    setEditingId(col.id);
    setEditValue(col.name);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      onRenameColumn(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div id="column-manager" className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--rf-text-secondary)] uppercase tracking-wider">
          Naming Columns
        </h2>
        <span className="badge badge-accent text-xs">{columns.length} column{columns.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Existing columns */}
      <div className="flex flex-wrap gap-2 mb-4">
        {columns.map((col, idx) => (
          <div
            key={col.id}
            className="group flex items-center gap-2 bg-[var(--rf-bg-elevated)] border border-[var(--rf-border)] rounded-lg px-3 py-2 transition-all hover:border-[var(--rf-border-hover)] animate-slide-in"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {editingId === col.id ? (
              <input
                ref={editInputRef}
                className="rf-input !p-1 !text-sm !w-28"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <span
                className="text-sm font-medium text-[var(--rf-text-primary)] cursor-pointer"
                onDoubleClick={() => startEdit(col)}
                title="Double-click to rename"
              >
                {col.name}
              </span>
            )}
            <button
              className="btn-icon !p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemoveColumn(col.id)}
              title="Remove column"
              id={`remove-col-${col.id}`}
            >
              <svg className="w-3.5 h-3.5 text-[var(--rf-danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Sync Client Name Toggle */}
      <div className="flex items-center gap-3 mb-4 bg-[var(--rf-bg-secondary)] border border-[var(--rf-border)] rounded-xl p-3 transition-colors hover:border-[var(--rf-border-hover)]">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={sameClientName}
              onChange={(e) => onToggleSameClientName(e.target.checked)}
              id="same-client-toggle"
            />
            <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${sameClientName ? 'bg-[var(--rf-accent)]' : 'bg-[var(--rf-bg-elevated)] border border-[var(--rf-border)]'}`} />
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${sameClientName ? 'transform translate-x-4' : ''}`} />
          </div>
          <span className="text-sm font-medium text-[var(--rf-text-primary)]">
            Use same Client Name for all files
          </span>
        </label>
        <span className="text-xs text-[var(--rf-text-muted)] italic">
          (Only editable on the first file)
        </span>
      </div>

      {/* Add new column */}
      <div className="flex gap-2">
        <input
          className="rf-input flex-1"
          placeholder="New column name (e.g., Page Name)"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          onKeyDown={handleKeyDown}
          id="new-column-input"
        />
        <button
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
          onClick={handleAdd}
          disabled={!newColumnName.trim()}
          id="add-column-btn"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Column
        </button>
      </div>

      {/* Quick presets */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[var(--rf-text-muted)]">Quick add:</span>
        {['Client Name', 'Page Name', 'Section Name', 'Image Type', 'Alt Text'].map((preset) => (
          <button
            key={preset}
            className="text-xs px-2.5 py-1 rounded-md border border-[var(--rf-border)] text-[var(--rf-text-muted)] hover:text-[var(--rf-text-primary)] hover:border-[var(--rf-border-hover)] hover:bg-[var(--rf-bg-elevated)] transition-all cursor-pointer"
            onClick={() => onAddColumn(preset)}
            id={`preset-${preset.toLowerCase().replace(/\s+/g, '-')}`}
          >
            + {preset}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColumnManager;
