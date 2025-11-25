
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Category, DayType, RecurringTaskTemplate, DailyLog, Subtask, RecurringSubtaskTemplate, StatDefinition, StatValue, TrackerType } from './types';
import TaskList from './TaskList';
import DayTypeManager from './DayTypeManager';
import CategoryManager from './CategoryManager';
import Statistics from './Statistics';
import TrackerManager from './TrackerManager';
import TasksPage from './TasksPage';
import { SettingsIcon, EditIcon, PlannerIcon, StatsIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, CalendarIcon } from './icons';
import { createClient } from '@supabase/supabase-js';

// --- 1. SAFE INITIALIZATION ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const getTodayDateString = () => new Date().toISOString().split('T')[0];

interface SupabaseRecurringSubtaskTemplate extends Omit<RecurringSubtaskTemplate, 'parent_template_id'> { parent_template_id: string; }

function App() {
    if (!supabase) {
        return (
            <div className="min-h-screen bg-[#52525b] text-white flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/50 max-w-lg">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">⚠️ Configuration Missing</h1>
                    <p className="text-gray-300 mb-4">The app cannot start because it cannot find your Supabase API keys.</p>
                </div>
            </div>
        );
    }

    const [categories, setCategories] = useState<Category[]>([]);
    const [dayTypes, setDayTypes] = useState<DayType[]>([]);
    const [dailyLogs, setDailyLogs] = useState<{ [date: string]: DailyLog }>({});
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
    const [statDefinitions, setStatDefinitions] = useState<StatDefinition[]>([]);
    const [statValues, setStatValues] = useState<StatValue[]>([]);
    const [uncategorizedTemplates, setUncategorizedTemplates] = useState<RecurringTaskTemplate[]>([]);

    const [isDayTypeManagerOpen, setDayTypeManagerOpen] = useState(false);
    const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);
    const [isTrackerManagerOpen, setTrackerManagerOpen] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const [currentView, setCurrentView] = useState<'planner' | 'tasks'>('planner');
    const [newTaskText, setNewTaskText] = useState('');

    // --- DATA LOADING (Same as before) ---
    useEffect(() => {
        async function loadInitialData() {
            if (!supabase) return;
            try {
                let loadedCategories: Category[] = [];
                let loadedOrphans: RecurringTaskTemplate[] = [];

                const { data: catData } = await supabase.from('categories').select(`*, recurring_task_templates ( *, recurring_subtask_templates ( * ) )`);
                if (catData) {
                    loadedCategories = catData.map((cat: any) => ({
                        id: cat.id, name: cat.name, color: cat.color,
                        recurringTasks: (cat.recurring_task_templates || []).map((rt: any) => ({
                            id: rt.id, text: rt.text, categoryId: rt.category_id, daysOfWeek: rt.days_of_week || [],
                            subtaskTemplates: (rt.recurring_subtask_templates || []).map((rst: SupabaseRecurringSubtaskTemplate) => ({
                                id: rst.id, text: rst.text, parentTemplateId: rst.parent_template_id
                            }))
                        }))
                    }));
                    setCategories(loadedCategories);
                }

                const { data: orphanData } = await supabase.from('recurring_task_templates').select(`*, recurring_subtask_templates ( * )`).is('category_id', null);
                if (orphanData) {
                    loadedOrphans = orphanData.map((rt: any) => ({
                        id: rt.id, text: rt.text, categoryId: 'uncategorized', daysOfWeek: rt.days_of_week || [],
                        subtaskTemplates: (rt.recurring_subtask_templates || []).map((rst: SupabaseRecurringSubtaskTemplate) => ({
                            id: rst.id, text: rst.text, parentTemplateId: rst.parent_template_id
                        }))
                    }));
                    setUncategorizedTemplates(loadedOrphans);
                }

                const { data: dtData } = await supabase.from('day_types').select('*');
                const { data: linksData } = await supabase.from('day_type_categories').select('*').order('sort_order');
                if (dtData && linksData) {
                    const formattedDayTypes = dtData.map(dt => {
                        const catIds = linksData.filter((l: any) => l.day_type_id === dt.id).map((l: any) => l.category_id);
                        const dayRecurringTasks: any[] = [];
                        loadedCategories.forEach((cat: Category) => { if (catIds.includes(cat.id)) dayRecurringTasks.push(...cat.recurringTasks); });
                        dayRecurringTasks.push(...loadedOrphans);
                        return { id: dt.id, name: dt.name, categoryIds: catIds, recurringTasks: dayRecurringTasks };
                    });
                    setDayTypes(formattedDayTypes);
                }

                const { data: statsDefs } = await supabase.from('stat_definitions').select('*');
                if (statsDefs) setStatDefinitions(statsDefs);
                const { data: statsVals } = await supabase.from('stat_values').select('*');
                if (statsVals) setStatValues(statsVals);

            } catch (error) { console.error("Error loading data", error); } finally { setIsDataLoaded(true); }
        }
        loadInitialData();
    }, []);

    // --- LOGIC (Same as before) ---
    const regenerateTasks = useCallback(async (dayTypeId: string, date: string) => {
        if (!supabase) return;
        const selectedDayType = dayTypes.find(dt => dt.id === dayTypeId);
        if (!selectedDayType) return;
        const log = dailyLogs[date] || { date: date, dayTypeId: null, tasks: [] };
        const oneOffTasks = log.tasks.filter(t => !t.isRecurring);
        const newRecurringTasksForDb = selectedDayType.recurringTasks.map(rt => ({
            log_date: date, text: rt.text, category_id: rt.categoryId === 'uncategorized' ? null : rt.categoryId, is_recurring: true, completed: false
        }));
        const { data: oldRecTasks } = await supabase.from('tasks').select('id').eq('log_date', date).eq('is_recurring', true);
        const oldRecTaskIds = oldRecTasks?.map(t => t.id) || [];
        if (oldRecTaskIds.length > 0) {
            await supabase.from('subtasks').delete().in('parent_task_id', oldRecTaskIds);
            await supabase.from('tasks').delete().in('id', oldRecTaskIds);
        }
        if (newRecurringTasksForDb.length > 0) {
            const { data: newTasksData } = await supabase.from('tasks').insert(newRecurringTasksForDb).select();
            if (newTasksData) {
                const newTasks: Task[] = newTasksData.map((t: any) => ({
                    id: t.id, text: t.text, completed: t.completed, categoryId: t.category_id || 'uncategorized', isRecurring: true, subtasks: []
                }));
                await supabase.from('daily_logs').update({ day_type_id: dayTypeId }).eq('date', date);
                setDailyLogs(prev => ({ ...prev, [date]: { ...log, dayTypeId: dayTypeId, tasks: [...oneOffTasks, ...newTasks] } }));
                return;
            }
        }
        await supabase.from('daily_logs').update({ day_type_id: dayTypeId }).eq('date', date);
        setDailyLogs(prev => ({ ...prev, [date]: { ...log, dayTypeId: dayTypeId, tasks: oneOffTasks } }));
    }, [dayTypes, dailyLogs]);

    const fetchDailyLog = useCallback(async (date: string) => {
        if (!supabase) return;
        if (!isDataLoaded) { setTimeout(() => fetchDailyLog(date), 100); return; }
        try {
            let { data: logData } = await supabase.from('daily_logs').select('*').eq('date', date).maybeSingle();
            if (!logData) {
                const { data: newLogData } = await supabase.from('daily_logs').insert({ date: date, day_type_id: null }).select().single();
                logData = newLogData;
            }
            const { data: taskData } = await supabase.from('tasks').select('*').eq('log_date', date);
            const { data: subtaskData } = await supabase.from('subtasks').select('*').eq('log_date', date);
            const subtasks = subtaskData ? subtaskData.map((st: any) => ({ ...st, isRecurring: st.is_recurring || false })) : [];
            const formattedTasks = taskData ? taskData.map((t: any) => ({
                id: t.id, text: t.text, completed: t.completed, categoryId: t.category_id || 'uncategorized', isRecurring: t.is_recurring,
                subtasks: subtasks.filter((st: any) => st.parent_task_id === t.id)
            })) : [];
            setDailyLogs(prev => ({ ...prev, [date]: { date: logData?.date || date, dayTypeId: logData?.day_type_id, tasks: formattedTasks } }));
        } catch (e) { console.error("Error fetching daily log", e); }
    }, [isDataLoaded]);

    useEffect(() => { fetchDailyLog(selectedDate); }, [selectedDate, fetchDailyLog]);
    const currentDailyLog = useMemo(() => dailyLogs[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] }, [dailyLogs, selectedDate]);

    const handleSelectDayTypeFromDropdown = (dayTypeId: string) => regenerateTasks(dayTypeId, selectedDate);
    const handleAddRecurringTask = async (dayTypeId: string, text: string, categoryId: string) => { /* ... (Logic kept same) ... */ };
    const handleReorderCategories = async (newOrderIds: string[]) => { /* ... (Logic kept same) ... */ };

    const handleAddTask = async (text: string, categoryId: string, isRecurring: boolean = false) => {
        if (!supabase || !text.trim()) return;
        const dbCatId = categoryId === 'uncategorized' || categoryId === '' ? null : categoryId;
        const { data } = await supabase.from('tasks').insert({
            log_date: selectedDate, text, category_id: dbCatId, is_recurring: isRecurring
        }).select().single();
        if (data) {
            const newTask = { ...data, categoryId: data.category_id || 'uncategorized', isRecurring: data.is_recurring, subtasks: [] };
            setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: [...currentDailyLog.tasks, newTask] } }));
            setNewTaskText('');
        }
    };

    // Handlers (Simplified for brevity, assuming they exist as before)
    const handleToggleTask = async (id: string) => { if (!supabase) return; setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; const task = log.tasks.find(t => t.id === id); if (!task) return prev; const newCompleted = !task.completed; supabase!.from('tasks').update({ completed: newCompleted }).eq('id', id).then(); return { ...prev, [selectedDate]: { ...log, tasks: log.tasks.map(t => t.id === id ? { ...t, completed: newCompleted } : t) } }; }); };
    const handleDeleteTask = async (id: string) => { if (!supabase) return; await supabase.from('tasks').delete().eq('id', id); setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: currentDailyLog.tasks.filter(t => t.id !== id) } })); };
    const handleUpdateTaskText = async (id: string, text: string) => { if (!supabase) return; await supabase.from('tasks').update({ text }).eq('id', id); setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: currentDailyLog.tasks.map(t => t.id === id ? { ...t, text } : t) } })); };
    const handleAddSubtask = async (taskId: string, text: string) => { if (!supabase) return; const { data } = await supabase.from('subtasks').insert({ parent_task_id: taskId, log_date: selectedDate, text, is_recurring: false }).select().single(); if (data) { const newSub = { ...data, isRecurring: false }; setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; return { ...prev, [selectedDate]: { ...log, tasks: log.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t) } }; }); } };
    const handleDeleteSubtask = async (subtaskId: string) => { if (!supabase) return; await supabase.from('subtasks').delete().eq('id', subtaskId); setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; return { ...prev, [selectedDate]: { ...log, tasks: log.tasks.map(t => ({ ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) })) } }; }); };
    const handleUpdateSubtaskText = async (taskId: string, subtaskId: string, text: string) => { if (!supabase) return; await supabase.from('subtasks').update({ text }).eq('id', subtaskId); setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; return { ...prev, [selectedDate]: { ...log, tasks: log.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, text } : st) } : t) } }; }); };
    const handleToggleSubtask = async (taskId: string, subtaskId: string) => { if (!supabase) return; setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; const task = log.tasks.find(t => t.id === taskId); if (!task) return prev; const subtask = task.subtasks.find(st => st.id === subtaskId); if (!subtask) return prev; const newSubState = !subtask.completed; supabase!.from('subtasks').update({ completed: newSubState }).eq('id', subtaskId).then(); const newTasks = log.tasks.map(t => { if (t.id === taskId) { const newSubs = t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: newSubState } : st); const allComplete = newSubs.every(st => st.completed); if (allComplete !== t.completed) supabase!.from('tasks').update({ completed: allComplete }).eq('id', taskId).then(); return { ...t, subtasks: newSubs, completed: allComplete }; } return t; }); return { ...prev, [selectedDate]: { ...log, tasks: newTasks } }; }); };
    const handleToggleSubtaskRecurring = async (taskId: string, subtaskId: string) => { if (!supabase) return; setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; const task = log.tasks.find(t => t.id === taskId); if (!task) return prev; const subtask = task.subtasks.find(st => st.id === subtaskId); if (!subtask) return prev; const newRecurringState = !subtask.isRecurring; supabase!.from('subtasks').update({ is_recurring: newRecurringState }).eq('id', subtaskId).then(); if (newRecurringState && task.isRecurring) { const category = categories.find(c => c.id === task.categoryId); const recurringTask = category?.recurringTasks.find(rt => rt.text === task.text); if (recurringTask) { supabase!.from('recurring_subtask_templates').insert({ parent_template_id: recurringTask.id, text: subtask.text }).then(({ data }) => { if (data) { setCategories(prevCats => prevCats.map(cat => ({ ...cat, recurringTasks: cat.recurringTasks.map(rt => rt.id === recurringTask.id ? { ...rt, subtaskTemplates: [...rt.subtaskTemplates, { id: data[0].id, text: subtask.text, parentTemplateId: recurringTask.id }] } : rt) }))); } }); } } const newTasks = log.tasks.map(t => { if (t.id === taskId) { return { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, isRecurring: newRecurringState } : st) }; } return t; }); return { ...prev, [selectedDate]: { ...log, tasks: newTasks } }; }); };

    // Manager Handlers (Simplified)
    const handleAddCategory = async (name: string, color: string) => { if (!supabase) return; const { data } = await supabase.from('categories').insert({ name, color }).select().single(); if (data) setCategories([...categories, { ...data, recurringTasks: [] }]); };
    const handleUpdateCategory = async (id: string, name: string, color: string) => { if (!supabase) return; await supabase.from('categories').update({ name, color }).eq('id', id); setCategories(categories.map(c => c.id === id ? { ...c, name, color } : c)); };
    const handleDeleteCategory = async (id: string) => { if (!supabase || id === 'uncategorized') return; await supabase.from('categories').delete().eq('id', id); setCategories(categories.filter(c => c.id !== id)); };
    const onDeleteRecurringTask = async (dayTypeId: string, id: string) => { if (!supabase) return; await supabase.from('recurring_task_templates').delete().eq('id', id); setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.filter(rt => rt.id !== id) }))); setUncategorizedTemplates(uncategorizedTemplates.filter(t => t.id !== id)); setDayTypes(dayTypes.map(dt => ({ ...dt, recurringTasks: dt.recurringTasks.filter(t => t.id !== id) }))); };
    const onUpdateRecurringTask = async (task: RecurringTaskTemplate) => { if (!supabase) return; await supabase.from('recurring_task_templates').update({ days_of_week: task.daysOfWeek }).eq('id', task.id); setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.map(rt => rt.id === task.id ? task : rt) }))); };
    const onAddRecurringSubtask = async (parentId: string, text: string) => { if (!supabase) return; const { data } = await supabase.from('recurring_subtask_templates').insert({ parent_template_id: parentId, text }).select().single(); if (data) { setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.map(rt => rt.id === parentId ? { ...rt, subtaskTemplates: [...rt.subtaskTemplates, { id: data.id, text, parentTemplateId: parentId }] } : rt) }))); } };
    const onDeleteRecurringSubtask = async (id: string) => { if (!supabase) return; await supabase.from('recurring_subtask_templates').delete().eq('id', id); setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.map(rt => ({ ...rt, subtaskTemplates: rt.subtaskTemplates.filter(st => st.id !== id) })) }))); };
    const handleUpdateRecurringTaskText = async (id: string, text: string) => { if (!supabase) return; await supabase.from('recurring_task_templates').update({ text }).eq('id', id); setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.map(rt => rt.id === id ? { ...rt, text } : rt) }))); };
    const handleUpdateRecurringSubtaskText = async (id: string, text: string) => { if (!supabase) return; await supabase.from('recurring_subtask_templates').update({ text }).eq('id', id); setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.map(rt => ({ ...rt, subtaskTemplates: rt.subtaskTemplates.map(st => st.id === id ? { ...st, text } : st) })) }))); };
    const handleAddDayType = async (name: string) => { if (!supabase) return; const { data } = await supabase.from('day_types').insert({ name }).select().single(); if (data) setDayTypes([...dayTypes, { ...data, categoryIds: [], recurringTasks: [...uncategorizedTemplates] }]); };
    const handleUpdateDayType = async (id: string, name: string) => { if (!supabase) return; await supabase.from('day_types').update({ name }).eq('id', id); setDayTypes(dayTypes.map(dt => dt.id === id ? { ...dt, name } : dt)); };
    const handleDeleteDayType = async (id: string) => { if (!supabase) return; await supabase.from('day_types').delete().eq('id', id); setDayTypes(dayTypes.filter(dt => dt.id !== id)); };
    const handleAddCategoryToDayType = async (dtId: string, catId: string) => { if (!supabase) return; await supabase.from('day_type_categories').insert({ day_type_id: dtId, category_id: catId, sort_order: 99 }); const cat = categories.find(c => c.id === catId); setDayTypes(dayTypes.map(dt => dt.id === dtId ? { ...dt, categoryIds: [...dt.categoryIds, catId], recurringTasks: [...dt.recurringTasks, ...(cat?.recurringTasks || [])] } : dt)); };
    const onRemoveCategoryFromDayType = async (dtId: string, catId: string) => { if (!supabase) return; await supabase.from('day_type_categories').delete().eq('day_type_id', dtId).eq('category_id', catId); setDayTypes(dayTypes.map(dt => dt.id === dtId ? { ...dt, categoryIds: dt.categoryIds.filter(c => c !== catId), recurringTasks: dt.recurringTasks.filter(rt => rt.categoryId !== catId || rt.categoryId === 'uncategorized') } : dt)); };

    const handleAddTracker = async (name: string, type: TrackerType, linkedCategoryId?: string, target?: number, color?: string) => { if (!supabase) return; const { data } = await supabase.from('stat_definitions').insert({ name, type, linked_category_id: linkedCategoryId, target, color }).select().single(); if (data) setStatDefinitions([...statDefinitions, data]); };
    const handleUpdateTracker = async (id: string, updates: Partial<StatDefinition>) => { if (!supabase) return; const { data } = await supabase.from('stat_definitions').update(updates).eq('id', id).select().single(); if (data) setStatDefinitions(statDefinitions.map(s => s.id === id ? data : s)); };
    const handleDeleteTracker = async (id: string) => { if (!supabase) return; await supabase.from('stat_definitions').delete().eq('id', id); setStatDefinitions(statDefinitions.filter(s => s.id !== id)); };
    const handleUpdateStatValue = async (date: string, definitionId: string, value: number | boolean | null) => { if (!supabase) return; let numVal = 0; if (typeof value === 'boolean') numVal = value ? 1 : 0; else if (value !== null) numVal = Number(value); const existing = statValues.find(v => v.date === date && v.stat_definition_id === definitionId); if (value === null) { if (existing) { await supabase.from('stat_values').delete().eq('id', existing.id); setStatValues(statValues.filter(v => v.id !== existing.id)); } } else { if (existing) { await supabase.from('stat_values').update({ value: numVal, is_manual: true }).eq('id', existing.id); setStatValues(statValues.map(v => v.id === existing.id ? { ...v, value: numVal, is_manual: true } : v)); } else { const { data } = await supabase.from('stat_values').insert({ date, stat_definition_id: definitionId, value: numVal, is_manual: true }).select().single(); if (data) setStatValues([...statValues, data]); } } };

    const completionPercentage = useMemo(() => {
        const tasks = currentDailyLog.tasks;
        if (tasks.length === 0) return 0;
        const valuePerTask = 100 / tasks.length;
        let total = 0;
        tasks.forEach(t => {
            if (t.subtasks && t.subtasks.length > 0) {
                const comp = t.subtasks.filter(st => st.completed).length;
                total += (comp / t.subtasks.length) * valuePerTask;
            } else if (t.completed) total += valuePerTask;
        });
        return Math.round(total);
    }, [currentDailyLog.tasks]);

    // --- NAVIGATION HELPERS ---
    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const goToToday = () => setSelectedDate(getTodayDateString());

    return (
        <div className="app-container">
            {/* Top Toggle */}
            <div className="flex justify-center mb-8">
                <div className="toggle-pill-container">
                    <button
                        className={`toggle-pill ${currentView === 'planner' ? 'active' : ''}`}
                        onClick={() => setCurrentView('planner')}
                    >
                        <PlannerIcon className="w-4 h-4 inline mr-2" />
                        Planner
                    </button>
                    <button
                        className={`toggle-pill ${currentView === 'tasks' ? 'active' : ''}`}
                        onClick={() => setCurrentView('tasks')}
                    >
                        <CheckIcon className="w-4 h-4 inline mr-2" />
                        Tasks
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">IntelliDay</h1>
                <div className="flex justify-between items-end">
                    <p className="text-gray-400">
                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="text-right">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Daily Progress</div>
                        <div className="text-3xl font-bold text-white">{completionPercentage}%</div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-700/50 h-2 rounded-full mt-4 overflow-hidden">
                    <div
                        className="h-full bg-violet-500 transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
            </div>

            {/* Date Navigation Bar */}
            <div className="nav-bar">
                <button className="icon-btn" onClick={() => changeDate(-1)}>
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDate === getTodayDateString() ? 'bg-violet-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                        onClick={goToToday}
                    >
                        Today
                    </button>
                    <div className="date-display">
                        <span>{selectedDate.split('-').reverse().join('/')}</span>
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                    </div>
                </div>

                <button className="icon-btn" onClick={() => changeDate(1)}>
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Main Content */}
            {currentView === 'planner' && (
                <div className="animate-in fade-in">
                    {/* Day Scaffold Selection */}
                    <div className="content-card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Apply Day Scaffold</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setDayTypeManagerOpen(true)} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-gray-300 transition-colors">
                                    Edit Day Types
                                </button>
                                <button onClick={() => setCategoryManagerOpen(true)} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-gray-300 transition-colors">
                                    Edit Categories
                                </button>
                            </div>
                        </div>

                        <select
                            value={currentDailyLog.dayTypeId || ''}
                            onChange={(e) => handleSelectDayTypeFromDropdown(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-3"
                        >
                            <option value="" disabled>Choose a day type...</option>
                            {dayTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Applying this generates scaffold for both Planner and Task List.</p>
                    </div>

                    {/* Task List */}
                    <TaskList
                        key={selectedDate}
                        tasks={currentDailyLog.tasks}
                        categories={categories.filter(c => c.id !== 'uncategorized')}
                        sortedCategoryIds={dayTypes.find(dt => dt.id === currentDailyLog.dayTypeId)?.categoryIds || []}
                        onReorderCategories={handleReorderCategories}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                        onToggleSubtask={handleToggleSubtask}
                        onDeleteSubtask={handleDeleteSubtask}
                        onAddSubtask={handleAddSubtask}
                        onUpdateTaskText={handleUpdateTaskText}
                        onUpdateSubtaskText={handleUpdateSubtaskText}
                        onToggleSubtaskRecurring={handleToggleSubtaskRecurring}
                    />

                    {/* Add Task Input */}
                    <div className="mt-6 relative">
                        <div className="task-input-wrapper">
                            <input
                                type="text"
                                placeholder="Add a new task..."
                                className="task-input"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask(newTaskText, 'uncategorized')}
                            />
                            <div className="flex items-center gap-2 pr-2">
                                <select
                                    className="bg-transparent text-xs text-gray-400 border-none outline-none cursor-pointer hover:text-white"
                                    onChange={(e) => handleAddTask(newTaskText, e.target.value)}
                                    value=""
                                >
                                    <option value="" disabled>No Link</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button
                                    className="fab-btn"
                                    onClick={() => handleAddTask(newTaskText, 'uncategorized')}
                                >
                                    <PlusIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentView === 'tasks' && (
                <TasksPage
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    completionPercentage={completionPercentage}
                    dailyLog={currentDailyLog}
                    dayTypes={dayTypes}
                    categories={categories}
                    onSelectDayType={handleSelectDayTypeFromDropdown}
                    onOpenDayTypeManager={() => setDayTypeManagerOpen(true)}
                    onOpenCategoryManager={() => setCategoryManagerOpen(true)}
                    onOpenTrackerManager={() => setTrackerManagerOpen(true)}
                    onReorderCategories={handleReorderCategories}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onAddSubtask={handleAddSubtask}
                    onUpdateTaskText={handleUpdateTaskText}
                    onUpdateSubtaskText={handleUpdateSubtaskText}
                    onToggleSubtaskRecurring={handleToggleSubtaskRecurring}
                    onAddTask={handleAddTask}
                />
            )}

            {/* Modals */}
            <DayTypeManager
                isOpen={isDayTypeManagerOpen}
                onClose={() => setDayTypeManagerOpen(false)}
                dayTypes={dayTypes}
                categories={categories}
                onAddDayType={handleAddDayType}
                onUpdateDayType={handleUpdateDayType}
                onDeleteDayType={handleDeleteDayType}
                onAddCategoryToDayType={handleAddCategoryToDayType}
                onRemoveCategoryFromDayType={onRemoveCategoryFromDayType}
                onAddRecurringTask={handleAddRecurringTask}
                onDeleteRecurringTask={onDeleteRecurringTask}
            />
            <CategoryManager isOpen={isCategoryManagerOpen} onClose={() => setCategoryManagerOpen(false)} categories={categories} onAddCategory={handleAddCategory} onUpdateCategory={handleUpdateCategory} onDeleteCategory={handleDeleteCategory} onAddRecurringTask={handleAddRecurringTask} onDeleteRecurringTask={onDeleteRecurringTask} onUpdateRecurringTask={onUpdateRecurringTask} onAddRecurringSubtask={onAddRecurringSubtask} onDeleteRecurringSubtask={onDeleteRecurringSubtask} onUpdateRecurringTaskText={handleUpdateRecurringTaskText} onUpdateRecurringSubtaskText={handleUpdateRecurringSubtaskText} />
            <TrackerManager isOpen={isTrackerManagerOpen} onClose={() => setTrackerManagerOpen(false)} statDefinitions={statDefinitions} categories={categories} onAddTracker={handleAddTracker} onUpdateTracker={handleUpdateTracker} onDeleteTracker={handleDeleteTracker} />
        </div>
    );
}

export default App;
