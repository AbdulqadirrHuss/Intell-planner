import { useState, useRef, useEffect } from 'react';
import { TrackerBucket, TrackerProgressBar, Category, Task } from './types';

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
const TrashIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const CheckCircleIcon = ({ className = '', checked }: { className?: string; checked?: boolean }) => (
    <svg className={className} viewBox="0 0 24 24" fill={checked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ChevronDownIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);
const ArrowLeftIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
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
    onAddBucketTask: (bucketId: string, taskText: string) => void;
    onRemoveBucketTask: (bucketId: string, taskText: string) => void;
    onAddBucketSubtask: (bucketId: string, subtaskText: string) => void;
    onRemoveBucketSubtask: (bucketId: string, subtaskText: string) => void;
    onToggleTask: (taskId: string, currentStatus: boolean, isRecurring: boolean) => void;
    onToggleSubtask: (subtaskId: string, parentTaskId: string, currentStatus: boolean, isRecurring: boolean) => void;
    onAddProgressBar: (bucketId: string, label: string, color: string) => void;
    onUpdateProgressBar: (bucketId: string, pbId: string, updates: Partial<TrackerProgressBar>) => void;
    onDeleteProgressBar: (bucketId: string, pbId: string) => void;
    onAddPBCategory: (bucketId: string, pbId: string, categoryId: string) => void;
    onRemovePBCategory: (bucketId: string, pbId: string, categoryId: string) => void;
    onAddPBTask: (bucketId: string, pbId: string, taskText: string) => void;
    onRemovePBTask: (bucketId: string, pbId: string, taskText: string) => void;
    onAddPBSubtask: (bucketId: string, pbId: string, subtaskText: string) => void;
    onRemovePBSubtask: (bucketId: string, pbId: string, subtaskText: string) => void;
}

interface TrackedItem {
    id: string;
    text: string;
    completed: boolean;
    type: 'task' | 'subtask';
    color: string;
    parentTaskId?: string;
    isRecurring: boolean;
}

function resolveTrackedItems(
    categoryIds: string[], taskTexts: string[], subtaskTexts: string[],
    categories: Category[], todayTasks: Task[], fallbackColor: string
): TrackedItem[] {
    const items: TrackedItem[] = [];
    todayTasks.forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const color = cat?.color || fallbackColor;
        const isCatTracked = categoryIds.includes(t.categoryId);
        const isTaskTracked = taskTexts.includes(t.text);
        if (isCatTracked || isTaskTracked) {
            if (t.subtasks && t.subtasks.length > 0) {
                t.subtasks.forEach(st => items.push({ id: st.id, text: st.text, completed: st.completed, type: 'subtask', color, parentTaskId: t.id, isRecurring: st.isRecurring }));
            } else {
                items.push({ id: t.id, text: t.text, completed: t.completed, type: 'task', color, isRecurring: t.isRecurring });
            }
        } else if (t.subtasks && t.subtasks.length > 0) {
            t.subtasks.forEach(st => {
                if (subtaskTexts.includes(st.text))
                    items.push({ id: st.id, text: st.text, completed: st.completed, type: 'subtask', color, parentTaskId: t.id, isRecurring: st.isRecurring });
            });
        }
    });
    return items;
}

function calcPct(items: TrackedItem[]) {
    const total = items.length;
    const done = items.filter(i => i.completed).length;
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

const PALETTE = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316'];

// ═══════════════════════════════════════════════════════════
// Progress Ring (futuristic, glowing)
// ═══════════════════════════════════════════════════════════
function ProgressRing({ pct, color, size = 90, stroke = 7 }: { pct: number; color: string; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <div className="ring-aura-wrapper" style={{ '--ring-color': color } as any}>
            <svg width={size} height={size} className="tile-ring">
                <circle cx={size / 2} cy={size / 2} r={r + 3} fill="none" stroke={color} strokeWidth={1} opacity={0.15} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}80)`, transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                <text x="50%" y="44%" textAnchor="middle" dy="0.35em" fill="white" fontSize={size > 70 ? '18' : '13'} fontWeight="800" fontFamily="Inter, sans-serif">{pct}%</text>
                <text x="50%" y="64%" textAnchor="middle" fill={color} fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif" opacity={0.85}>DONE</text>
            </svg>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// Granular Item Tree
// ═══════════════════════════════════════════════════════════
function GranularTree({ categories, trackedCatIds, trackedTaskTexts, trackedSubtaskTexts, onAddCat, onRemoveCat, onAddTask, onRemoveTask, onAddSubtask, onRemoveSubtask }: {
    categories: Category[];
    trackedCatIds: string[]; trackedTaskTexts: string[]; trackedSubtaskTexts: string[];
    onAddCat: (id: string) => void; onRemoveCat: (id: string) => void;
    onAddTask: (t: string) => void; onRemoveTask: (t: string) => void;
    onAddSubtask: (t: string) => void; onRemoveSubtask: (t: string) => void;
}) {
    return (
        <div className="tile-granular-tree custom-scrollbar">
            {categories.map(cat => {
                const isCatLinked = trackedCatIds.includes(cat.id);
                return (
                    <div key={cat.id} className="mb-2 rounded-md overflow-hidden" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center justify-between p-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                                <span className="text-sm font-semibold text-white">{cat.name}</span>
                            </div>
                            <button
                                className={`text-xs px-2 py-1 rounded font-semibold transition-colors ${isCatLinked ? 'bg-violet-500 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}
                                onClick={() => isCatLinked ? onRemoveCat(cat.id) : onAddCat(cat.id)}
                            >
                                {isCatLinked ? '✓ Linked' : 'Link All'}
                            </button>
                        </div>
                        {!isCatLinked && (cat.recurringTasks || []).length > 0 && (
                            <div className="pl-5 pr-2 pb-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                {cat.recurringTasks.map(rt => {
                                    const isTaskLinked = trackedTaskTexts.includes(rt.text);
                                    return (
                                        <div key={rt.id} className="mt-1">
                                            <div className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <span className="text-xs text-gray-300 truncate pr-2">↳ {rt.text}</span>
                                                <button
                                                    className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${isTaskLinked ? 'bg-violet-500 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                                    onClick={() => isTaskLinked ? onRemoveTask(rt.text) : onAddTask(rt.text)}
                                                >
                                                    {isTaskLinked ? '✓' : 'Link'}
                                                </button>
                                            </div>
                                            {!isTaskLinked && (rt.subtaskTemplates || []).length > 0 && (
                                                <div className="pl-3 pb-1">
                                                    {rt.subtaskTemplates.map(st => {
                                                        const isLinked = trackedSubtaskTexts.includes(st.text);
                                                        return (
                                                            <div key={st.id} className="flex items-center justify-between py-0.5">
                                                                <span className="text-[11px] text-gray-500 truncate pr-2">• {st.text}</span>
                                                                <button
                                                                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${isLinked ? 'bg-violet-500 text-white' : 'border border-gray-600 text-gray-600 hover:text-gray-300'}`}
                                                                    onClick={() => isLinked ? onRemoveSubtask(st.text) : onAddSubtask(st.text)}
                                                                >
                                                                    {isLinked ? '✓' : 'Link'}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// Individual Progress Bar Config Card
// ═══════════════════════════════════════════════════════════
function PBConfigCard({ pb, categories, onUpdate, onDelete, onAddCat, onRemoveCat, onAddTask, onRemoveTask, onAddSubtask, onRemoveSubtask }: {
    pb: TrackerProgressBar; categories: Category[];
    onUpdate: (u: Partial<TrackerProgressBar>) => void; onDelete: () => void;
    onAddCat: (id: string) => void; onRemoveCat: (id: string) => void;
    onAddTask: (t: string) => void; onRemoveTask: (t: string) => void;
    onAddSubtask: (t: string) => void; onRemoveSubtask: (t: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState(pb.label);
    const save = () => { if (label.trim() && label !== pb.label) onUpdate({ label: label.trim() }); };
    return (
        <div className="pb-config-card">
            <div className="pb-config-header" onClick={() => setOpen(v => !v)}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="pb-config-dot" style={{ background: pb.color }} />
                    <span className="pb-config-label truncate">{pb.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="pb-config-delete" onClick={e => { e.stopPropagation(); if (confirm(`Delete "${pb.label}"?`)) onDelete(); }}>
                        <TrashIcon className="w-3 h-3" />
                    </button>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {open && (
                <div className="pb-config-body">
                    <input className="tile-edit-input mb-3" value={label} onChange={e => setLabel(e.target.value)} onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); }} placeholder="Bar label…" />
                    <p className="tile-edit-label mb-1">Color</p>
                    <div className="tile-palette mb-3">
                        {PALETTE.map(c => <button key={c} className={`tile-swatch ${pb.color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => onUpdate({ color: c })} />)}
                    </div>
                    <p className="tile-edit-label mb-1">Linked Items</p>
                    <GranularTree categories={categories} trackedCatIds={pb.categoryIds} trackedTaskTexts={pb.taskTexts} trackedSubtaskTexts={pb.subtaskTexts}
                        onAddCat={onAddCat} onRemoveCat={onRemoveCat} onAddTask={onAddTask} onRemoveTask={onRemoveTask} onAddSubtask={onAddSubtask} onRemoveSubtask={onRemoveSubtask} />
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// TRACKER DETAIL PAGE — shown when you click a tile
// ═══════════════════════════════════════════════════════════
function TrackerDetailPage({ bucket, categories, tasks, onBack, onUpdate, onDelete,
    onAddCategory, onRemoveCategory, onAddBucketTask, onRemoveBucketTask, onAddBucketSubtask, onRemoveBucketSubtask,
    onToggleTask, onToggleSubtask,
    onAddProgressBar, onUpdateProgressBar, onDeleteProgressBar,
    onAddPBCategory, onRemovePBCategory, onAddPBTask, onRemovePBTask, onAddPBSubtask, onRemovePBSubtask,
}: {
    bucket: TrackerBucket; categories: Category[]; tasks: Task[];
    onBack: () => void;
    onUpdate: (u: Partial<TrackerBucket>) => void; onDelete: () => void;
    onAddCategory: (id: string) => void; onRemoveCategory: (id: string) => void;
    onAddBucketTask: (bucketId: string, t: string) => void; onRemoveBucketTask: (bucketId: string, t: string) => void;
    onAddBucketSubtask: (bucketId: string, t: string) => void; onRemoveBucketSubtask: (bucketId: string, t: string) => void;
    onToggleTask: (id: string, status: boolean, rec: boolean) => void;
    onToggleSubtask: (id: string, parentId: string, status: boolean, rec: boolean) => void;
    onAddProgressBar: (bucketId: string, label: string, color: string) => void;
    onUpdateProgressBar: (bucketId: string, pbId: string, u: Partial<TrackerProgressBar>) => void;
    onDeleteProgressBar: (bucketId: string, pbId: string) => void;
    onAddPBCategory: (bucketId: string, pbId: string, catId: string) => void;
    onRemovePBCategory: (bucketId: string, pbId: string, catId: string) => void;
    onAddPBTask: (bucketId: string, pbId: string, t: string) => void;
    onRemovePBTask: (bucketId: string, pbId: string, t: string) => void;
    onAddPBSubtask: (bucketId: string, pbId: string, t: string) => void;
    onRemovePBSubtask: (bucketId: string, pbId: string, t: string) => void;
}) {
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(bucket.name);
    const [addingPB, setAddingPB] = useState(false);
    const [newPBLabel, setNewPBLabel] = useState('');
    const [newPBColor, setNewPBColor] = useState(PALETTE[4]);

    const trackedItems = resolveTrackedItems(bucket.categoryIds || [], bucket.taskTexts || [], bucket.subtaskTexts || [], categories, tasks, bucket.color);
    const { done, total, pct } = calcPct(trackedItems);

    const pbProgresses = (bucket.progressBars || []).map(pb => {
        const items = resolveTrackedItems(pb.categoryIds, pb.taskTexts, pb.subtaskTexts, categories, tasks, pb.color);
        return { pb, ...calcPct(items) };
    });

    const saveName = () => { if (editName.trim() && editName !== bucket.name) onUpdate({ name: editName.trim() }); };

    const submitPB = () => {
        if (newPBLabel.trim()) {
            onAddProgressBar(bucket.id, newPBLabel.trim(), newPBColor);
            setNewPBLabel('');
            setAddingPB(false);
        }
    };

    return (
        <div className="tracker-detail-page">
            {/* ── Header ── */}
            <div className="td-header">
                <button className="td-back-btn" onClick={onBack}>
                    <ArrowLeftIcon className="w-4 h-4" /> Trackers
                </button>

                <div className="td-ring-wrap" style={{ '--ring-color': bucket.color } as any}>
                    <ProgressRing pct={pct} color={bucket.color} size={72} stroke={6} />
                </div>

                <div className="td-title-block">
                    {editMode
                        ? <input className="tile-edit-input text-xl font-bold" value={editName} onChange={e => setEditName(e.target.value)} onBlur={saveName} onKeyDown={e => { if (e.key === 'Enter') saveName(); }} autoFocus />
                        : <h2 style={{ color: 'white' }}>{bucket.name}</h2>
                    }
                    <p>{done} of {total} items complete · {pct}%</p>
                </div>

                <div className="td-header-actions">
                    {/* Prominent "+ Add Progress Bar" button */}
                    <button className="td-add-pb-btn" onClick={() => setAddingPB(v => !v)}>
                        <PlusIcon className="w-4 h-4" />
                        Add Progress Bar
                    </button>
                    <button className={`td-gear-btn ${editMode ? 'active' : ''}`} onClick={() => setEditMode(v => !v)} title="Settings">
                        <GearIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Add PB form ── */}
            {addingPB && (
                <div className="td-add-pb-form mb-6">
                    <p className="tile-edit-label mb-2">New Progress Bar</p>
                    <input
                        className="tile-edit-input mb-3"
                        placeholder="Bar label (e.g. Morning Routine, Deep Work…)"
                        value={newPBLabel}
                        onChange={e => setNewPBLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') submitPB(); if (e.key === 'Escape') setAddingPB(false); }}
                        autoFocus
                    />
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="tile-palette">
                            {PALETTE.map(c => <button key={c} className={`tile-swatch ${newPBColor === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setNewPBColor(c)} />)}
                        </div>
                        <div className="flex gap-2">
                            <button className="tile-btn-cancel" onClick={() => setAddingPB(false)}>Cancel</button>
                            <button className="tile-btn-create" disabled={!newPBLabel.trim()} onClick={submitPB}>Create Bar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Custom Progress Bars ── */}
            {pbProgresses.length > 0 && (
                <div className="td-section">
                    <p className="td-section-title">Custom Progress Bars</p>
                    <div className="td-pb-bars">
                        {pbProgresses.map(({ pb, done: d, total: t, pct: p }) => (
                            <div key={pb.id} className="td-pb-bar-card">
                                <div className="td-pb-bar-header">
                                    <div className="td-pb-bar-label">
                                        <span style={{ background: pb.color }} />
                                        <span className="td-pb-bar-name">{pb.label}</span>
                                    </div>
                                    <span className="td-pb-bar-stat" style={{ color: pb.color }}>{d}/{t} — {p}%</span>
                                </div>
                                <div className="td-pb-track">
                                    <div className="td-pb-fill" style={{ width: `${p}%`, background: `linear-gradient(90deg, ${pb.color}99, ${pb.color})`, boxShadow: `0 0 10px ${pb.color}60` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Edit / Config Panel ── */}
            {editMode && (
                <div className="tile-edit-panel mb-6">
                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Bucket Color</label>
                        <div className="tile-palette">
                            {PALETTE.map(c => <button key={c} className={`tile-swatch ${bucket.color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => onUpdate({ color: c })} />)}
                        </div>
                    </div>

                    <div className="tile-edit-section">
                        <label className="tile-edit-label mb-2 block">Overall Tracked Items</label>
                        <GranularTree
                            categories={categories}
                            trackedCatIds={bucket.categoryIds || []}
                            trackedTaskTexts={bucket.taskTexts || []}
                            trackedSubtaskTexts={bucket.subtaskTexts || []}
                            onAddCat={onAddCategory}
                            onRemoveCat={onRemoveCategory}
                            onAddTask={t => onAddBucketTask(bucket.id, t)}
                            onRemoveTask={t => onRemoveBucketTask(bucket.id, t)}
                            onAddSubtask={t => onAddBucketSubtask(bucket.id, t)}
                            onRemoveSubtask={t => onRemoveBucketSubtask(bucket.id, t)}
                        />
                    </div>

                    {(bucket.progressBars || []).length > 0 && (
                        <div className="tile-edit-section">
                            <label className="tile-edit-label mb-2 block">Configure Progress Bars</label>
                            <div className="flex flex-col gap-2">
                                {bucket.progressBars.map(pb => (
                                    <PBConfigCard
                                        key={pb.id} pb={pb} categories={categories}
                                        onUpdate={u => onUpdateProgressBar(bucket.id, pb.id, u)}
                                        onDelete={() => onDeleteProgressBar(bucket.id, pb.id)}
                                        onAddCat={id => onAddPBCategory(bucket.id, pb.id, id)}
                                        onRemoveCat={id => onRemovePBCategory(bucket.id, pb.id, id)}
                                        onAddTask={t => onAddPBTask(bucket.id, pb.id, t)}
                                        onRemoveTask={t => onRemovePBTask(bucket.id, pb.id, t)}
                                        onAddSubtask={t => onAddPBSubtask(bucket.id, pb.id, t)}
                                        onRemoveSubtask={t => onRemovePBSubtask(bucket.id, pb.id, t)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <button className="td-delete-btn" onClick={() => { if (confirm(`Delete "${bucket.name}"?`)) { onDelete(); onBack(); } }}>
                        <TrashIcon className="w-3.5 h-3.5" /> Delete Tracker
                    </button>
                </div>
            )}

            {/* ── Overall tracked items list ── */}
            <div className="td-section">
                <p className="td-section-title">Tracked Today</p>
                {trackedItems.length === 0 ? (
                    <div className="tile-empty">
                        No items linked yet. Tap <GearIcon className="w-3.5 h-3.5 inline text-gray-400" /> to link categories or tasks.
                    </div>
                ) : (
                    <div className="tile-items-list">
                        {trackedItems.map(item => (
                            <button key={item.id}
                                className={`tile-tracked-item list ${item.completed ? 'completed' : ''}`}
                                onClick={() => {
                                    if (item.type === 'task') onToggleTask(item.id, item.completed, item.isRecurring);
                                    else if (item.parentTaskId) onToggleSubtask(item.id, item.parentTaskId, item.completed, item.isRecurring);
                                }}>
                                <div className="flex items-center gap-3">
                                    <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 transition-all ${item.completed ? 'text-violet-400' : 'text-white/20'}`} checked={item.completed} />
                                    <span className={`text-sm text-left ${item.completed ? 'opacity-40 line-through' : 'text-gray-200'}`}>{item.text}</span>
                                </div>
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
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
            <input ref={inputRef} className="tile-new-input" placeholder="Tracker name…" value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }} />
            <div className="tile-new-row">
                <div className="tile-palette">
                    {PALETTE.map(c => <button key={c} className={`tile-swatch ${color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />)}
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
// TRACKER GRID (the tile overview)
// ═══════════════════════════════════════════════════════════
export default function TrackerBuckets(props: Props) {
    const {
        buckets, categories, tasks,
        onAddBucket, onUpdateBucket, onDeleteBucket,
        onAddCategoryToBucket, onRemoveCategoryFromBucket,
        onAddBucketTask, onRemoveBucketTask, onAddBucketSubtask, onRemoveBucketSubtask,
        onToggleTask, onToggleSubtask,
        onAddProgressBar, onUpdateProgressBar, onDeleteProgressBar,
        onAddPBCategory, onRemovePBCategory, onAddPBTask, onRemovePBTask, onAddPBSubtask, onRemovePBSubtask,
    } = props;

    const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const selectedBucket = buckets.find(b => b.id === selectedBucketId);

    // If a bucket is selected, show the full detail page
    if (selectedBucket) {
        return (
            <TrackerDetailPage
                bucket={selectedBucket}
                categories={categories}
                tasks={tasks}
                onBack={() => setSelectedBucketId(null)}
                onUpdate={u => onUpdateBucket(selectedBucket.id, u)}
                onDelete={() => { onDeleteBucket(selectedBucket.id); setSelectedBucketId(null); }}
                onAddCategory={id => onAddCategoryToBucket(selectedBucket.id, id)}
                onRemoveCategory={id => onRemoveCategoryFromBucket(selectedBucket.id, id)}
                onAddBucketTask={onAddBucketTask}
                onRemoveBucketTask={onRemoveBucketTask}
                onAddBucketSubtask={onAddBucketSubtask}
                onRemoveBucketSubtask={onRemoveBucketSubtask}
                onToggleTask={onToggleTask}
                onToggleSubtask={onToggleSubtask}
                onAddProgressBar={onAddProgressBar}
                onUpdateProgressBar={onUpdateProgressBar}
                onDeleteProgressBar={onDeleteProgressBar}
                onAddPBCategory={onAddPBCategory}
                onRemovePBCategory={onRemovePBCategory}
                onAddPBTask={onAddPBTask}
                onRemovePBTask={onRemovePBTask}
                onAddPBSubtask={onAddPBSubtask}
                onRemovePBSubtask={onRemovePBSubtask}
            />
        );
    }

    // Otherwise show the grid of tiles
    return (
        <div className="tracker-buckets-root">
            <div className="tracker-buckets-header">
                <h3 className="tracker-buckets-title">Trackers</h3>
            </div>

            <div className="tile-grid">
                {buckets.map(b => {
                    const items = resolveTrackedItems(b.categoryIds || [], b.taskTexts || [], b.subtaskTexts || [], categories, tasks, b.color);
                    const { done, total, pct } = calcPct(items);
                    return (
                        <button
                            key={b.id}
                            className="tile futuristic-tile"
                            style={{ '--tile-color': b.color } as any}
                            onClick={() => setSelectedBucketId(b.id)}
                        >
                            <div className="tile-shimmer" />
                            <div className="tile-top">
                                <div className="tile-ring-container" style={{ '--ring-color': b.color } as any}>
                                    <ProgressRing pct={pct} color={b.color} size={90} stroke={7} />
                                </div>
                                <div className="tile-info">
                                    <span className="tile-name">{b.name}</span>
                                    <span className="tile-count">{done}/{total} items</span>
                                    {(b.progressBars || []).length > 0 && (
                                        <span className="tile-pb-hint">{b.progressBars.length} bar{b.progressBars.length !== 1 ? 's' : ''}</span>
                                    )}
                                </div>
                            </div>
                            {/* Mini preview bars */}
                            {(b.progressBars || []).length > 0 && (
                                <div className="tile-mini-bars">
                                    {b.progressBars.map(pb => {
                                        const pbItems = resolveTrackedItems(pb.categoryIds, pb.taskTexts, pb.subtaskTexts, categories, tasks, pb.color);
                                        const { pct: pp } = calcPct(pbItems);
                                        return (
                                            <div key={pb.id} className="tile-mini-bar-row">
                                                <span className="tile-mini-bar-label">{pb.label}</span>
                                                <div className="tile-mini-bar-track">
                                                    <div className="tile-mini-bar-fill" style={{ width: `${pp}%`, background: pb.color, boxShadow: `0 0 6px ${pb.color}80` }} />
                                                </div>
                                                <span className="tile-mini-bar-pct" style={{ color: pb.color }}>{pp}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </button>
                    );
                })}

                {/* Create new tile */}
                {isCreating ? (
                    <div className="tile-wrapper">
                        <div className="tile-create-panel">
                            <NewBucketForm
                                onAdd={(name, color) => { onAddBucket(name, 'independent', color); setIsCreating(false); }}
                                onCancel={() => setIsCreating(false)}
                            />
                        </div>
                    </div>
                ) : (
                    <button className="tile-add-btn" onClick={() => setIsCreating(true)}>
                        <PlusIcon className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">+ New</span>
                    </button>
                )}
            </div>
        </div>
    );
}
