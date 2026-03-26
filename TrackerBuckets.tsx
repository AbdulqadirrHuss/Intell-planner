import { useState, useRef, useEffect } from 'react';
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
const CheckCircleIcon = ({ className = '', checked }: { className?: string, checked?: boolean }) => (
    <svg className={className} viewBox="0 0 24 24" fill={checked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
}

interface TrackedRenderItem {
    id: string;
    text: string;
    completed: boolean;
    type: 'task' | 'subtask';
    color: string;
    parentTaskId?: string;
    isRecurring: boolean;
}

function getTrackedItemsForToday(bucket: TrackerBucket, categories: Category[], todayTasks: Task[]): TrackedRenderItem[] {
    const items: TrackedRenderItem[] = [];
    
    todayTasks.forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const color = cat?.color || bucket.color || '#8b5cf6';
        
        const isCatTracked = bucket.categoryIds && bucket.categoryIds.includes(t.categoryId);
        const isTaskTracked = bucket.taskTexts && bucket.taskTexts.includes(t.text);
        
        if (isCatTracked || isTaskTracked) {
            // Task is tracked (either via category or exact match). Provide it entirely.
            // If it has subtasks, we render the subtasks as the checkable units to match old total logic,
            // OR render just the task if it has no subtasks.
            if (t.subtasks && t.subtasks.length > 0) {
                t.subtasks.forEach(st => {
                    items.push({ id: st.id, text: st.text, completed: st.completed, type: 'subtask', color, parentTaskId: t.id, isRecurring: st.isRecurring });
                });
            } else {
                items.push({ id: t.id, text: t.text, completed: t.completed, type: 'task', color, isRecurring: t.isRecurring });
            }
        } else {
            // Task is NOT tracked, but maybe a specific subtask is?
            if (t.subtasks && t.subtasks.length > 0) {
                t.subtasks.forEach(st => {
                    if (bucket.subtaskTexts && bucket.subtaskTexts.includes(st.text)) {
                        items.push({ id: st.id, text: st.text, completed: st.completed, type: 'subtask', color, parentTaskId: t.id, isRecurring: st.isRecurring });
                    }
                });
            }
        }
    });

    return items;
}

function calcBetterProgress(items: TrackedRenderItem[]) {
    const total = items.length;
    const completed = items.filter(i => i.completed).length;
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
                fill="none" stroke="var(--bg-card)" strokeWidth={stroke} />
            {/* Fill */}
            <circle cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                className="drop-shadow-glow"
                style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
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
    bucket, categories, trackedItems,
    onUpdate, onDelete, 
    onAddCategory, onRemoveCategory,
    onAddBucketTask, onRemoveBucketTask,
    onAddBucketSubtask, onRemoveBucketSubtask,
    onToggleTask, onToggleSubtask
}: {
    bucket: TrackerBucket; 
    categories: Category[]; 
    trackedItems: TrackedRenderItem[];
    onUpdate: (u: Partial<TrackerBucket>) => void; 
    onDelete: () => void;
    onAddCategory: (id: string) => void; 
    onRemoveCategory: (id: string) => void;
    onAddBucketTask: (bucketId: string, taskText: string) => void;
    onRemoveBucketTask: (bucketId: string, taskText: string) => void;
    onAddBucketSubtask: (bucketId: string, subtaskText: string) => void;
    onRemoveBucketSubtask: (bucketId: string, subtaskText: string) => void;
    onToggleTask: (taskId: string, currentStatus: boolean, isRecurring: boolean) => void;
    onToggleSubtask: (subtaskId: string, parentTaskId: string, currentStatus: boolean, isRecurring: boolean) => void;
}) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(bucket.name);

    const saveName = () => { if (editName.trim() && editName !== bucket.name) onUpdate({ name: editName.trim() }); setEditMode(false); };

    // Group categories for settings tree
    const bucketCats = (bucket.categoryIds || []);
    const bucketTasks = (bucket.taskTexts || []);
    const bucketSubtasks = (bucket.subtaskTexts || []);

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

            {/* Edit Mode Panel (Granular Selection Tree) */}
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
                    
                    {/* Settings Tree */}
                    <div className="tile-edit-section">
                        <label className="tile-edit-label mb-2 block">Tracked Items (Click to link)</label>
                        <div className="tile-granular-tree custom-scrollbar">
                            {categories.map(cat => {
                                const isCatTracked = bucketCats.includes(cat.id);
                                return (
                                    <div key={cat.id} className="mb-2 bg-black/20 rounded-md overflow-hidden">
                                        <div className="flex items-center justify-between p-2 hover:bg-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{background: cat.color}} />
                                                <span className="text-sm font-medium text-white">{cat.name}</span>
                                            </div>
                                            <button 
                                                className={`text-xs px-2 py-1 rounded transition-colors ${isCatTracked ? 'bg-violet-500 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}
                                                onClick={() => isCatTracked ? onRemoveCategory(cat.id) : onAddCategory(cat.id)}
                                            >
                                                {isCatTracked ? 'Linked' : 'Link All'}
                                            </button>
                                        </div>
                                        
                                        {!isCatTracked && cat.recurringTasks && cat.recurringTasks.length > 0 && (
                                            <div className="pl-6 pr-2 pb-2 bg-black/40">
                                                {cat.recurringTasks.map(rt => {
                                                    const isTaskTracked = bucketTasks.includes(rt.text);
                                                    return (
                                                        <div key={rt.id} className="mt-1">
                                                            <div className="flex items-center justify-between py-1 border-b border-white/5">
                                                                <span className="text-xs text-gray-300 truncate pr-2">↳ {rt.text}</span>
                                                                <button 
                                                                    className={`text-[10px] px-2 py-0.5 rounded transition-colors ${isTaskTracked ? 'bg-violet-500 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                                                    onClick={() => isTaskTracked ? onRemoveBucketTask(bucket.id, rt.text) : onAddBucketTask(bucket.id, rt.text)}
                                                                >
                                                                    {isTaskTracked ? 'Linked' : 'Link'}
                                                                </button>
                                                            </div>
                                                            
                                                            {!isTaskTracked && rt.subtaskTemplates && rt.subtaskTemplates.length > 0 && (
                                                                <div className="pl-4 pb-1">
                                                                    {rt.subtaskTemplates.map(st => {
                                                                        const isSubTracked = bucketSubtasks.includes(st.text);
                                                                        return (
                                                                             <div key={st.id} className="flex items-center justify-between py-1">
                                                                                <span className="text-[11px] text-gray-500 truncate pr-2">• {st.text}</span>
                                                                                <button 
                                                                                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${isSubTracked ? 'bg-violet-500 text-white' : 'text-gray-600 border border-gray-600 hover:text-gray-300'}`}
                                                                                    onClick={() => isSubTracked ? onRemoveBucketSubtask(bucket.id, st.text) : onAddBucketSubtask(bucket.id, st.text)}
                                                                                >
                                                                                    {isSubTracked ? 'Linked' : 'Link'}
                                                                                </button>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    
                    <button className="tile-delete-btn mt-4" onClick={() => { if (confirm(`Delete "${bucket.name}"?`)) onDelete(); }}>
                        <TrashIcon className="w-3.5 h-3.5" /> Delete Dashboard
                    </button>
                </div>
            )}

            {/* Interactive Items */}
            {!editMode && trackedItems.length === 0 && (
                <div className="tile-empty">
                    No items tracked today. <br/> Tap <GearIcon className="w-3.5 h-3.5 inline text-gray-400" /> to link some!
                </div>
            )}

            {!editMode && trackedItems.length > 0 && (
                <div className={viewMode === 'grid' ? "tile-cat-grid" : "tile-items-list"}>
                    {trackedItems.map(item => (
                        <button 
                            key={item.id} 
                            className={`tile-tracked-item ${viewMode} ${item.completed ? 'completed' : ''}`}
                            onClick={() => {
                                if (item.type === 'task') {
                                    onToggleTask(item.id, item.completed, item.isRecurring);
                                } else if (item.parentTaskId) {
                                    onToggleSubtask(item.id, item.parentTaskId, item.completed, item.isRecurring);
                                }
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircleIcon 
                                    className={`w-5 h-5 transition-all ${item.completed ? 'text-violet-400' : 'text-white/20'}`} 
                                    checked={item.completed} 
                                />
                                <span className={`text-sm tracking-wide text-left ${item.completed ? 'opacity-50 line-through text-gray-500' : 'text-gray-200'}`}>
                                    {item.text}
                                </span>
                            </div>
                            {viewMode === 'list' && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background: item.color}} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// Main TrackerBuckets Component
// ═══════════════════════════════════════════════════════════
export default function TrackerBuckets(props: Props) {
    const { buckets, categories, tasks, onAddBucket, onUpdateBucket, onDeleteBucket, onToggleCollapsed, onAddCategoryToBucket, onRemoveCategoryFromBucket, onAddBucketTask, onRemoveBucketTask, onAddBucketSubtask, onRemoveBucketSubtask, onToggleTask, onToggleSubtask } = props;
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = (name: string, color: string) => {
        onAddBucket(name, 'independent', color);
        setIsCreating(false);
    };

    return (
        <div className="tracker-buckets-root">
            <div className="tracker-buckets-header">
                <h3 className="tracker-buckets-title">Trackers</h3>
            </div>

            {/* Compact tile cards grid */}
            <div className="tile-grid">
                {buckets.map(b => {
                    const trackedItems = getTrackedItemsForToday(b, categories, tasks);
                    const p = calcBetterProgress(trackedItems);
                    return (
                        <button key={b.id} className={`tile ${!b.collapsed ? 'expanded' : ''}`}
                            style={{ '--tile-color': b.color } as React.CSSProperties}
                            onClick={() => onToggleCollapsed(b.id)}>
                            <div className="tile-top">
                                <div className="tile-icon-bg" style={{ background: `${b.color}20` }}>
                                    <ProgressRing pct={p.pct} color={b.color} size={46} stroke={4} />
                                </div>
                                <div className="tile-info">
                                    <span className="tile-name">{b.name}</span>
                                    <span className="tile-count">{p.completed} / {p.total}</span>
                                </div>
                            </div>
                        </button>
                    );
                })}

                {/* Add New tile */}
                {!isCreating && (
                    <button className="tile tile-add" onClick={() => setIsCreating(true)}>
                        <PlusIcon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-bold uppercase tracking-widest">New</span>
                    </button>
                )}
            </div>

            {/* Full-width expanded panels — outside the grid */}
            {buckets.map(b => {
                if (b.collapsed) return null;
                const trackedItems = getTrackedItemsForToday(b, categories, tasks);
                return (
                    <div key={`panel-${b.id}`} className="tile-panel-outer">
                        <ExpandedPanel
                            bucket={b}
                            categories={categories}
                            trackedItems={trackedItems}
                            onUpdate={(u) => onUpdateBucket(b.id, u)}
                            onDelete={() => onDeleteBucket(b.id)}
                            onAddCategory={(catId) => onAddCategoryToBucket(b.id, catId)}
                            onRemoveCategory={(catId) => onRemoveCategoryFromBucket(b.id, catId)}
                            onAddBucketTask={onAddBucketTask}
                            onRemoveBucketTask={onRemoveBucketTask}
                            onAddBucketSubtask={onAddBucketSubtask}
                            onRemoveBucketSubtask={onRemoveBucketSubtask}
                            onToggleTask={onToggleTask}
                            onToggleSubtask={onToggleSubtask}
                        />
                    </div>
                );
            })}

            {/* New bucket form */}
            {isCreating && (
                <NewBucketForm onAdd={handleCreate} onCancel={() => setIsCreating(false)} />
            )}
        </div>
    );
}
