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
                <text x="50%" y={size > 40 ? "44%" : "50%"} textAnchor="middle" dy="0.35em" fill="white" fontSize={size > 70 ? '18' : '12'} fontWeight="800" fontFamily="Inter, sans-serif">{pct}%</text>
                {size > 40 && (
                    <text x="50%" y="64%" textAnchor="middle" fill={color} fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif" opacity={0.85}>DONE</text>
                )}
            </svg>
        </div>
    );
}

// ═══════════════════════════════════════════════ Unified Tracker Board ══
// One seamless board for ALL trackers: a single header row with every tracker's
// counter side by side, one shared set of actions (Add Progress Bar, compact
// view, settings), one shared Progress Bars row and one shared Dashboard Layout.
// Each tracker still counts its own progress independently.

const UNIFIED_ROWS_KEY = 'td_rows_unified';
const BOARD_COLS = 2; // dashboard boxes per row (matches the tracker header columns)

/** Build the shared dashboard layout, migrating any old per-tracker layouts once. */
function loadUnifiedRows(buckets: TrackerBucket[]): DashboardRowLayout[] {
    try {
        const saved = localStorage.getItem(UNIFIED_ROWS_KEY);
        if (saved) return JSON.parse(saved);

        const ids: string[] = [];
        let maxCols = 0;
        buckets.forEach(b => {
            let rows: DashboardRowLayout[] = [];
            const savedRows = localStorage.getItem(`td_rows_${b.id}`);
            if (savedRows) rows = JSON.parse(savedRows);
            else {
                const savedOrder = localStorage.getItem(`td_order_${b.id}`);
                if (savedOrder) {
                    const order = JSON.parse(savedOrder);
                    if (order.length > 0) rows = [{ id: '', columns: Math.max(3, Math.min(order.length, 5)), matchHeight: false, slots: order }];
                }
            }
            rows.forEach(r => {
                maxCols = Math.max(maxCols, r.columns || 0);
                (r.slots || []).forEach(s => { if (s && !ids.includes(s)) ids.push(s); });
            });
        });
        if (ids.length === 0) return [];

        // Pack every tracker's boxes into shared rows so they sit side by side
        const cols = ids.length <= 4 ? ids.length : Math.min(Math.max(maxCols, 3), 5);
        const rows: DashboardRowLayout[] = [];
        for (let i = 0; i < ids.length; i += cols) {
            const slots: (string | null)[] = ids.slice(i, i + cols);
            while (slots.length < cols) slots.push(null);
            rows.push({ id: `r-${Date.now()}-${i}`, columns: cols, matchHeight: false, slots });
        }
        return rows;
    } catch {
        return [];
    }
}

function TrackerBoard({
    buckets, categories, tasks,
    onAddBucket, onUpdateBucket, onDeleteBucket,
    onAddCategoryToBucket, onRemoveCategoryFromBucket,
    onAddBucketTask, onRemoveBucketTask,
    onToggleTask, onToggleSubtask,
    onAddProgressBar, onUpdateProgressBar, onDeleteProgressBar,
    onAddPBCategory, onRemovePBCategory,
    onAddPBTask, onRemovePBTask,
    onAddPBSubtask, onRemovePBSubtask,
}: Props) {
    // ── local state ──
    const [editMode, setEditMode] = useState(false);
    const [settingsBucketId, setSettingsBucketId] = useState<string | null>(null);
    const [isCreatingTracker, setIsCreatingTracker] = useState(false);
    const [addingPB, setAddingPB] = useState(false);
    const [newPBLabel, setNewPBLabel] = useState('');
    const [newPBColor, setNewPBColor] = useState(PALETTE[4]);
    const [newPBBucketId, setNewPBBucketId] = useState<string | null>(null);
    const [activeLink, setActiveLink] = useState<{ bucketId: string; pbId: string } | null>(null);
    const [editingPBId, setEditingPBId] = useState<string | null>(null);
    const [openMenuPBId, setOpenMenuPBId] = useState<string | null>(null);
    const [compactView, setCompactView] = useState(false);
    const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
    // Feature 3 — dopamine animation state
    const [completingTaskIds, setCompletingTaskIds] = useState<string[]>([]);
    const [autoExpandCompleted, setAutoExpandCompleted] = useState<Record<string, boolean>>({});
    const [bouncingBadgeCatId, setBouncingBadgeCatId] = useState<string | null>(null);
    // Feature 1 — edit panel per-cat task expansion
    const [expandedEditCats, setExpandedEditCats] = useState<string[]>([]);

    const [dashboardRows, setDashboardRows] = useState<DashboardRowLayout[]>(() => loadUnifiedRows(buckets));

    const saveDashboardRows = (rows: DashboardRowLayout[]) => {
        setDashboardRows(rows);
        localStorage.setItem(UNIFIED_ROWS_KEY, JSON.stringify(rows));
    };

    const [layoutEditMode, setLayoutEditMode] = useState(false);

    // Style settings (shared; falls back to the first tracker's saved values)
    const firstId = buckets[0]?.id;
    const [cardPad] = useState(() => localStorage.getItem('td_pad_unified') || localStorage.getItem(`td_pad_${firstId}`) || '16px 20px');
    const [titleSize] = useState(() => localStorage.getItem('td_tsz_unified') || localStorage.getItem(`td_tsz_${firstId}`) || '0.72rem');
    const [pctSize] = useState(() => localStorage.getItem('td_psz_unified') || localStorage.getItem(`td_psz_${firstId}`) || '2.2rem');

    const [draggedItem, setDraggedItem] = useState<{ id: string, sourceRowId: string, sourceSlotIdx: number } | null>(null);
    const [dragOverTarget, setDragOverTarget] = useState<{ rowId: string, slotIdx: number } | null>(null);

    // ── derived ──
    const settingsBucket = buckets.find(b => b.id === settingsBucketId) ?? buckets[0];
    const pbTargetBucketId = (newPBBucketId && buckets.some(b => b.id === newPBBucketId)) ? newPBBucketId : (settingsBucket?.id ?? '');
    const allPBs = buckets.flatMap(b => (b.progressBars || []).map(pb => ({ pb, bucket: b })));
    const activeLinkPB = activeLink ? (allPBs.find(x => x.pb.id === activeLink.pbId)?.pb ?? null) : null;
    const activeLinkPBId = activeLinkPB ? activeLinkPB.id : null;
    const linkBucketId = activeLink?.bucketId ?? '';

    const openSettingsFor = (bucketId: string) => {
        if (editMode && settingsBucket?.id === bucketId) { setEditMode(false); return; }
        setSettingsBucketId(bucketId);
        setEditMode(true);
        setActiveLink(null);
    };

    const submitPB = () => {
        if (newPBLabel.trim() && pbTargetBucketId) {
            onAddProgressBar(pbTargetBucketId, newPBLabel.trim(), newPBColor);
            setNewPBLabel(''); setAddingPB(false);
        }
    };

    // Build category buckets for the card display
    // Show all categories that have tasks today, whether tracked or not
    const catGroups = categories.map(cat => {
        const catTasks = tasks.filter(t => t.categoryId === cat.id);
        return { cat, catTasks };
    }).filter(g => g.catTasks.length > 0);

    // Helper: is a task/subtask tracked by a given tracker
    const isTaskTrackedByBucket = (b: TrackerBucket, t: Task) =>
        (b.categoryIds || []).includes(t.categoryId) || (b.taskTexts || []).some(x => x === t.text || x === `${t.categoryId}::${t.text}`);
    const isSubtaskTrackedByBucket = (b: TrackerBucket, t: Task, st: Subtask) =>
        isTaskTrackedByBucket(b, t) || (b.subtaskTexts || []).some(x => x === st.text || x === `${t.categoryId}::${t.text}::${st.text}`);

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
        if (pb.taskTexts.includes(key)) onRemovePBTask(linkBucketId, pb.id, key);
        else if (pb.taskTexts.includes(oldKey)) onRemovePBTask(linkBucketId, pb.id, oldKey);
        else onAddPBTask(linkBucketId, pb.id, key);
    };
    const toggleCatInPB = (pb: TrackerProgressBar, catId: string) => {
        if (pb.categoryIds.includes(catId)) onRemovePBCategory(linkBucketId, pb.id, catId);
        else onAddPBCategory(linkBucketId, pb.id, catId);
    };
    const toggleSubtaskInPB = (pb: TrackerProgressBar, t: Task, st: Subtask, e: React.MouseEvent) => {
        e.stopPropagation();
        const key = `${t.categoryId}::${t.text}::${st.text}`;
        const oldKey = st.text;
        if (pb.subtaskTexts.includes(key)) onRemovePBSubtask(linkBucketId, pb.id, key);
        else if (pb.subtaskTexts.includes(oldKey)) onRemovePBSubtask(linkBucketId, pb.id, oldKey);
        else onAddPBSubtask(linkBucketId, pb.id, key);
    };

    // Tracked by ANY tracker or ANY progress bar
    const isAnyTracked = (t: Task) =>
        buckets.some(b => isTaskTrackedByBucket(b, t)) || allPBs.some(({ pb }) => isTaskLinkedToPB(pb, t));
    const isSubAnyTracked = (t: Task, st: Subtask) =>
        buckets.some(b => isSubtaskTrackedByBucket(b, t, st)) || allPBs.some(({ pb }) => isSubtaskLinkedToPB(pb, t, st));

    // Feature 3 — dopamine animation trigger
    const triggerComplete = (taskId: string, catId: string, wasCompleted: boolean) => {
        if (wasCompleted) return; // only animate going TO completed
        setCompletingTaskIds(prev => [...prev, taskId]);
        setBouncingBadgeCatId(catId);
        setTimeout(() => {
            setCompletingTaskIds(prev => prev.filter(id => id !== taskId));
            setBouncingBadgeCatId(null);
        }, 520);
        setAutoExpandCompleted(prev => ({ ...prev, [catId]: true }));
        setTimeout(() => {
            setAutoExpandCompleted(prev => ({ ...prev, [catId]: false }));
        }, 2400);
    };


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

    const renderCategoryCard = (catId: string, rowId: string, slotIdx: number) => {
        const group = effectiveCatGroups.find(g => g.cat.id === catId);
        if (!group) return null;
        const { cat, catTasks } = group;
        const allTasksInCat = catTasks;
        const catLinkedToPB = activeLinkPB ? activeLinkPB.categoryIds.includes(cat.id) : false;

        let totalCatAtoms = 0;
        let doneCatAtoms = 0;
        allTasksInCat.forEach(t => {
            const hasSubtasks = t.subtasks && t.subtasks.length > 0;
            if (hasSubtasks) {
                t.subtasks.forEach(st => {
                    if (activeLinkPBId || editMode || isSubAnyTracked(t, st) || isAnyTracked(t)) {
                        totalCatAtoms++;
                        if (st.completed) doneCatAtoms++;
                    }
                });
            } else {
                totalCatAtoms++;
                if (t.completed) doneCatAtoms++;
            }
        });
        const catPct = totalCatAtoms === 0 ? 0 : Math.round((doneCatAtoms / totalCatAtoms) * 100);

        // Feature 3: split active vs completed tasks for the dopamine drawer
        const activeTasks = allTasksInCat.filter(t => !t.completed);
        const completedTasks = allTasksInCat.filter(t => t.completed);
        const isDrawerOpen = !!(autoExpandCompleted[cat.id]);
        const isBadgeBouncing = bouncingBadgeCatId === cat.id;

        const renderTaskPill = (t: Task) => {
            const taskLinkedToPB = activeLinkPB ? isTaskLinkedToPB(activeLinkPB, t) : false;
            const catLinkedToPBForTask = activeLinkPB ? activeLinkPB.categoryIds.includes(t.categoryId) : false;
            const hasSubtasks = t.subtasks && t.subtasks.length > 0;
            const isExpanded = expandedTasks.includes(t.id);
            const isCompleting = completingTaskIds.includes(t.id);

            return (
                <div key={t.id}>
                    <div
                        className={`td-task-pill ${hasSubtasks && isExpanded ? 'expanded' : ''} ${isCompleting ? 'task-completing' : ''}`}
                        onClick={() => {
                            if (hasSubtasks) {
                                setExpandedTasks(prev => isExpanded ? prev.filter(id => id !== t.id) : [...prev, t.id]);
                            } else {
                                triggerComplete(t.id, cat.id, t.completed);
                                onToggleTask(t.id, t.completed, t.isRecurring);
                            }
                        }}
                    >
                        <button
                            className="td-task-toggle"
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerComplete(t.id, cat.id, t.completed);
                                onToggleTask(t.id, t.completed, t.isRecurring);
                            }}
                            title={t.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                            <CheckCircleIcon className="w-5 h-5" checked={t.completed} style={{ color: t.completed ? cat.color : 'rgba(255,255,255,0.2)' } as any} />
                        </button>
                        <span className={`td-task-pill-text ${t.completed ? 'done' : ''}`} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.text}</span>

                        {hasSubtasks && (
                            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, paddingRight: 4, display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                                {t.subtasks.filter(st => st.completed).length}/{t.subtasks.length}
                                <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', fontSize: '0.65rem' }}>▶</span>
                            </span>
                        )}

                        {activeLinkPB && !catLinkedToPBForTask && (
                            <button
                                onClick={(e) => toggleTaskInPB(activeLinkPB, t, e)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                                    borderRadius: 8, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8,
                                    background: taskLinkedToPB ? activeLinkPB.color : 'rgba(255,255,255,0.05)',
                                    color: taskLinkedToPB ? 'white' : '#71717a',
                                    border: `1px solid ${taskLinkedToPB ? activeLinkPB.color : 'rgba(255,255,255,0.08)'}`,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {taskLinkedToPB ? '✓' : '+'}
                            </button>
                        )}
                        {activeLinkPB && catLinkedToPBForTask && (
                            <span style={{ fontSize: '0.68rem', color: activeLinkPB.color, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>via category</span>
                        )}
                    </div>

                    {hasSubtasks && isExpanded && (
                        <div className="td-subtasks-container">
                            {t.subtasks.map(st => {
                                const stViaParentPB = activeLinkPB ? (catLinkedToPBForTask || taskLinkedToPB) : false;

                                if (!activeLinkPBId && !editMode && !isSubAnyTracked(t, st) && !isAnyTracked(t)) return null;

                                const stLinked = activeLinkPB ? (activeLinkPB.subtaskTexts.includes(`${t.categoryId}::${t.text}::${st.text}`) || activeLinkPB.subtaskTexts.includes(st.text)) : false;

                                return (
                                    <div
                                        key={st.id}
                                        className="td-subtask-item"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => onToggleSubtask(t.id, st.id, st.completed, st.isRecurring)}
                                    >
                                        <button
                                            className="td-task-toggle"
                                            style={{ opacity: 0.7 }}
                                            onClick={(e) => { e.stopPropagation(); onToggleSubtask(t.id, st.id, st.completed, st.isRecurring); }}
                                        >
                                            <CheckCircleIcon className="w-4 h-4" checked={st.completed} style={{ color: st.completed ? cat.color : 'rgba(255,255,255,0.15)' } as any} />
                                        </button>
                                        <span className={`td-subtask-item-text ${st.completed ? 'done' : ''}`} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.text}</span>

                                        {activeLinkPB && !stViaParentPB && (
                                            <button
                                                onClick={(e) => toggleSubtaskInPB(activeLinkPB, t, st, e)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                                                    borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                                                    background: stLinked ? activeLinkPB.color : 'rgba(255,255,255,0.04)',
                                                    color: stLinked ? 'white' : '#71717a',
                                                    border: `1px solid ${stLinked ? activeLinkPB.color : 'rgba(255,255,255,0.06)'}`,
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {stLinked ? '✓' : '+'}
                                            </button>
                                        )}
                                        {activeLinkPB && stViaParentPB && (
                                            <span style={{ fontSize: '0.65rem', color: activeLinkPB.color, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>inherited</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div key={cat.id}
                 className={`td-cat-card ${draggedItem?.id === cat.id ? 'dragging' : ''} ${dragOverTarget?.rowId === rowId && dragOverTarget?.slotIdx === slotIdx ? 'drag-over' : ''}`}
                 style={{ '--cat-color': cat.color, padding: cardPad } as any}
                 draggable={!activeLinkPBId && !editMode && layoutEditMode}
                 onDragStart={e => handleDragStart(e, cat.id, rowId, slotIdx)}
                 onDragOver={e => handleDragOver(e, rowId, slotIdx)}
                 onDragLeave={() => setDragOverTarget(null)}
                 onDrop={e => handleDrop(e, rowId, slotIdx)}
                 onDragEnd={() => { setDraggedItem(null); setDragOverTarget(null); }}
            >
                {/* Header — fixed, always visible */}
                <div className="td-cat-header-new" style={{ flexShrink: 0 }}>
                    <div className="td-cat-title-new" style={{ fontSize: titleSize }}>{cat.name}</div>
                    <div className="td-cat-stats-new">
                        <div className="td-cat-stats-pct" style={{ color: cat.color, fontSize: pctSize }}>{catPct}%</div>
                        <div className="td-cat-stats-frac">{doneCatAtoms}/{totalCatAtoms}</div>
                    </div>
                </div>

                {activeLinkPB && (
                    <button
                        onClick={() => toggleCatInPB(activeLinkPB, cat.id)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 5, padding: '6px 12px', borderRadius: 8,
                            fontSize: '0.72rem', fontWeight: 700, marginBottom: 12, flexShrink: 0,
                            background: catLinkedToPB ? activeLinkPB.color : 'rgba(255,255,255,0.06)',
                            color: catLinkedToPB ? 'white' : '#a1a1aa',
                            border: `1px solid ${catLinkedToPB ? activeLinkPB.color : 'rgba(255,255,255,0.1)'}`,
                            transition: 'all 0.15s',
                        }}
                    >
                        {catLinkedToPB ? '✓ Entire Category Linked' : '+ Link Entire Category'}
                    </button>
                )}

                <div className="td-cat-divider" style={{ flexShrink: 0 }} />

                {/* Scrollable task list — Feature 2 */}
                <div className="td-task-list">
                    {activeTasks.map(t => renderTaskPill(t))}
                    {activeTasks.length === 0 && completedTasks.length === 0 && (
                        <div style={{ fontSize: '0.78rem', color: '#52525b', textAlign: 'center', padding: '12px 0', fontStyle: 'italic' }}>No tasks</div>
                    )}
                </div>

                {/* Feature 3 — Completed drawer pinned at bottom */}
                {completedTasks.length > 0 && (
                    <div style={{ flexShrink: 0 }}>
                        <button
                            className={`td-completed-toggle ${isDrawerOpen ? 'open' : ''}`}
                            onClick={() => setAutoExpandCompleted(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                        >
                            <span className="chevron">▶</span>
                            Completed
                            <span className={`badge ${isBadgeBouncing ? 'completed-badge-bounce' : ''}`}>{completedTasks.length}</span>
                        </button>
                        {isDrawerOpen && (
                            <div className="td-completed-drawer" style={{ maxHeight: 180, overflowY: 'auto', marginTop: 4 }}>
                                {completedTasks.map(t => renderTaskPill(t))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const sb = settingsBucket; // tracker currently being configured in the settings panel

    // ── Shared 2-column dashboard ──
    // Every tracked category box flows into one 2-column grid (same columns as the
    // tracker header above). Saved layout order is respected; anything not yet
    // placed is appended so no dashboard box is ever hidden.
    const effectiveIds = effectiveCatGroups.map(g => g.cat.id);
    const orderedCatIds = Array.from(new Set([...activeLayoutIds.filter(id => effectiveIds.includes(id)), ...effectiveIds]));

    const toggleLayoutEditor = () => {
        if (!layoutEditMode) {
            // Normalise into 2-slot rows; keep boxes that aren't visible today at the end so their order survives
            const hidden = activeLayoutIds.filter(id => !orderedCatIds.includes(id));
            const ids = [...orderedCatIds, ...hidden];
            const rows: DashboardRowLayout[] = [];
            for (let i = 0; i < ids.length; i += BOARD_COLS) {
                const slots: (string | null)[] = ids.slice(i, i + BOARD_COLS);
                while (slots.length < BOARD_COLS) slots.push(null);
                rows.push({ id: `r-${Date.now()}-${i}`, columns: BOARD_COLS, matchHeight: true, slots });
            }
            saveDashboardRows(rows);
        }
        setLayoutEditMode(!layoutEditMode);
    };

    return (
        <div className="tracker-detail-panel tracker-unified-board" style={{ '--board-gap': compactView ? '12px' : '20px' } as any}>

            {/* ══════════ HEADER — every tracker's counter side by side + shared actions ══════════ */}
            <div className="td-header td-header-unified">
                <div className="td-board-toolbar">
                    <p className="td-section-title" style={{ margin: 0 }}>Trackers</p>
                    <div className="td-header-actions">
                    <button
                        className={`td-add-tracker-chip ${isCreatingTracker ? 'active' : ''}`}
                        onClick={() => setIsCreatingTracker(v => !v)}
                        title="Add tracker"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                    <button className="td-add-pb-btn" onClick={() => { setAddingPB(v => !v); setActiveLink(null); }}>
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
                    <button className={`td-gear-btn ${editMode ? 'active' : ''}`} onClick={() => { setEditMode(v => !v); setActiveLink(null); }} title="Settings">
                        <GearIcon className="w-4 h-4" />
                    </button>
                    </div>
                </div>
                <div className="td-tracker-summaries">
                    {buckets.map(b => {
                        const s = calcPctFromTasks(b.categoryIds || [], b.taskTexts || [], b.subtaskTexts || [], categories, tasks, b.color);
                        const isSelected = editMode && sb?.id === b.id;
                        return (
                            <div
                                key={b.id}
                                className={`td-tracker-summary ${isSelected ? 'selected' : ''}`}
                                style={{ '--tracker-color': b.color } as any}
                                onClick={() => openSettingsFor(b.id)}
                                title={`${b.name} settings`}
                            >
                                <ProgressRing pct={s.pct} color={b.color} size={72} stroke={6} />
                                <div className="td-title-block">
                                    <h2>{b.name}</h2>
                                    <p>{s.done} / {s.total} items · {s.pct}%</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ══ New tracker form ══ */}
            {isCreatingTracker && (
                <div className="td-add-pb-form" style={{ marginBottom: 20 }}>
                    <p className="tile-edit-label" style={{ marginBottom: 8 }}>New Tracker</p>
                    <NewBucketForm
                        onAdd={(name, color) => { onAddBucket(name, 'independent', color); setIsCreatingTracker(false); }}
                        onCancel={() => setIsCreatingTracker(false)}
                    />
                </div>
            )}

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
                    <button onClick={() => setActiveLink(null)} style={{ color: '#71717a', padding: 4 }}>
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ══ Add bar form (single, shared) ══ */}
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
                    {buckets.length > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                            <span className="tile-edit-label" style={{ margin: 0 }}>Tracker</span>
                            <div className="td-tracker-tabs">
                                {buckets.map(b => (
                                    <button
                                        key={b.id}
                                        className={`td-tracker-tab ${pbTargetBucketId === b.id ? 'active' : ''}`}
                                        style={{ '--tracker-color': b.color } as any}
                                        onClick={() => setNewPBBucketId(b.id)}
                                    >
                                        <span className="dot" />{b.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
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

            {/* ══════════ PROGRESS BARS — every tracker's bars in one shared row ══════════ */}
            {allPBs.length > 0 && (
                <div className="td-section">
                    <p className="td-section-title" style={{ marginBottom: 12 }}>Progress Bars</p>
                    <div className="td-pb-row">
                        {allPBs.map(({ pb, bucket }) => {
                            const prog = calcPctFromTasks(pb.categoryIds, pb.taskTexts, pb.subtaskTexts, categories, tasks, pb.color);
                            const isLinking = activeLinkPBId === pb.id;
                            const isEditingThis = editingPBId === pb.id;
                            const isOpenMenu = openMenuPBId === pb.id;

                            return (
                                <div key={pb.id} className="td-pb-mini-widget" style={{
                                    display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.02)',
                                    padding: '12px 18px 12px 12px', borderRadius: 30, border: isLinking ? `1px solid ${pb.color}` : '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: isLinking ? `0 0 12px ${pb.color}40` : 'none', transition: 'all 0.2s', minWidth: 0
                                }}>
                                    <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
                                        <ProgressRing pct={prog.pct} color={pb.color} size={34} stroke={3.5} />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                                        {isEditingThis ? (
                                            <PBLabelEdit pb={pb} onSave={label => { onUpdateProgressBar(bucket.id, pb.id, { label }); setEditingPBId(null); }} onCancel={() => setEditingPBId(null)} />
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e4e4e7', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onDoubleClick={() => setEditingPBId(pb.id)}>{pb.label}</span>
                                        )}
                                        <span style={{ fontSize: '0.65rem', color: '#a1a1aa', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {prog.done}/{prog.total} items
                                            {buckets.length > 1 && <> · <span style={{ color: bucket.color }}>{bucket.name}</span></>}
                                        </span>
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
                                                    onClick={() => { setActiveLink(isLinking ? null : { bucketId: bucket.id, pbId: pb.id }); setEditMode(false); setOpenMenuPBId(null); }}
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
                                                    onClick={() => { if (confirm(`Delete "${pb.label}"?`)) { onDeleteProgressBar(bucket.id, pb.id); if (activeLinkPBId === pb.id) setActiveLink(null); } setOpenMenuPBId(null); }}
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

            {/* ══════════ EDIT PANEL (per-tracker config, one shared panel) ══════════ */}
            {editMode && sb && (
                <div className="tile-edit-panel" style={{ marginBottom: 24 }}>
                    {buckets.length > 1 && (
                        <div className="tile-edit-section">
                            <label className="tile-edit-label">Tracker</label>
                            <div className="td-tracker-tabs">
                                {buckets.map(b => (
                                    <button
                                        key={b.id}
                                        className={`td-tracker-tab ${sb.id === b.id ? 'active' : ''}`}
                                        style={{ '--tracker-color': b.color } as any}
                                        onClick={() => setSettingsBucketId(b.id)}
                                    >
                                        <span className="dot" />{b.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Name</label>
                        <TrackerNameInput key={sb.id} bucket={sb} onSave={name => onUpdateBucket(sb.id, { name })} />
                    </div>
                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Color</label>
                        <div className="tile-palette">
                            {PALETTE.map(c => <button key={c} className={`tile-swatch ${sb.color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => onUpdateBucket(sb.id, { color: c })} />)}
                        </div>
                    </div>
                    <div className="tile-edit-section">
                        <label className="tile-edit-label">Overall Tracked Categories &amp; Tasks</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                            {categories.map(cat => {
                                const catLinked = (sb.categoryIds || []).includes(cat.id);
                                const catTasks = tasks.filter(t => t.categoryId === cat.id);
                                const isEditExpanded = expandedEditCats.includes(cat.id);
                                return (
                                    <div key={cat.id} style={{ borderRadius: 8, background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                                        {/* Category row */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.85rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                                                {catTasks.length > 0 && (
                                                    <button
                                                        className="td-edit-cat-expand-btn"
                                                        onClick={() => setExpandedEditCats(prev => isEditExpanded ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                                                    >
                                                        <span style={{ transform: isEditExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', display: 'inline-block', fontSize: '0.55rem' }}>▶</span>
                                                        {catTasks.length} tasks
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => catLinked ? onRemoveCategoryFromBucket(sb.id, cat.id) : onAddCategoryToBucket(sb.id, cat.id)}
                                                style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, flexShrink: 0, background: catLinked ? cat.color : 'rgba(255,255,255,0.08)', color: catLinked ? 'white' : '#a1a1aa', transition: 'all 0.15s', border: 'none' }}
                                            >
                                                {catLinked ? '✓ All' : 'Link All'}
                                            </button>
                                        </div>
                                        {/* Per-task granular links */}
                                        {isEditExpanded && !catLinked && catTasks.length > 0 && (
                                            <div className="td-edit-task-list">
                                                {catTasks.map(t => {
                                                    const taskKey = `${cat.id}::${t.text}`;
                                                    const taskLinked = (sb.taskTexts || []).some(x => x === taskKey || x === t.text);
                                                    return (
                                                        <div key={t.id} className="td-edit-task-row">
                                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.completed ? cat.color : 'rgba(255,255,255,0.2)', flexShrink: 0, display: 'inline-block' }} />
                                                            <span className="td-edit-task-row-text" style={{ color: t.completed ? '#71717a' : '#d4d4d8', textDecoration: t.completed ? 'line-through' : 'none' }}>{t.text}</span>
                                                            <button
                                                                onClick={() => taskLinked ? onRemoveBucketTask(sb.id, taskKey) : onAddBucketTask(sb.id, taskKey)}
                                                                style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 5, flexShrink: 0, background: taskLinked ? cat.color : 'rgba(255,255,255,0.07)', color: taskLinked ? 'white' : '#71717a', border: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                                                            >
                                                                {taskLinked ? '✓' : '+'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {isEditExpanded && catLinked && (
                                            <div style={{ padding: '4px 12px 8px', fontSize: '0.72rem', color: cat.color, fontStyle: 'italic' }}>All tasks linked via category</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button className="td-delete-btn" onClick={() => { if (confirm(`Delete "${sb.name}"?`)) { onDeleteBucket(sb.id); setSettingsBucketId(null); } }}>
                        <TrashIcon className="w-3.5 h-3.5" /> Delete "{sb.name}"
                    </button>
                </div>
            )}

            {/* ══════════ CATEGORY TASK CARDS — one shared layout for every tracker ══════════ */}
            <div className="td-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <p className="td-section-title" style={{ margin: 0 }}>
                        {activeLinkPB ? `Tap tasks to link → ${activeLinkPB.label}` : 'Dashboard Layout'}
                    </p>
                    {(!activeLinkPBId && !editMode) && (
                        <button
                            onClick={toggleLayoutEditor}
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
                        {!layoutEditMode ? (
                            <div className="td-board-grid">
                                {orderedCatIds.map((id, idx) => renderCategoryCard(id, 'flow', idx))}
                            </div>
                        ) : (
                            <>
                                {dashboardRows.map((row) => (
                                    <div key={row.id} className="td-dash-row-container" style={{ marginBottom: 'var(--board-gap)' }}>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase' }}>Row</span>
                                            <button onClick={() => {
                                                saveDashboardRows(dashboardRows.filter(x => x.id !== row.id));
                                            }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: 6, fontSize: '0.65rem', marginLeft: 'auto' }}>Remove Row</button>
                                        </div>

                                        <div className="td-board-grid">
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
                                                    );
                                                }
                                                return renderCategoryCard(slottedCatId, row.id, slotIdx);
                                            })}
                                        </div>
                                    </div>
                                ))}

                                <button onClick={() => {
                                    saveDashboardRows([...dashboardRows, { id: `r-${Date.now()}`, columns: BOARD_COLS, matchHeight: true, slots: Array(BOARD_COLS).fill(null) }]);
                                }} style={{ width: '100%', padding: '12px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, color: '#a1a1aa', fontSize: '0.8rem', fontWeight: 700, marginBottom: 32 }}>+ Add New Row</button>

                                <div className="td-unassigned-pool" style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}
                                     onDragOver={e => handleDragOver(e, 'unassigned', 0)}
                                     onDragLeave={() => setDragOverTarget(null)}
                                     onDrop={e => {
                                          // Native drop into unassigned area logic natively resets via handleDrop checking 'unassigned'
                                          handleDrop(e, 'unassigned', 0);
                                     }}
                                >
                                    <p style={{ fontSize: '0.8rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, marginBottom: 16 }}>Unplaced boxes (shown at the end)</p>
                                    <div className="td-board-grid" style={{ minHeight: 120, border: dragOverTarget?.rowId === 'unassigned' ? '1px dashed #a1a1aa' : 'none', padding: 8, borderRadius: 12 }}>
                                        {unassignedCatGroups.map((g, idx) => renderCategoryCard(g.cat.id, 'unassigned', idx))}
                                        {unassignedCatGroups.length === 0 && <div style={{ color: '#52525b', fontSize: '0.8rem' }}>Drag a box here to unplace it</div>}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════ Tracker name editor ══
function TrackerNameInput({ bucket, onSave }: { bucket: TrackerBucket; onSave: (name: string) => void }) {
    const [v, setV] = useState(bucket.name);
    const save = () => { if (v.trim() && v.trim() !== bucket.name) onSave(v.trim()); };
    return (
        <input
            className="tile-edit-input"
            value={v}
            onChange={e => setV(e.target.value)}
            onBlur={save}
            onKeyDown={e => { if (e.key === 'Enter') save(); }}
            style={{ width: '100%' }}
        />
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
    const { buckets, onAddBucket } = props;
    const [isCreating, setIsCreating] = useState(false);

    // No trackers yet → simple empty state
    if (buckets.length === 0) {
        return (
            <div className="tracker-buckets-root">
                <div className="tracker-buckets-header">
                    <h3 className="tracker-buckets-title">Trackers</h3>
                </div>
                {isCreating ? (
                    <div className="tracker-create-wrapper">
                        <div className="tile-create-panel">
                            <NewBucketForm
                                onAdd={(name, color) => {
                                    onAddBucket(name, 'independent', color);
                                    setIsCreating(false);
                                }}
                                onCancel={() => setIsCreating(false)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="tracker-panels-empty">
                        <p>No trackers created yet.</p>
                        <button className="tile-btn-create" onClick={() => setIsCreating(true)}>
                            <PlusIcon className="w-4 h-4" /> Create Tracker
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // All trackers share ONE seamless board
    return (
        <div className="tracker-buckets-root">
            <TrackerBoard {...props} />
        </div>
    );
}
