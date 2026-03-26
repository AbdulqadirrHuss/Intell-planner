import React, { useState, useMemo } from 'react';
import { TrackerBucket, Category, Task } from './types';

// ────────────────────────────────────────────────────────────────────────
// Icons
// ────────────────────────────────────────────────────────────────────────
const ChevronDownIcon = ({ className = '' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);
const PlusIcon = ({ className = '' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const XIcon = ({ className = '' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const TrashIcon = ({ className = '' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const PencilIcon = ({ className = '' }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
);

// ────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────
interface Props {
    buckets: TrackerBucket[];
    categories: Category[];
    tasks: Task[];
    onAddBucket: (name: string, mode: 'daily' | 'independent', color: string) => void;
    onUpdateBucket: (id: string, updates: Partial<TrackerBucket>) => void;
    onDeleteBucket: (id: string) => void;
    onToggleCollapsed: (id: string) => void;
    onAddCategoryToBucket: (bucketId: string, categoryId: string) => void;
    onRemoveCategoryFromBucket: (bucketId: string, categoryId: string) => void;
}

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────
function calcBucketProgress(bucket: TrackerBucket, tasks: Task[]): { completed: number; total: number; pct: number } {
    const relevant = tasks.filter(t => bucket.categoryIds.includes(t.categoryId));
    let total = 0, completed = 0;
    relevant.forEach(t => {
        if (t.subtasks && t.subtasks.length > 0) {
            total += t.subtasks.length;
            completed += t.subtasks.filter(st => st.completed).length;
        } else {
            total += 1;
            if (t.completed) completed += 1;
        }
    });
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, pct };
}

const PALETTE = [
    '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316',
];

// ────────────────────────────────────────────────────────────────────────
// New Bucket Form (inline)
// ────────────────────────────────────────────────────────────────────────
function NewBucketForm({ onAdd, onCancel }: { onAdd: (name: string, mode: 'daily' | 'independent', color: string) => void; onCancel: () => void }) {
    const [name, setName] = useState('');
    const [mode, setMode] = useState<'daily' | 'independent'>('daily');
    const [color, setColor] = useState(PALETTE[0]);

    const submit = () => {
        if (!name.trim()) return;
        onAdd(name.trim(), mode, color);
    };

    return (
        <div className="bucket-new-form">
            <input
                autoFocus
                className="bucket-new-input"
                placeholder="Bucket name…"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
            />
            <div className="bucket-new-row">
                <div className="bucket-mode-tabs">
                    <button
                        className={`bucket-mode-tab ${mode === 'daily' ? 'active' : ''}`}
                        onClick={() => setMode('daily')}
                    ># Daily %</button>
                    <button
                        className={`bucket-mode-tab ${mode === 'independent' ? 'active' : ''}`}
                        onClick={() => setMode('independent')}
                    >⊞ Independent</button>
                </div>
                <div className="bucket-palette">
                    {PALETTE.map(c => (
                        <button
                            key={c}
                            className={`bucket-swatch ${color === c ? 'selected' : ''}`}
                            style={{ background: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>
            </div>
            <div className="bucket-new-actions">
                <button className="bucket-btn-cancel" onClick={onCancel}>Cancel</button>
                <button className="bucket-btn-create" onClick={submit} disabled={!name.trim()}>Create Bucket</button>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Single Bucket Card
// ────────────────────────────────────────────────────────────────────────
function BucketCard({
    bucket,
    categories,
    tasks,
    onUpdate,
    onDelete,
    onToggleCollapsed,
    onAddCategory,
    onRemoveCategory,
}: {
    bucket: TrackerBucket;
    categories: Category[];
    tasks: Task[];
    onUpdate: (updates: Partial<TrackerBucket>) => void;
    onDelete: () => void;
    onToggleCollapsed: () => void;
    onAddCategory: (catId: string) => void;
    onRemoveCategory: (catId: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(bucket.name);
    const [showCatPicker, setShowCatPicker] = useState(false);

    const progress = useMemo(() => calcBucketProgress(bucket, tasks), [bucket, tasks]);
    const bucketCategories = categories.filter(c => bucket.categoryIds.includes(c.id));
    const availableToAdd = categories.filter(c => !bucket.categoryIds.includes(c.id));

    const saveEdit = () => {
        if (editName.trim()) onUpdate({ name: editName.trim() });
        setIsEditing(false);
    };

    const getColor = (pct: number) => {
        if (pct >= 80) return '#10b981';
        if (pct >= 50) return '#f59e0b';
        return '#6366f1';
    };

    const barColor = getColor(progress.pct);

    return (
        <div className="bucket-card" style={{ '--bucket-color': bucket.color } as React.CSSProperties}>
            {/* ── Header ── */}
            <div className="bucket-header" onClick={onToggleCollapsed}>
                <div className="bucket-header-left">
                    <span className="bucket-dot" style={{ background: bucket.color }} />
                    {isEditing ? (
                        <input
                            autoFocus
                            className="bucket-edit-input"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditName(bucket.name); setIsEditing(false); } }}
                            onClick={e => e.stopPropagation()}
                        />
                    ) : (
                        <span className="bucket-name">{bucket.name}</span>
                    )}
                    <span className={`bucket-mode-badge ${bucket.mode}`}>
                        {bucket.mode === 'daily' ? '# Daily' : '⊞ Independent'}
                    </span>
                </div>
                <div className="bucket-header-right">
                    <span className="bucket-pct" style={{ color: barColor }}>{progress.pct}%</span>
                    <button className="bucket-icon-btn" onClick={e => { e.stopPropagation(); setIsEditing(true); setEditName(bucket.name); }} title="Rename">
                        <PencilIcon className="w-3 h-3" />
                    </button>
                    <button className="bucket-icon-btn danger" onClick={e => { e.stopPropagation(); if (confirm(`Delete "${bucket.name}"?`)) onDelete(); }} title="Delete">
                        <TrashIcon className="w-3 h-3" />
                    </button>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${bucket.collapsed ? '' : 'rotate-180'}`} />
                </div>
            </div>

            {/* ── Mini progress bar (always visible) ── */}
            <div className="bucket-bar-track">
                <div
                    className="bucket-bar-fill"
                    style={{ width: `${progress.pct}%`, background: barColor }}
                />
            </div>

            {/* ── Expanded body ── */}
            {!bucket.collapsed && (
                <div className="bucket-body">
                    {/* Mode toggle */}
                    <div className="bucket-mode-row">
                        <span className="bucket-label">Mode:</span>
                        <div className="bucket-mode-tabs small">
                            <button
                                className={`bucket-mode-tab ${bucket.mode === 'daily' ? 'active' : ''}`}
                                onClick={() => onUpdate({ mode: 'daily' })}
                            ># Daily %</button>
                            <button
                                className={`bucket-mode-tab ${bucket.mode === 'independent' ? 'active' : ''}`}
                                onClick={() => onUpdate({ mode: 'independent' })}
                            >⊞ Independent</button>
                        </div>
                    </div>

                    {/* Color swatches */}
                    <div className="bucket-color-row">
                        <span className="bucket-label">Color:</span>
                        <div className="bucket-palette">
                            {PALETTE.map(c => (
                                <button
                                    key={c}
                                    className={`bucket-swatch ${bucket.color === c ? 'selected' : ''}`}
                                    style={{ background: c }}
                                    onClick={() => onUpdate({ color: c })}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Category list */}
                    <div className="bucket-cats">
                        <div className="bucket-cats-header">
                            <span className="bucket-label">Categories</span>
                            {availableToAdd.length > 0 && (
                                <button className="bucket-add-cat-btn" onClick={() => setShowCatPicker(v => !v)}>
                                    <PlusIcon className="w-3 h-3" />Add
                                </button>
                            )}
                        </div>

                        {showCatPicker && availableToAdd.length > 0 && (
                            <div className="bucket-cat-picker">
                                {availableToAdd.map(c => (
                                    <button key={c.id} className="bucket-cat-pick-item" onClick={() => { onAddCategory(c.id); setShowCatPicker(false); }}>
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color, display: 'inline-block' }} />
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {bucketCategories.length === 0 ? (
                            <p className="bucket-empty-cats">No categories added yet. Click "+ Add" to assign some.</p>
                        ) : (
                            <div className="bucket-cat-rows">
                                {bucketCategories.map(cat => {
                                    const catTasks = tasks.filter(t => t.categoryId === cat.id);
                                    let catTotal = 0, catDone = 0;
                                    catTasks.forEach(t => {
                                        if (t.subtasks && t.subtasks.length > 0) {
                                            catTotal += t.subtasks.length;
                                            catDone += t.subtasks.filter(st => st.completed).length;
                                        } else { catTotal += 1; if (t.completed) catDone += 1; }
                                    });
                                    const catPct = catTotal === 0 ? 0 : Math.round((catDone / catTotal) * 100);
                                    return (
                                        <div key={cat.id} className="bucket-cat-row">
                                            <span className="bucket-cat-dot" style={{ background: cat.color }} />
                                            <span className="bucket-cat-name">{cat.name}</span>
                                            <div className="bucket-cat-bar-track">
                                                <div className="bucket-cat-bar-fill" style={{ width: `${catPct}%`, background: cat.color + 'cc' }} />
                                            </div>
                                            <span className="bucket-cat-stat">{catDone}/{catTotal}</span>
                                            <button className="bucket-cat-remove" onClick={() => onRemoveCategory(cat.id)} title="Remove from bucket">
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {progress.total > 0 && (
                        <div className="bucket-summary">
                            <span>{progress.completed}/{progress.total} units complete</span>
                            <span className="bucket-summary-pct" style={{ color: barColor }}>{progress.pct}%</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────
// Main export
// ────────────────────────────────────────────────────────────────────────
export default function TrackerBuckets({
    buckets,
    categories,
    tasks,
    onAddBucket,
    onUpdateBucket,
    onDeleteBucket,
    onToggleCollapsed,
    onAddCategoryToBucket,
    onRemoveCategoryFromBucket,
}: Props) {
    const [showNewForm, setShowNewForm] = useState(false);

    return (
        <div className="tracker-buckets-root">
            <div className="tracker-buckets-header">
                <h3 className="tracker-buckets-title">Tracking Dashboards</h3>
                <button className="bucket-add-new-btn" onClick={() => setShowNewForm(v => !v)}>
                    <PlusIcon className="w-4 h-4" />
                    New Bucket
                </button>
            </div>

            {showNewForm && (
                <NewBucketForm
                    onAdd={(name, mode, color) => { onAddBucket(name, mode, color); setShowNewForm(false); }}
                    onCancel={() => setShowNewForm(false)}
                />
            )}

            {buckets.length === 0 && !showNewForm && (
                <div className="bucket-empty-state">
                    <p>No tracking dashboards yet.</p>
                    <p className="text-xs mt-1">Create a <strong>Daily</strong> bucket to split your daily % by category group, or an <strong>Independent</strong> bucket to track something separately.</p>
                </div>
            )}

            <div className="bucket-list">
                {[...buckets].sort((a, b) => a.sort_order - b.sort_order).map(bucket => (
                    <BucketCard
                        key={bucket.id}
                        bucket={bucket}
                        categories={categories}
                        tasks={tasks}
                        onUpdate={updates => onUpdateBucket(bucket.id, updates)}
                        onDelete={() => onDeleteBucket(bucket.id)}
                        onToggleCollapsed={() => onToggleCollapsed(bucket.id)}
                        onAddCategory={catId => onAddCategoryToBucket(bucket.id, catId)}
                        onRemoveCategory={catId => onRemoveCategoryFromBucket(bucket.id, catId)}
                    />
                ))}
            </div>
        </div>
    );
}
