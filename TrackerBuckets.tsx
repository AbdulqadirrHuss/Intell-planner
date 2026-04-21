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
const ChevronDownIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
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

    // Progress bar handlers
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

interface TrackedRenderItem {
    id: string;
    text: string;
    completed: boolean;
    type: 'task' | 'subtask';
    color: string;
    parentTaskId?: string;
    isRecurring: boolean;
}

/** Converts linked bucket/pb config into a flat list of atomic items (subtask-aware) */
function resolveTrackedItems(
    categoryIds: string[],
    taskTexts: string[],
    subtaskTexts: string[],
    categories: Category[],
    todayTasks: Task[],
    fallbackColor: string
): TrackedRenderItem[] {
    const items: TrackedRenderItem[] = [];

    todayTasks.forEach(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        const color = cat?.color || fallbackColor;

        const isCatTracked = categoryIds.includes(t.categoryId);
        const isTaskTracked = taskTexts.includes(t.text);

        if (isCatTracked || isTaskTracked) {
            // Task is tracked as a whole — decompose into subtasks for atomic granularity
            if (t.subtasks && t.subtasks.length > 0) {
                t.subtasks.forEach(st => {
                    items.push({ id: st.id, text: st.text, completed: st.completed, type: 'subtask', color, parentTaskId: t.id, isRecurring: st.isRecurring });
                });
            } else {
                items.push({ id: t.id, text: t.text, completed: t.completed, type: 'task', color, isRecurring: t.isRecurring });
            }
        } else {
            // Not whole-task tracked — check specific subtasks
            if (t.subtasks && t.subtasks.length > 0) {
                t.subtasks.forEach(st => {
                    if (subtaskTexts.includes(st.text)) {
                        items.push({ id: st.id, text: st.text, completed: st.completed, type: 'subtask', color, parentTaskId: t.id, isRecurring: st.isRecurring });
                    }
                });
            }
        }
    });

    return items;
}

function calcProgress(items: TrackedRenderItem[]) {
    const total = items.length;
    const completed = items.filter(i => i.completed).length;
    return { completed, total, pct: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

const PALETTE = [
    '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316',
];

// ═══════════════════════════════════════════════════════════
// Futuristic Circular Progress Ring
// ═══════════════════════════════════════════════════════════
function ProgressRing({ pct, color, size = 90, stroke = 7 }: { pct: number; color: string; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;

    return (
        <div className="ring-aura-wrapper" style={{ '--ring-color': color } as any}>
            <svg width={size} height={size} className="tile-ring">
                {/* Outer glow ring */}
                <circle cx={size / 2} cy={size / 2} r={r + 3}
                    fill="none" stroke={color} strokeWidth={1} opacity={0.15} />
                {/* Track */}
                <circle cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                {/* Glowing fill */}
                <circle cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}80)`,
                        transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%'
                    }} />
                {/* Percentage text */}
                <text x="50%" y="44%" textAnchor="middle" dy="0.35em"
                    fill="white" fontSize={size > 70 ? '18' : '13'} fontWeight="800" fontFamily="Inter, sans-serif">
                    {pct}%
                </text>
                <text x="50%" y="64%" textAnchor="middle"
                    fill={color} fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif" opacity={0.85}>
                    DONE
                </text>
            </svg>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// Mini Progress Bar (for custom progress bars)
// ═══════════════════════════════════════════════════════════
function ProgressBarRow({ label, pct, completed, total, color }: {
    label: string; pct: number; completed: number; total: number; color: string;
}) {
    return (
        <div className="pb-row">
            <div className="pb-row-header">
                <span className="pb-row-label">{label}</span>
                <span className="pb-row-stat" style={{ color }}>{completed}/{total} <span className="pb-row-pct">{pct}%</span></span>
            </div>
            <div className="pb-track">
                <div className="pb-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}bb, ${color})`, boxShadow: `0 0 8px ${color}60` }} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// Granular item tree (reusable for both bucket & progress bars)
// ═══════════════════════════════════════════════════════════
function GranularTree({
    categories,
    trackedCatIds,
    trackedTaskTexts,
    trackedSubtaskTexts,
    onAddCat,
    onRemoveCat,
    onAddTask,
    onRemoveTask,
    onAddSubtask,
    onRemoveSubtask,
}: {
    categories: Category[];
    trackedCatIds: string[];
    trackedTaskTexts: string[];
    trackedSubtaskTexts: string[];
    onAddCat: (id: string) => void;
    onRemoveCat: (id: string) => void;
    onAddTask: (text: string) => void;
    onRemoveTask: (text: string) => void;
    onAddSubtask: (text: string) => void;
    onRemoveSubtask: (text: string) => void;
}) {
    return (
        <div className="tile-granular-tree custom-scrollbar">
            {categories.map(cat => {
                const isCatTracked = trackedCatIds.includes(cat.id);
                return (
                    <div key={cat.id} className="mb-2 bg-black/20 rounded-md overflow-hidden">
                        <div className="flex items-center justify-between p-2 hover:bg-white/5">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                                <span className="text-sm font-medium text-white">{cat.name}</span>
                            </div>
                            <button
                                className={`text-xs px-2 py-1 rounded transition-colors ${isCatTracked ? 'bg-violet-500 text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}
                                onClick={() => isCatTracked ? onRemoveCat(cat.id) : onAddCat(cat.id)}
                            >
                                {isCatTracked ? 'Linked' : 'Link All'}
                            </button>
                        </div>

                        {!isCatTracked && cat.recurringTasks && cat.recurringTasks.length > 0 && (
                            <div className="pl-6 pr-2 pb-2 bg-black/40">
                                {cat.recurringTasks.map(rt => {
                                    const isTaskTracked = trackedTaskTexts.includes(rt.text);
                                    return (
                                        <div key={rt.id} className="mt-1">
                                            <div className="flex items-center justify-between py-1 border-b border-white/5">
                                                <span className="text-xs text-gray-300 truncate pr-2">↳ {rt.text}</span>
                                                <button
                                                    className={`text-[10px] px-2 py-0.5 rounded transition-colors ${isTaskTracked ? 'bg-violet-500 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                                    onClick={() => isTaskTracked ? onRemoveTask(rt.text) : onAddTask(rt.text)}
                                                >
                                                    {isTaskTracked ? 'Linked' : 'Link'}
                                                </button>
                                            </div>

                                            {!isTaskTracked && rt.subtaskTemplates && rt.subtaskTemplates.length > 0 && (
                                                <div className="pl-4 pb-1">
                                                    {rt.subtaskTemplates.map(st => {
                                                        const isSubTracked = trackedSubtaskTexts.includes(st.text);
                                                        return (
                                                            <div key={st.id} className="flex items-center justify-between py-1">
                                                                <span className="text-[11px] text-gray-500 truncate pr-2">• {st.text}</span>
                                                                <button
                                                                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${isSubTracked ? 'bg-violet-500 text-white' : 'text-gray-600 border border-gray-600 hover:text-gray-300'}`}
                                                                    onClick={() => isSubTracked ? onRemoveSubtask(st.text) : onAddSubtask(st.text)}
                                                                >
                                                                    {isSubTracked ? 'Linked' : 'Link'}
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
// Progress Bar Config Card (inline, inside gear panel)
// ═══════════════════════════════════════════════════════════
function PBConfigCard({
    pb, bucketId, categories,
    onUpdate, onDelete,
    onAddCat, onRemoveCat,
    onAddTask, onRemoveTask,
    onAddSubtask, onRemoveSubtask,
}: {
    pb: TrackerProgressBar;
    bucketId: string;
    categories: Category[];
    onUpdate: (updates: Partial<TrackerProgressBar>) => void;
    onDelete: () => void;
    onAddCat: (catId: string) => void;
    onRemoveCat: (catId: string) => void;
    onAddTask: (text: string) => void;
    onRemoveTask: (text: string) => void;
    onAddSubtask: (text: string) => void;
    onRemoveSubtask: (text: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [editLabel, setEditLabel] = useState(pb.label);

    const saveLabel = () => {
        if (editLabel.trim() && editLabel !== pb.label) onUpdate({ label: editLabel.trim() });
    };

    return (
        <div className="pb-config-card">
            <div className="pb-config-header" onClick={() => setExpanded(v => !v)}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="pb-config-dot" style={{ background: pb.color }} />
                    <span className="pb-config-label truncate">{pb.label}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        className="pb-config-delete"
                        onClick={e => { e.stopPropagation(); if (confirm(`Delete "${pb.label}"?`)) onDelete(); }}
                    >
                        <TrashIcon className="w-3 h-3" />
                    </button>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {expanded && (
                <div className="pb-config-body">
                    <div className="flex gap-2 mb-3">
                        <input
                            className="tile-edit-input flex-1"
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            onBlur={saveLabel}
                            onKeyDown={e => { if (e.key === 'Enter') saveLabel(); }}
                            placeholder="Bar label…"
                        />
                    </div>
                    <div className="mb-2">
                        <p className="tile-edit-label mb-1">Color</p>
                        <div className="tile-palette">
                            {PALETTE.map(c => (
                                <button key={c} className={`tile-swatch ${pb.color === c ? 'sel' : ''}`}
                                    style={{ background: c }} onClick={() => onUpdate({ color: c })} />
                            ))}
                        </div>
                    </div>
                    <p className="tile-edit-label mb-1">Linked Items</p>
                    <GranularTree
                        categories={categories}
                        trackedCatIds={pb.categoryIds}
                        trackedTaskTexts={pb.taskTexts}
                        trackedSubtaskTexts={pb.subtaskTexts}
                        onAddCat={onAddCat}
                        onRemoveCat={onRemoveCat}
                        onAddTask={onAddTask}
                        onRemoveTask={onRemoveTask}
                        onAddSubtask={onAddSubtask}
                        onRemoveSubtask={onRemoveSubtask}
                    />
                </div>
            )}
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
    onToggleTask, onToggleSubtask,
    onAddProgressBar, onUpdateProgressBar, onDeleteProgressBar,
    onAddPBCategory, onRemovePBCategory,
    onAddPBTask, onRemovePBTask,
    onAddPBSubtask, onRemovePBSubtask,
    allTasks,
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
    onAddProgressBar: (bucketId: string, label: string, color: string) => void;
    onUpdateProgressBar: (bucketId: string, pbId: string, updates: Partial<TrackerProgressBar>) => void;
    onDeleteProgressBar: (bucketId: string, pbId: string) => void;
    onAddPBCategory: (bucketId: string, pbId: string, categoryId: string) => void;
    onRemovePBCategory: (bucketId: string, pbId: string, categoryId: string) => void;
    onAddPBTask: (bucketId: string, pbId: string, taskText: string) => void;
    onRemovePBTask: (bucketId: string, pbId: string, taskText: string) => void;
    onAddPBSubtask: (bucketId: string, pbId: string, subtaskText: string) => void;
    onRemovePBSubtask: (bucketId: string, pbId: string, subtaskText: string) => void;
    allTasks: Task[];
}) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(bucket.name);
    const [addingPB, setAddingPB] = useState(false);
    const [newPBLabel, setNewPBLabel] = useState('');
    const [newPBColor, setNewPBColor] = useState(PALETTE[Math.floor(Math.random() * PALETTE.length)]);

    const saveName = () => { if (editName.trim() && editName !== bucket.name) onUpdate({ name: editName.trim() }); setEditMode(false); };

    const submitNewPB = () => {
        if (newPBLabel.trim()) {
            onAddProgressBar(bucket.id, newPBLabel.trim(), newPBColor);
            setNewPBLabel('');
            setAddingPB(false);
        }
    };

    // Compute progress for each custom progress bar
    const pbProgresses = bucket.progressBars.map(pb => {
        const items = resolveTrackedItems(pb.categoryIds, pb.taskTexts, pb.subtaskTexts, categories, allTasks, pb.color);
        return { pb, ...calcProgress(items) };
    });

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

                    {/* Bucket-level tracked items */}
                    <div className="tile-edit-section">
                        <label className="tile-edit-label mb-2 block">Overall Tracked Items</label>
                        <GranularTree
                            categories={categories}
                            trackedCatIds={bucket.categoryIds || []}
                            trackedTaskTexts={bucket.taskTexts || []}
                            trackedSubtaskTexts={bucket.subtaskTexts || []}
                            onAddCat={onAddCategory}
                            onRemoveCat={onRemoveCategory}
                            onAddTask={(text) => onAddBucketTask(bucket.id, text)}
                            onRemoveTask={(text) => onRemoveBucketTask(bucket.id, text)}
                            onAddSubtask={(text) => onAddBucketSubtask(bucket.id, text)}
                            onRemoveSubtask={(text) => onRemoveBucketSubtask(bucket.id, text)}
                        />
                    </div>

                    {/* Custom Progress Bars Config */}
                    <div className="tile-edit-section">
                        <div className="flex items-center justify-between mb-2">
                            <label className="tile-edit-label">Custom Progress Bars</label>
                            <button className="tile-edit-add-btn" onClick={() => setAddingPB(v => !v)}>
                                <PlusIcon className="w-3 h-3" /> Add Bar
                            </button>
                        </div>

                        {addingPB && (
                            <div className="pb-add-form">
                                <input
                                    className="tile-new-input text-sm mb-2"
                                    placeholder="Bar label (e.g. Morning Routine)"
                                    value={newPBLabel}
                                    onChange={e => setNewPBLabel(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') submitNewPB(); if (e.key === 'Escape') setAddingPB(false); }}
                                    autoFocus
                                />
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="tile-palette">
                                        {PALETTE.map(c => (
                                            <button key={c} className={`tile-swatch ${newPBColor === c ? 'sel' : ''}`}
                                                style={{ background: c }} onClick={() => setNewPBColor(c)} />
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="tile-btn-cancel" onClick={() => setAddingPB(false)}>Cancel</button>
                                        <button className="tile-btn-create" disabled={!newPBLabel.trim()} onClick={submitNewPB}>Create</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 mt-1">
                            {bucket.progressBars.map(pb => (
                                <PBConfigCard
                                    key={pb.id}
                                    pb={pb}
                                    bucketId={bucket.id}
                                    categories={categories}
                                    onUpdate={(u) => onUpdateProgressBar(bucket.id, pb.id, u)}
                                    onDelete={() => onDeleteProgressBar(bucket.id, pb.id)}
                                    onAddCat={(catId) => onAddPBCategory(bucket.id, pb.id, catId)}
                                    onRemoveCat={(catId) => onRemovePBCategory(bucket.id, pb.id, catId)}
                                    onAddTask={(text) => onAddPBTask(bucket.id, pb.id, text)}
                                    onRemoveTask={(text) => onRemovePBTask(bucket.id, pb.id, text)}
                                    onAddSubtask={(text) => onAddPBSubtask(bucket.id, pb.id, text)}
                                    onRemoveSubtask={(text) => onRemovePBSubtask(bucket.id, pb.id, text)}
                                />
                            ))}
                            {bucket.progressBars.length === 0 && !addingPB && (
                                <p className="text-xs text-gray-600 text-center py-2">No custom bars yet. Add one above.</p>
                            )}
                        </div>
                    </div>

                    <button className="tile-delete-btn mt-4" onClick={() => { if (confirm(`Delete "${bucket.name}"?`)) onDelete(); }}>
                        <TrashIcon className="w-3.5 h-3.5" /> Delete Dashboard
                    </button>
                </div>
            )}

            {/* Custom Progress Bars Display */}
            {!editMode && pbProgresses.length > 0 && (
                <div className="pb-bars-section">
                    {pbProgresses.map(({ pb, pct, completed, total }) => (
                        <ProgressBarRow key={pb.id} label={pb.label} pct={pct} completed={completed} total={total} color={pb.color} />
                    ))}
                </div>
            )}

            {/* Interactive Items */}
            {!editMode && trackedItems.length === 0 && pbProgresses.length === 0 && (
                <div className="tile-empty">
                    No items tracked today. <br /> Tap <GearIcon className="w-3.5 h-3.5 inline text-gray-400" /> to link some!
                </div>
            )}

            {!editMode && trackedItems.length === 0 && pbProgresses.length > 0 && (
                <div className="tile-empty" style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                    No overall items. Link items via <GearIcon className="w-3 h-3 inline text-gray-400" /> to see them here.
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
                            {viewMode === 'list' && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />}
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
    const {
        buckets, categories, tasks,
        onAddBucket, onUpdateBucket, onDeleteBucket, onToggleCollapsed,
        onAddCategoryToBucket, onRemoveCategoryFromBucket,
        onAddBucketTask, onRemoveBucketTask, onAddBucketSubtask, onRemoveBucketSubtask,
        onToggleTask, onToggleSubtask,
        onAddProgressBar, onUpdateProgressBar, onDeleteProgressBar,
        onAddPBCategory, onRemovePBCategory,
        onAddPBTask, onRemovePBTask,
        onAddPBSubtask, onRemovePBSubtask,
    } = props;
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

            <div className="tile-grid custom-scrollbar">
                {buckets.map(b => {
                    const trackedItems = resolveTrackedItems(b.categoryIds || [], b.taskTexts || [], b.subtaskTexts || [], categories, tasks, b.color);
                    const p = calcProgress(trackedItems);

                    return (
                        <div key={b.id} className={`tile-wrapper ${!b.collapsed ? 'expanded' : ''}`}>
                            {/* Tile Card */}
                            <button
                                className={`tile futuristic-tile ${!b.collapsed ? 'expanded' : ''}`}
                                style={{ '--tile-color': b.color } as any}
                                onClick={() => onToggleCollapsed(b.id)}
                            >
                                {/* Shimmer overlay */}
                                <div className="tile-shimmer" />
                                <div className="tile-top">
                                    {/* Big futuristic ring */}
                                    <div className="tile-ring-container" style={{ '--ring-color': b.color } as any}>
                                        <ProgressRing pct={p.pct} color={b.color} size={90} stroke={7} />
                                    </div>
                                    <div className="tile-info">
                                        <span className="tile-name">{b.name}</span>
                                        <span className="tile-count">{p.completed} / {p.total} items</span>
                                        {(b.progressBars || []).length > 0 && (
                                            <span className="tile-pb-hint">{b.progressBars.length} custom bar{b.progressBars.length !== 1 ? 's' : ''}</span>
                                        )}
                                    </div>
                                </div>
                                {/* Collapsible mini progress bars in tile (preview) */}
                                {(b.progressBars || []).length > 0 && (
                                    <div className="tile-mini-bars" onClick={e => e.stopPropagation()}>
                                        {b.progressBars.map(pb => {
                                            const items = resolveTrackedItems(pb.categoryIds, pb.taskTexts, pb.subtaskTexts, categories, tasks, pb.color);
                                            const pbP = calcProgress(items);
                                            return (
                                                <div key={pb.id} className="tile-mini-bar-row">
                                                    <span className="tile-mini-bar-label">{pb.label}</span>
                                                    <div className="tile-mini-bar-track">
                                                        <div className="tile-mini-bar-fill" style={{ width: `${pbP.pct}%`, background: pb.color, boxShadow: `0 0 6px ${pb.color}80` }} />
                                                    </div>
                                                    <span className="tile-mini-bar-pct" style={{ color: pb.color }}>{pbP.pct}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </button>

                            {/* Expanded Panel */}
                            <div className={`tile-panel-wrapper ${!b.collapsed ? 'open' : ''}`}>
                                <ExpandedPanel
                                    bucket={b}
                                    categories={categories}
                                    trackedItems={trackedItems}
                                    allTasks={tasks}
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
                            </div>
                        </div>
                    );
                })}

                {/* Create New Button */}
                {isCreating ? (
                    <div className="tile-wrapper">
                        <div className="tile-create-panel">
                            <NewBucketForm onAdd={handleCreate} onCancel={() => setIsCreating(false)} />
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
