import React, { useState } from 'react';
import { ColumnMetadata } from '../../types/dataset';
import { Type, Edit3, Trash2, Check, AlertCircle, ArrowRight } from 'lucide-react';

interface TextAndColumnCleaningProps {
  columns: ColumnMetadata[];
  onTextTransform: (
    columnName: string,
    transformType: 'trim' | 'lowercase' | 'uppercase' | 'titlecase' | 'collapse_spaces'
  ) => void;
  onRemoveColumn: (columnName: string) => void;
  onRenameColumn: (oldName: string, newName: string) => boolean;
  onShowPreview: (config: {
    title: string;
    description: string;
    affectedRowCount: number;
    previewColumn?: string;
    beforeSample: any[];
    afterSample: any[];
    confirmAction: () => void;
  }) => void;
  rowCount: number;
  className?: string;
}

export const TextAndColumnCleaning: React.FC<TextAndColumnCleaningProps> = ({
  columns,
  onTextTransform,
  onRemoveColumn,
  onRenameColumn,
  onShowPreview,
  rowCount,
  className = ''
}) => {
  // Text transform state
  const textColumns = columns.filter(c => c.type === 'Text' || c.type === 'Category');
  const [selectedTextCol, setSelectedTextCol] = useState<string>(textColumns[0]?.name ?? '');
  const [transformType, setTransformType] = useState<'trim' | 'lowercase' | 'uppercase' | 'titlecase' | 'collapse_spaces'>('trim');

  // Column management state
  const [colToRename, setColToRename] = useState<string>(columns[0]?.name ?? '');
  const [newColName, setNewColName] = useState<string>('');
  const [colToRemove, setColToRemove] = useState<string>(columns[0]?.name ?? '');
  const [renameError, setRenameError] = useState<string | null>(null);

  const handleApplyTextTransform = () => {
    if (!selectedTextCol) return;

    let sampleBefore = ['  North America  ', 'EMEA Region', '  apac '];
    let sampleAfter = ['North America', 'EMEA Region', 'apac'];

    if (transformType === 'lowercase') {
      sampleAfter = ['north america', 'emea region', 'apac'];
    } else if (transformType === 'uppercase') {
      sampleAfter = ['NORTH AMERICA', 'EMEA REGION', 'APAC'];
    } else if (transformType === 'titlecase') {
      sampleAfter = ['North America', 'Emea Region', 'Apac'];
    }

    onShowPreview({
      title: `Text Transformation on "${selectedTextCol}"`,
      description: `Apply ${transformType} normalization across all non-null text values.`,
      affectedRowCount: rowCount,
      previewColumn: selectedTextCol,
      beforeSample: sampleBefore,
      afterSample: sampleAfter,
      confirmAction: () => onTextTransform(selectedTextCol, transformType)
    });
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    setRenameError(null);
    if (!newColName.trim()) {
      setRenameError('Column name cannot be blank.');
      return;
    }
    const success = onRenameColumn(colToRename, newColName.trim());
    if (!success) {
      setRenameError(`A column named "${newColName.trim()}" already exists.`);
    } else {
      setNewColName('');
    }
  };

  const handleConfirmRemoveColumn = () => {
    onShowPreview({
      title: `Delete Column "${colToRemove}"`,
      description: `The column "${colToRemove}" will be completely removed from the cleaned analytical schema.`,
      affectedRowCount: rowCount,
      beforeSample: ['Value A', 'Value B'],
      afterSample: ['Removed', 'Removed'],
      confirmAction: () => onRemoveColumn(colToRemove)
    });
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/80 ${className}`}>
      <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
        <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Text Normalization & Schema Restructuring
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Clean strings, standardize capitalization, rename attributes, or drop unneeded columns
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Text Transformations */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              <Type className="h-4 w-4 text-indigo-500" />
              <span>Text Field Transformations</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Standardize casing or trim accidental whitespace entries.
            </p>

            {textColumns.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Target Column</label>
                  <select
                    value={selectedTextCol}
                    onChange={(e) => setSelectedTextCol(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    {textColumns.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Transformation</label>
                  <select
                    value={transformType}
                    onChange={(e: any) => setTransformType(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    <option value="trim">Trim Leading & Trailing Whitespace ("  val  " → "val")</option>
                    <option value="titlecase">Title Case ("north america" → "North America")</option>
                    <option value="lowercase">Convert to lowercase ("North" → "north")</option>
                    <option value="uppercase">Convert to UPPERCASE ("North" → "NORTH")</option>
                    <option value="collapse_spaces">Collapse Multiple Spaces ("a   b" → "a b")</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No text or categorical columns in dataset.</p>
            )}
          </div>

          <button
            onClick={handleApplyTextTransform}
            disabled={!selectedTextCol}
            className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-40"
          >
            <span>Apply Text Normalization</span>
          </button>
        </div>

        {/* Column Rename and Drop */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              <Edit3 className="h-4 w-4 text-indigo-500" />
              <span>Column Management</span>
            </div>

            {/* Rename Form */}
            <form onSubmit={handleRename} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Rename Attribute</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <select
                    value={colToRename}
                    onChange={(e) => setColToRename(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  >
                    {columns.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="New Column Name"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans"
                  />
                </div>
              </div>

              {renameError && (
                <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                  {renameError}
                </div>
              )}

              <button
                type="submit"
                disabled={!newColName.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-40"
              >
                <span>Rename Column</span>
              </button>
            </form>

            {/* Drop Column Section */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Drop Column from Schema</label>
              <div className="mt-1 flex items-center gap-2">
                <select
                  value={colToRemove}
                  onChange={(e) => setColToRemove(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  {columns.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleConfirmRemoveColumn}
                  className="inline-flex items-center gap-1 rounded bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Drop</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
