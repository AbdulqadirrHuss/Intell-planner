import { useState, useRef, useEffect } from 'react';
import { TrackerBucket, TrackerProgressBar, Category, Task, Subtask } from './types';

export interface DashboardRowLayout {
    id: string;
    columns: number;
    matchHeight: boolean;
    slots: (string | null)[];
}

// ═══════════════════════════════════════════════ Icons ══
const GearIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const PlusIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const TrashIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const CheckCircleIcon = ({ className = '', checked }: { className?: string; checked?: boolean }) => (
    <svg className={className} viewBox="0 0 24 24" fill={checked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ChevronDownIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);
const ArrowLeftIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);
const LinkIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
);
const XIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

// ═══════════════════════════════════════════════ Props ══
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

// ═══════════════════════════════════════════════ Helpers ══
const PALETTE = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16', '#f97316'];

/** Count completed/total atomic units (subtasks are atoms; tasks without subtasks are atoms) */
export function calcPctFromTasks(
    categoryIds: string[], taskTexts: string[], subtaskTexts: string[],
    categories: Category[], tasks: Task[], fallbackColor: string
): { done: number; total: number; pct: number } {
    let done = 0, total = 0;
    tasks.forEach(t => {
        const isCatLinked = categoryIds.includes(t.categoryId);
        const isTaskLinked = taskTexts.some(x => x === t.text || x === `${t.categoryId}::${t.text}`);
        
        if (isCatLinked || isTaskLinked) {
            if (t.subtasks && t.subtasks.length > 0) {
                t.subtasks.forEach(st => { total++; if (st.completed) done++; });
            } else { total++; if (t.completed) done++; }
        } else if (t.subtasks) {
            t.subtasks.forEach(st => {
                if (subtaskTexts.some(x => x === st.text || x === `${t.categoryId}::${t.text}::${st.text}`)) {
                    total++; if (st.completed) done++;
                }
            });
        }
    });
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

// ═══════════════════════════════════════════════ Circular Ring ══
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

// ═══════════════════════════════════════════════ Tracker Detail Page ══
function TrackerDetailPage({
    bucket, categories, tasks,
    onBack, onUpdate, onDelete,
    onAddCategoryToBucket, onRemoveCategoryFromBucket,
    onAddBucketTask, onRemoveBucketTask,
    onAddBucketSubtask, onRemoveBucketSubtask,
    onToggleTask, onToggleSubtask,
    onAddProgressBar, onUpdateProgressBar, onDeleteProgressBar,
    onAddPBCategory, onRemovePBCategory,
    onAddPBTask, onRemovePBTask,
    onAddPBSubtask, onRemovePBSubtask,
}: {
    bucket: TrackerBucket; categories: Category[]; tasks: Task[];
    onBack: () => void;
    onUpdate: (u: Partial<TrackerBucket>) => void; onDelete: () => void;
    onAddCategoryToBucket: (id: string) => void; onRemoveCategoryFromBucket: (id: string) => void;
    onAddBucketTask: (bId: string, t: string) => void; onRemoveBucketTask: (bId: string, t: string) => void;
    onAddBucketSubtask: (bId: string, t: string) => void; onRemoveBucketSubtask: (bId: string, t: string) => void;
    onToggleTask: (id: string, s: boolean, r: boolean) => void;
    onToggleSubtask: (pId: string, id: string, s: boolean, r: boolean) => void;
    onAddProgressBar: (bId: string, label: string, color: string) => void;
    onUpdateProgressBar: (bId: string, pbId: string, u: Partial<TrackerProgressBar>) => void;
    onDeleteProgressBar: (bId: string, pbId: string) => void;
    onAddPBCategory: (bId: string, pbId: string, cId: string) => void; onRemovePBCategory: (bId: string, pbId: string, cId: string) => void;
    onAddPBTask: (bId: string, pbId: string, t: string) => void; onRemovePBTask: (bId: string, pbId: string, t: string) => void;
    onAddPBSubtask: (bId: string, pbId: string, t: string) => void; onRemovePBSubtask: (bId: string, pbId: string, t: string) => void;
}) {
    const progressBars = bucket.progressBars || [];

    // ── local state ──
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState(bucket.name);
    const [addingPB, setAddingPB] = useState(false);
    const [newPBLabel, setNewPBLabel] = useState('');
    const [newPBColor, setNewPBColor] = useState(PALETTE[4]);
    const [activeLinkPBId, setActiveLinkPBId] = useState<string | null>(null);
    const [editingPBId, setEditingPBId] = useState<string | null>(null);
    const [openMenuPBId, setOpenMenuPBId] = useState<string | null>(null);
    const [compactView, setCompactView] = useState(false);
    const [expandedTasks, setExpandedTasks] = useState<string[]>([]);

    const [dashboardRows, setDashboardRows] = useState<DashboardRowLayout[]>(() => {
        try { 
            const savedRows = localStorage.getItem(`td_rows_${bucket.id}`);
            if (savedRows) return JSON.parse(savedRows);
            const savedOrder = localStorage.getItem(`td_order_${bucket.id}`);
            if (savedOrder) {
                const order = JSON.parse(savedOrder);
                if (order.length > 0) return [{ id: `r-${Date.now()}`, columns: Math.max(3, Math.min(order.length, 5)), matchHeight: false, slots: order }];
            }
        } catch {}
        return [];
    });

    const saveDashboardRows = (rows: DashboardRowLayout[]) => {
        setDashboardRows(rows);
        localStorage.setItem(`td_rows_${bucket.id}`, JSON.stringify(rows));
    };

    const [layoutEditMode, setLayoutEditMode] = useState(false);
    
    // Style settings
    const saveStyle = (key: string, val: string) => { localStorage.setItem(key, val); return val; };
    const [cardPad, setCardPad] = useState(() => localStorage.getItem(`td_pad_${bucket.id}`) || '16px 20px');
    const [titleSize, setTitleSize] = useState(() => localStorage.getItem(`td_tsz_${bucket.id}`) || '0.72rem');
    const [pctSize, setPctSize] = useState(() => localStorage.getItem(`td_psz_${bucket.id}`) || '2.2rem');

    const [draggedItem, setDraggedItem] = useState<{ id: string, sourceRowId: string, sourceSlotIdx: number } | null>(null);
    const [dragOverTarget, setDragOverTarget] = useState<{ rowId: string, slotIdx: number } | null>(null);

    const { done, total, pct } = calcPctFromTasks(
        bucket.categoryIds || [], bucket.taskTexts || [], bucket.subtaskTexts || [],
        categories, tasks, bucket.color
    );

    const saveName = () => { if (editName.trim() && editName !== bucket.name) onUpdate({ name: editName.trim() }); };

    const submitPB = () => {
        if (newPBLabel.trim()) {
            onAddProgressBar(bucket.id, newPBLabel.trim(), newPBColor);
            setNewPBLabel(''); setAddingPB(false);
        }
    };

    // Active linking bar
    const activeLinkPB = progressBars.find(pb => pb.id === activeLinkPBId) ?? null;

    // Build category buckets for the card display
    // Show all categories that have tasks today, whether tracked or not
    const catGroups = categories.map(cat => {
        const catTasks = tasks.filter(t => t.categoryId === cat.id);
        return { cat, catTasks };
    }).filter(g => g.catTasks.length > 0);

    // Helper: is a task/subtask tracked by bucket
    const isTaskTrackedByBucket = (t: Task) =>
        (bucket.categoryIds || []).includes(t.categoryId) || (bucket.taskTexts || []).some(x => x === t.text || x === `${t.categoryId}::${t.text}`);
    const isSubtaskTrackedByBucket = (t: Task, st: Subtask) =>
        isTaskTrackedByBucket(t) || (bucket.subtaskTexts || []).some(x => x === st.text || x === `${t.categoryId}::${t.text}::${st.text}`);

    // Helper: is a task/subtask linked to a specific progress bar
    const isTaskLinkedToPB = (pb: TrackerProgressBar, t: Task) =>
        pb.categoryIds.includes(t.categoryId) || pb.taskTexts.some(x => x === t.text || x === `${t.categoryId}::${t.text}`);
    const isSubtaskLinkedToPB = (pb: TrackerProgressBar, t: Task, st: Subtask) =>
        isTaskLinkedToPB(pb, t) || pb.subtaskTexts.some(x => x === st.text || x === `${t.categoryId}::${t.text}::${st.text}`);

    // Toggle link of a task to the active progress bar
    const toggleTaskInPB = (pb: TrackerProgressBar, t: Task, e: React.MouseEvent) => {
        e.stopPropagation();
        const key = `${t.categoryId}::${t.text}`;
        const oldKey = t.text;
        if (pb.taskTexts.includes(key)) onRemovePBTask(bucket.id, pb.id, key);
        else if (pb.taskTexts.includes(oldKey)) onRemovePBTask(bucket.id, pb.id, oldKey);
        else onAddPBTask(bucket.id, pb.id, key);
    };
    const toggleCatInPB = (pb: TrackerProgressBar, catId: string) => {
        if (pb.categoryIds.includes(catId)) onRemovePBCategory(bucket.id, pb.id, catId);
        else onAddPBCategory(bucket.id, pb.id, catId);
    };
    const toggleSubtaskInPB = (pb: TrackerProgressBar, t: Task, st: Subtask, e: React.MouseEvent) => {
        e.stopPropagation();
        const key = `${t.categoryId}::${t.text}::${st.text}`;
        const oldKey = st.text;
        if (pb.subtaskTexts.includes(key)) onRemovePBSubtask(bucket.id, pb.id, key);
        else if (pb.subtaskTexts.includes(oldKey)) onRemovePBSubtask(bucket.id, pb.id, oldKey);
        else onAddPBSubtask(bucket.id, pb.id, key);
    };

    const isAnyTracked = (t: Task) => isTaskTrackedByBucket(t) || progressBars.some(pb => isTaskLinkedToPB(pb, t));
    const isSubAnyTracked = (t: Task, st: Subtask) => isSubtaskTrackedByBucket(t, st) || progressBars.some(pb => isSubtaskLinkedToPB(pb, t, st));

    // Filter categories to only show tracked items (unless we're linking or configuring)
    const effectiveCatGroups = catGroups.map(g => {
        if (activeLinkPBId || editMode) return g;
        const ft = g.catTasks.filter(t => isAnyTracked(t) || (t.subtasks && t.subtasks.some(st => isSubAnyTracked(t, st))));
        return { ...g, catTasks: ft };
    }).filter(g => g.catTasks.length > 0);

    const activeLayoutIds = dashboardRows.flatMap(r => r.slots).filter(id => id !== null) as string[];
    const unassignedCatGroups = effectiveCatGroups.filter(g => !activeLayoutIds.includes(g.cat.id));

    // Custom 2D Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, catId: string, rowId: string, slotIdx: number) => {
        setDraggedItem({ id: catId, sourceRowId: rowId, sourceSlotIdx: slotIdx });
        if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', catId); }
    };
    const handleDragOver = (e: React.DragEvent, rowId: string, slotIdx: number) => {
        e.preventDefault();
        if (draggedItem && (draggedItem.sourceRowId !== rowId || draggedItem.sourceSlotIdx !== slotIdx)) {
            setDragOverTarget({ rowId, slotIdx });
        }
    };
    const handleDrop = (e: React.DragEvent, targetRowId: string, targetSlotIdx: number) => {
        e.preventDefault();
        setDragOverTarget(null);
        if (!draggedItem) return;
        if (draggedItem.sourceRowId === targetRowId && draggedItem.sourceSlotIdx === targetSlotIdx) {
            setDraggedItem(null); return;
        }

        const newRows = JSON.parse(JSON.stringify(dashboardRows)) as DashboardRowLayout[];
        
        // Remove from source
        if (draggedItem.sourceRowId !== 'unassigned') {
            const srcRow = newRows.find(r => r.id === draggedItem.sourceRowId);
            if (srcRow) srcRow.slots[draggedItem.sourceSlotIdx] = null;
        }

        // Add to target
        if (targetRowId !== 'unassigned') {
            const tgtRow = newRows.find(r => r.id === targetRowId);
            if (tgtRow) {
                tgtRow.slots[targetSlotIdx] = draggedItem.id;
            }
        }

        saveDashboardRows(newRows);
        setDraggedItem(null);
    };

    return (
        <div className="tracker-detail-page">

            {/* ══════════ HEADER ══════════ */}
            <div className="td-header">
                <button className="td-back-btn" onClick={onBack} title="Back to trackers">
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Trackers</span>
                </button>

                <div style={{ '--ring-color': bucket.color } as any}>
                    <ProgressRing pct={pct} color={bucket.color} size={72} stroke={6} />
                </div>

                <div className="td-title-block">
                    {editMode
                        ? <input className="tile-edit-input text-xl font-bold mb-1" value={editName}
                            onChange={e => setEditName(e.target.value)} onBlur={saveName}
                            onKeyDown={e => { if (e.key === 'Enter') saveName(); }} autoFocus />
                        : <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{bucket.name}</h2>
                    }
                    <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                        {done} / {total} items complete · {pct}%
                    </p>
                </div>

                <div className="td-header-actions">
                    <button className="td-add-pb-btn" onClick={() => { setAddingPB(v => !v); setActiveLinkPBId(null); }}>
                        <PlusIcon className="w-4 h-4" />
                        Add Progress Bar
                    </button>
                    <button 
                        className={`td-gear-btn ${compactView ? 'active' : ''}`} 
                        onClick={() => setCompactView(v => !v)} 
                        title={compactView ? "Normal View" : "Compact View"}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                    </button>
                    <button className={`td-gear-btn ${editMode ? 'active' : ''}`} onClick={() => setEditMode(v => !v)} title="Settings">
                        <GearIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ══ Linking mode banner ══ */}
            {activeLinkPB && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 16px', borderRadius: 12, marginBottom: 16,
                    background: `linear-gradient(90deg, ${activeLinkPB.color}22, ${activeLinkPB.color}10)`,
                    border: `1px solid ${activeLinkPB.color}55`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: activeLinkPB.color, display: 'inline-block', boxShadow: `0 0 8px ${activeLinkPB.color}` }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>
                            Linking to: <span style={{ color: activeLinkPB.color }}>{activeLinkPB.label}</span>
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#71717a' }}>
                            — tap tasks or categories below to link them
                        </span>
                    </div>
                    <button onClick={() => setActiveLinkPBId(null)} style={{ color: '#71717a', padding: 4 }}>
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ══ Add bar form ══ */}
            {addingPB && (
                <div className="td-add-pb-form" style={{ marginBottom: 20 }}>
                    <p className="tile-edit-label" style={{ marginBottom: 8 }}>New Progress Bar</p>
                    <input
                        className="tile-edit-input"
                        placeholder="Bar label (e.g. Morning Routine, Deep Work…)"
                        value={newPBLabel}
                        onChange={e => setNewPBLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') submitPB(); if (e.key === 'Escape') setAddingPB(false); }}
                        autoFocus
                        style={{ marginBottom: 10, width: '100%' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div className="tile-palette">
                            {PALETTE.map(c => <button key={c} className={`tile-swatch ${newPBColor === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setNewPBColor(c)} />)}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="tile-btn-cancel" onClick={() => setAddingPB(false)}>Cancel</button>
                            <button className="tile-btn-create" disabled={!newPBLabel.trim()} onClick={submitPB}>Create Bar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════ PROGRESS BARS ══════════ */}
            {progressBars.length > 0 && (
                <div className="td-section">
                    <p className="td-section-title" style={{ marginBottom: 12 }}>Progress Bars</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {progressBars.map(pb => {
                            const prog = calcPctFromTasks(pb.categoryIds, pb.taskTexts, pb.subtaskTexts, categories, tasks, pb.color);
                            const isLinking = activeLinkPBId === pb.id;
                            const isEditingThis = editingPBId === pb.id;
                            const isOpenMenu = openMenuPBId === pb.id;

                            return (
                                <div key={pb.id} className="td-pb-mini-widget" style={{ 
                                    display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', 
                                    padding: '8px 12px 8px 8px', borderRadius: 30, border: isLinking ? `1px solid ${pb.color}` : '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: isLinking ? `0 0 12px ${pb.color}40` : 'none', transition: 'all 0.2s', minWidth: 160
                                }}>
                                    <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
                                        <ProgressRing pct={prog.pct} color={pb.color} size={34} stroke={3.5} />
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        {isEditingThis ? (
                                            <PBLabelEdit pb={pb} onSave={label => { onUpdateProgressBar(bucket.id, pb.id, { label }); setEditingPBId(null); }} onCancel={() => setEditingPBId(null)} />
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e4e4e7', cursor: 'pointer', whiteSpace: 'nowrap' }} onDoubleClick={() => setEditingPBId(pb.id)}>{pb.label}</span>
                                        )}
                                        <span style={{ fontSize: '0.65rem', color: '#a1a1aa', fontWeight: 600 }}>{prog.done}/{prog.total} items</span>
                                    </div>
                                    
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => setOpenMenuPBId(isOpenMenu ? null : pb.id)}
                                            style={{ background: 'transparent', color: '#71717a', padding: 4, transition: 'color 0.2s' }}
                                        >
                                            <GearIcon className="w-5 h-5" />
                                        </button>
                                        
                                        {isOpenMenu && (
                                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#1f1f23', padding: 8, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
                                                <button 
                                                    onClick={() => { setActiveLinkPBId(isLinking ? null : pb.id); setOpenMenuPBId(null); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: isLinking ? pb.color : '#e4e4e7', padding: '8px 10px', borderRadius: 8, background: isLinking ? `${pb.color}20` : 'transparent', textAlign: 'left', width: '100%', transition: 'background 0.15s' }}
                                                    onMouseEnter={e => { if(!isLinking) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                                    onMouseLeave={e => { if(!isLinking) e.currentTarget.style.background = 'transparent' }}
                                                >
                                                    <LinkIcon className="w-4 h-4" /> {isLinking ? 'Done Linking' : 'Link Tracker Items'}
                                                </button>
                                                <button 
                                                    onClick={() => { setEditingPBId(pb.id); setOpenMenuPBId(null); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#e4e4e7', padding: '8px 10px', borderRadius: 8, background: 'transparent', textAlign: 'left', width: '100%', transition: 'background 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                                                    Rename Bar
                                                </button>
                                                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                                                <button 
                                                    onClick={() => { if (confirm(`Delete "${pb.label}"?`)) { onDeleteProgressBar(bucket.id, pb.id); if (activeLinkPBId === pb.id) setActiveLinkPBId(null); } setOpenMenuPBId(null); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', padding: '8px 10px', borderRadius: 8, background: 'transparent', textAlign: 'left', width: '100%', transition: 'background 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <TrashIcon className="w-4 h-4" /> Delete Bar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══════════ EDIT PANEL (bucket config) ══════════ */}
            {editMode && (
                <div className="tile-edit-panel" style={{ marginBottom: 24 }}>
                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Color</label>
                        <div className="tile-palette">
                            {PALETTE.map(c => <button key={c} className={`tile-swatch ${bucket.color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => onUpdate({ color: c })} />)}
                        </div>
                    </div>
                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Overall Tracked Categories</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                            {categories.map(cat => {
                                const linked = (bucket.categoryIds || []).includes(cat.id);
                                return (
                                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, display: 'inline-block' }} />
                                            <span style={{ fontSize: '0.85rem', color: 'white' }}>{cat.name}</span>
                                        </div>
                                        <button
                                            onClick={() => linked ? onRemoveCategoryFromBucket(cat.id) : onAddCategoryToBucket(cat.id)}
                                            style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: linked ? cat.color : 'rgba(255,255,255,0.08)', color: linked ? 'white' : '#a1a1aa', transition: 'all 0.15s', border: 'none' }}
                                        >
                                            {linked ? '✓ Linked' : 'Link All'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <button className="td-delete-btn" onClick={() => { if (confirm(`Delete "${bucket.name}"?`)) { onDelete(); onBack(); } }}>
                        <TrashIcon className="w-3.5 h-3.5" /> Delete Tracker
                    </button>
                </div>
            )}

                                    {/* ══════════ CATEGORY TASK CARDS ══════════ */}
            <div className="td-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p className="td-section-title" style={{ margin: 0 }}>
                        {activeLinkPB ? `Tap tasks to link → ${activeLinkPB.label}` : 'Dashboard Layout'}
                    </p>
                    {(!activeLinkPBId && !editMode) && (
                        <button 
                            onClick={() => setLayoutEditMode(!layoutEditMode)}
                            style={{ 
                                padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, border: 'none',
                                background: layoutEditMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', color: layoutEditMode ? '#ef4444' : 'white', transition: 'all 0.2s' 
                            }}
                        >
                            {layoutEditMode ? 'Close Editor' : 'Edit Layout'}
                        </button>
                    )}
                </div>

                {effectiveCatGroups.length === 0 ? (
                    <div className="tile-empty">No items tracked yet. Tap the Gear icon or "Add Progress Bar" to link tasks.</div>
                ) : (
                    <div className="td-dashboard-engine">
                        {dashboardRows.map((row) => (
                            <div key={row.id} className="td-dash-row-container" style={{ marginBottom: 24 }}>
                                {layoutEditMode && (
                                     <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                         <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase' }}>Row Config</span>
                                         <button onClick={() => {
                                             const newRows = [...dashboardRows];
                                             const r = newRows.find(x => x.id === row.id)!;
                                             r.columns = Math.min(6, r.columns + 1);
                                             r.slots.push(null);
                                             saveDashboardRows(newRows);
                                         }} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem' }}>+ Column</button>
                                         <button onClick={() => {
                                             const newRows = [...dashboardRows];
                                             const r = newRows.find(x => x.id === row.id)!;
                                             if (r.columns > 1) { r.columns--; r.slots.pop(); }
                                             saveDashboardRows(newRows);
                                         }} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem' }}>- Column</button>
                                         <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', marginLeft: 16 }}>
                                             <input type="checkbox" checked={row.matchHeight} onChange={e => {
                                                 const newRows = [...dashboardRows];
                                                 newRows.find(x => x.id === row.id)!.matchHeight = e.target.checked;
                                                 saveDashboardRows(newRows);
                                             }} />
                                             Match Heights
                                         </label>
                                         <button onClick={() => {
                                             saveDashboardRows(dashboardRows.filter(x => x.id !== row.id));
                                         }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem', marginLeft: 'auto' }}>Remove Row</button>
                                     </div>
                                )}
                                
                                <div style={{ 
                                    display: 'grid', gap: compactView ? 12 : 20, 
                                    gridTemplateColumns: `repeat(${row.columns}, 1fr)`,
                                    alignItems: row.matchHeight ? 'stretch' : 'start'
                                }}>
                                     {row.slots.map((slottedCatId, slotIdx) => {
                                          if (!slottedCatId) {
                                              return (
                                                  <div key={`empty-${slotIdx}`} 
                                                       className={`td-empty-slot ${dragOverTarget?.rowId === row.id && dragOverTarget?.slotIdx === slotIdx ? 'drag-over' : ''}`}
                                                       style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: 'rgba(0,0,0,0.1)' }}
                                                       onDragOver={e => handleDragOver(e, row.id, slotIdx)}
                                                       onDragLeave={() => setDragOverTarget(null)}
                                                       onDrop={e => handleDrop(e, row.id, slotIdx)}
                                                  >
                                                      <span style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>Empty Slot</span>
                                                  </div>
                                              )
                                          }
                                          return renderCategoryCard(slottedCatId, row.id, slotIdx);
                                     })}
                                </div>
                            </div>
                        ))}
                        
                        {layoutEditMode && (
                             <button onClick={() => {
                                 saveDashboardRows([...dashboardRows, { id: `r-${Date.now()}`, columns: 3, matchHeight: false, slots: [null, null, null] }]);
                             }} style={{ width: '100%', padding: '12px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 700, marginBottom: 32 }}>+ Add New Row</button>
                        )}
                        
                        {(unassignedCatGroups.length > 0 || layoutEditMode) && (
                            <div className="td-unassigned-pool" style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)' }} 
                                 onDragOver={e => handleDragOver(e, 'unassigned', 0)}
                                 onDragLeave={() => setDragOverTarget(null)}
                                 onDrop={e => {
                                      // Native drop into unassigned area logic natively resets via handleDrop checking 'unassigned'
                                      handleDrop(e, 'unassigned', 0);
                                 }}
                            >
                                <p style={{ fontSize: '0.8rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, marginBottom: 16 }}>Unassigned Categories Pool</p>
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(240px, 1fr))`, gap: 16, minHeight: 120, border: dragOverTarget?.rowId === 'unassigned' ? '1px dashed #a1a1aa' : 'none', padding: 8, borderRadius: 12 }}>
                                    {unassignedCatGroups.map((g, idx) => renderCategoryCard(g.cat.id, 'unassigned', idx))}
                                    {unassignedCatGroups.length === 0 && <div style={{ color: '#52525b', fontSize: '0.8rem' }}>Drag here to return to pool</div>}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════ Inline label editor for PB ══
function PBLabelEdit({ pb, onSave, onCancel }: { pb: TrackerProgressBar; onSave: (l: string) => void; onCancel: () => void }) {
    const [v, setV] = useState(pb.label);
    return (
        <input
            className="tile-edit-input"
            style={{ padding: '3px 8px', fontSize: '0.85rem', fontWeight: 700 }}
            value={v} onChange={e => setV(e.target.value)} autoFocus
            onBlur={() => { if (v.trim()) onSave(v.trim()); else onCancel(); }}
            onKeyDown={e => { if (e.key === 'Enter' && v.trim()) onSave(v.trim()); if (e.key === 'Escape') onCancel(); }}
            onClick={e => e.stopPropagation()}
        />
    );
}

// ═══════════════════════════════════════════════ New Bucket Form ══
function NewBucketForm({ onAdd, onCancel }: { onAdd: (name: string, color: string) => void; onCancel: () => void }) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(PALETTE[0]);
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { ref.current?.focus(); }, []);
    const submit = () => { if (name.trim()) onAdd(name.trim(), color); };
    return (
        <div className="tile-new-form">
            <input ref={ref} className="tile-new-input" placeholder="Tracker name…" value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }} />
            <div className="tile-new-row">
                <div className="tile-palette">{PALETTE.map(c => <button key={c} className={`tile-swatch ${color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />)}</div>
                <div className="tile-new-actions">
                    <button className="tile-btn-cancel" onClick={onCancel}>Cancel</button>
                    <button className="tile-btn-create" disabled={!name.trim()} onClick={submit}>Create</button>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════ Main export ══
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

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const selectedBucket = buckets.find(b => b.id === selectedId);

    if (selectedBucket) {
        return (
            <TrackerDetailPage
                bucket={selectedBucket}
                categories={categories}
                tasks={tasks}
                onBack={() => setSelectedId(null)}
                onUpdate={u => onUpdateBucket(selectedBucket.id, u)}
                onDelete={() => { onDeleteBucket(selectedBucket.id); setSelectedId(null); }}
                onAddCategoryToBucket={id => onAddCategoryToBucket(selectedBucket.id, id)}
                onRemoveCategoryFromBucket={id => onRemoveCategoryFromBucket(selectedBucket.id, id)}
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

    // ══ Grid overview ══
    return (
        <div className="tracker-buckets-root">
            <div className="tracker-buckets-header">
                <h3 className="tracker-buckets-title">Trackers</h3>
            </div>
            <div className="tile-grid">
                {buckets.map(b => {
                    const { done, total, pct } = calcPctFromTasks(b.categoryIds || [], b.taskTexts || [], b.subtaskTexts || [], categories, tasks, b.color);
                    const bars = b.progressBars || [];
                    return (
                        <button key={b.id} className="tile futuristic-tile" style={{ '--tile-color': b.color } as any} onClick={() => setSelectedId(b.id)}>
                            <div className="tile-shimmer" />
                            <div className="tile-top">
                                <div className="tile-ring-container" style={{ '--ring-color': b.color } as any}>
                                    <ProgressRing pct={pct} color={b.color} size={90} stroke={7} />
                                </div>
                                <div className="tile-info">
                                    <span className="tile-name">{b.name}</span>
                                    <span className="tile-count">{done}/{total} items</span>
                                    {bars.length > 0 && <span className="tile-pb-hint">{bars.length} bar{bars.length !== 1 ? 's' : ''}</span>}
                                </div>
                            </div>
                            {bars.length > 0 && (
                                <div className="tile-mini-bars">
                                    {bars.map(pb => {
                                        const pp = calcPctFromTasks(pb.categoryIds, pb.taskTexts, pb.subtaskTexts, categories, tasks, pb.color);
                                        return (
                                            <div key={pb.id} className="tile-mini-bar-row">
                                                <span className="tile-mini-bar-label">{pb.label}</span>
                                                <div className="tile-mini-bar-track">
                                                    <div className="tile-mini-bar-fill" style={{ width: `${pp.pct}%`, background: pb.color, boxShadow: `0 0 6px ${pb.color}80` }} />
                                                </div>
                                                <span className="tile-mini-bar-pct" style={{ color: pb.color }}>{pp.pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </button>
                    );
                })}
                {isCreating ? (
                    <div className="tile-wrapper">
                        <div className="tile-create-panel">
                            <NewBucketForm onAdd={(name, color) => { onAddBucket(name, 'independent', color); setIsCreating(false); }} onCancel={() => setIsCreating(false)} />
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
