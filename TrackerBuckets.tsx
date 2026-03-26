import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrackerBucket, Category, Task } from './types';

// ═══════════════════════════════════════════════════════════
// Icons
// ═══════════════════════════════════════════════════════════
const GearIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const PlusIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const XIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const TrashIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const GridIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);
const ListIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
);

// ═══════════════════════════════════════════════════════════
// Types & Helpers
// ═══════════════════════════════════════════════════════════
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

function calcProgress(categoryIds: string[], tasks: Task[]) {
    const relevant = tasks.filter(t => categoryIds.includes(t.categoryId));
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
    return { completed, total, pct: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

const PALETTE = [
    '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316',
];

// ═══════════════════════════════════════════════════════════
// Circular Progress Ring (SVG)
// ═══════════════════════════════════════════════════════════
function ProgressRing({ pct, color, size = 58, stroke = 4 }: { pct: number; color: string; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
        <svg width={size} height={size} className="tile-ring">
            {/* Track */}
            <circle cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            {/* Fill */}
            <circle cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
            {/* % Text */}
            <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
                fill="white" fontSize={size > 50 ? '13' : '11'} fontWeight="700">
                {pct}%
            </text>
        </svg>
    );
}

// ═══════════════════════════════════════════════════════════
// New Bucket Form
// ═══════════════════════════════════════════════════════════
function NewBucketForm({ onAdd, onCancel }: { onAdd: (name: string, color: string) => void; onCancel: () => void }) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(PALETTE[0]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const submit = () => { if (name.trim()) onAdd(name.trim(), color); };

    return (
        <div className="tile-new-form">
            <input ref={inputRef} className="tile-new-input" placeholder="Dashboard name…" value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }} />
            <div className="tile-new-row">
                <div className="tile-palette">
                    {PALETTE.map(c => (
                        <button key={c} className={`tile-swatch ${color === c ? 'sel' : ''}`}
                            style={{ background: c }} onClick={() => setColor(c)} />
                    ))}
                </div>
                <div className="tile-new-actions">
                    <button className="tile-btn-cancel" onClick={onCancel}>Cancel</button>
                    <button className="tile-btn-create" disabled={!name.trim()} onClick={submit}>Create</button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// Expanded Panel
// ═══════════════════════════════════════════════════════════
function ExpandedPanel({
    bucket, categories, tasks,
    onUpdate, onDelete, onAddCategory, onRemoveCategory,
}: {
    bucket: TrackerBucket; categories: Category[]; tasks: Task[];
    onUpdate: (u: Partial<TrackerBucket>) => void; onDelete: () => void;
    onAddCategory: (id: string) => void; onRemoveCategory: (id: string) => void;
}) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(bucket.name);
    const [showCatPicker, setShowCatPicker] = useState(false);

    const bucketCats = categories.filter(c => bucket.categoryIds.includes(c.id));
    const availableCats = categories.filter(c => !bucket.categoryIds.includes(c.id));

    const saveName = () => { if (editName.trim() && editName !== bucket.name) onUpdate({ name: editName.trim() }); setEditMode(false); };

    return (
        <div className="tile-panel">
            {/* Toolbar */}
            <div className="tile-panel-toolbar">
                <div className="tile-view-tabs">
                    <button className={`tile-view-tab ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
                        <GridIcon className="w-4 h-4" />
                    </button>
                    <button className={`tile-view-tab ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">
                        <ListIcon className="w-4 h-4" />
                    </button>
                </div>
                <button className={`tile-gear-btn ${editMode ? 'active' : ''}`} onClick={() => setEditMode(v => !v)} title="Settings">
                    <GearIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Edit Mode Panel */}
            {editMode && (
                <div className="tile-edit-panel">
                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Name</label>
                        <input className="tile-edit-input" value={editName} onChange={e => setEditName(e.target.value)}
                            onBlur={saveName} onKeyDown={e => { if (e.key === 'Enter') saveName(); }} />
                    </div>
                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Color</label>
                        <div className="tile-palette">
                            {PALETTE.map(c => (
                                <button key={c} className={`tile-swatch ${bucket.color === c ? 'sel' : ''}`}
                                    style={{ background: c }} onClick={() => onUpdate({ color: c })} />
                            ))}
                        </div>
                    </div>
                    <div className="tile-edit-section">
                        <div className="tile-edit-cat-header">
                            <label className="tile-edit-label">Categories</label>
                            {availableCats.length > 0 && (
                                <button className="tile-edit-add-btn" onClick={() => setShowCatPicker(v => !v)}>
                                    <PlusIcon className="w-3 h-3" /> Add
                                </button>
                            )}
                        </div>
                        {showCatPicker && (
                            <div className="tile-cat-picker">
                                {availableCats.map(c => (
                                    <button key={c.id} className="tile-cat-pick-item" onClick={() => { onAddCategory(c.id); setShowCatPicker(false); }}>
                                        <span className="tile-cat-dot" style={{ background: c.color }} />{c.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        {bucketCats.map(c => (
                            <div key={c.id} className="tile-edit-cat-row">
                                <span className="tile-cat-dot" style={{ background: c.color }} />
                                <span>{c.name}</span>
                                <button className="tile-cat-remove-btn" onClick={() => onRemoveCategory(c.id)}>
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="tile-delete-btn" onClick={() => { if (confirm(`Delete "${bucket.name}"?`)) onDelete(); }}>
                        <TrashIcon className="w-3.5 h-3.5" /> Delete Dashboard
                    </button>
                </div>
            )}

            {/* Category Items */}
            {!editMode && bucketCats.length === 0 && (
                <div className="tile-empty">
                    No categories yet — tap <GearIcon className="w-3.5 h-3.5 inline" /> to add some.
                </div>
            )}

            {!editMode && bucketCats.length > 0 && viewMode === 'grid' && (
                <div className="tile-cat-grid">
                    {bucketCats.map(cat => {
                        const p = calcProgress([cat.id], tasks);
                        return (
                            <div key={cat.id} className="tile-cat-card">
                                <div className="tile-cat-card-header">
                                    <span className="tile-cat-dot-lg" style={{ background: cat.color }} />
                                    <span className="tile-cat-card-name">{cat.name}</span>
                                </div>
                                <div className="tile-cat-card-bar-track">
                                    <div className="tile-cat-card-bar-fill" style={{ width: `${p.pct}%`, background: cat.color }} />
                                </div>
                                <div className="tile-cat-card-stats">
                                    <span>{p.completed}/{p.total}</span>
                                    <span className="tile-cat-card-pct" style={{ color: cat.color }}>{p.pct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!editMode && bucketCats.length > 0 && viewMode === 'list' && (
                <div className="tile-cat-list">
                    {bucketCats.map(cat => {
                        const p = calcProgress([cat.id], tasks);
                        return (
                            <div key={cat.id} className="tile-cat-list-row">
                                <span className="tile-cat-dot" style={{ background: cat.color }} />
                                <span className="tile-cat-list-name">{cat.name}</span>
                                <div className="tile-cat-list-bar-track">
                                    <div className="tile-cat-list-bar-fill" style={{ width: `${p.pct}%`, background: cat.color + 'cc' }} />
                                </div>
                                <span className="tile-cat-list-stat">{p.completed}/{p.total}</span>
                                <span className="tile-cat-list-pct" style={{ color: cat.color }}>{p.pct}%</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// Main Export — TrackerBuckets
// ═══════════════════════════════════════════════════════════
export default function TrackerBuckets({
    buckets, categories, tasks,
    onAddBucket, onUpdateBucket, onDeleteBucket, onToggleCollapsed,
    onAddCategoryToBucket, onRemoveCategoryFromBucket,
}: Props) {
    const [showNewForm, setShowNewForm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleTileClick = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const sorted = useMemo(() => [...buckets].sort((a, b) => a.sort_order - b.sort_order), [buckets]);

    return (
        <div className="tile-root">
            {/* Grid of Tiles */}
            <div className="tile-grid">
                {sorted.map(bucket => {
                    const progress = calcProgress(bucket.categoryIds, tasks);
                    const isExpanded = expandedId === bucket.id;
                    return (
                        <button
                            key={bucket.id}
                            className={`tile ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => handleTileClick(bucket.id)}
                            style={{ '--tile-color': bucket.color } as React.CSSProperties}
                        >
                            <ProgressRing pct={progress.pct} color={bucket.color} />
                            <span className="tile-name">{bucket.name}</span>
                            <span className="tile-fraction">{progress.completed}/{progress.total}</span>
                        </button>
                    );
                })}

                {/* Add Tile */}
                <button className="tile tile-add" onClick={() => setShowNewForm(v => !v)}>
                    <PlusIcon className="w-7 h-7" />
                    <span className="tile-name">New</span>
                </button>
            </div>

            {/* New bucket form */}
            {showNewForm && (
                <NewBucketForm
                    onAdd={(name, color) => { onAddBucket(name, 'daily', color); setShowNewForm(false); }}
                    onCancel={() => setShowNewForm(false)}
                />
            )}

            {/* Expanded Accordion Panel */}
            {expandedId && (() => {
                const bucket = buckets.find(b => b.id === expandedId);
                if (!bucket) return null;
                return (
                    <ExpandedPanel
                        key={bucket.id}
                        bucket={bucket}
                        categories={categories}
                        tasks={tasks}
                        onUpdate={u => onUpdateBucket(bucket.id, u)}
                        onDelete={() => { onDeleteBucket(bucket.id); setExpandedId(null); }}
                        onAddCategory={catId => onAddCategoryToBucket(bucket.id, catId)}
                        onRemoveCategory={catId => onRemoveCategoryFromBucket(bucket.id, catId)}
                    />
                );
            })()}
        </div>
    );
}
