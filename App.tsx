import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Category, DayType, RecurringTaskTemplate, DailyLog, Subtask, RecurringSubtaskTemplate, StatDefinition, StatValue, TrackerType } from './types';
import Header from './Header';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm';
import DayTypeManager from './DayTypeManager';
import CategoryManager from './CategoryManager';
import Statistics from './Statistics';
import TrackerManager from './TrackerManager';
import TasksPage from './TasksPage'; 
import { SettingsIcon, EditIcon, PlannerIcon, StatsIcon, CheckIcon } from './icons';
import DateNavigator from './DateNavigator';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getTodayDateString = () => new Date().toISOString().split('T')[0];

interface SupabaseRecurringSubtaskTemplate extends Omit<RecurringSubtaskTemplate, 'parent_template_id'> { parent_template_id: string; }

function App() {
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
  
  const [currentView, setCurrentView] = useState<'planner' | 'statistics' | 'tasks'>('planner');

  useEffect(() => {
    async function loadInitialData() {
      try {
        // Declare variables in scope so they can be used later
        let loadedCategories: Category[] = [];
        let loadedOrphans: RecurringTaskTemplate[] = [];

        // 1. Fetch Categories
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

        // 2. Fetch Uncategorized Routines
        const { data: orphanData } = await supabase.from('recurring_task_templates')
            .select(`*, recurring_subtask_templates ( * )`)
            .is('category_id', null);
            
        if (orphanData) {
            loadedOrphans = orphanData.map((rt: any) => ({
                id: rt.id, text: rt.text, categoryId: 'uncategorized', daysOfWeek: rt.days_of_week || [],
                subtaskTemplates: (rt.recurring_subtask_templates || []).map((rst: SupabaseRecurringSubtaskTemplate) => ({
                    id: rst.id, text: rst.text, parentTemplateId: rst.parent_template_id
                }))
            }));
            setUncategorizedTemplates(loadedOrphans);
        }

        // 3. Fetch Day Types
        const { data: dtData } = await supabase.from('day_types').select('*');
        const { data: linksData } = await supabase.from('day_type_categories').select('*').order('sort_order');
        
        if (dtData && linksData) {
            const formattedDayTypes = dtData.map(dt => {
                const catIds = linksData.filter((l: any) => l.day_type_id === dt.id).map((l: any) => l.category_id);
                const dayRecurringTasks: any[] = [];
                
                // Safe access using loadedCategories from this scope
                loadedCategories.forEach((cat: Category) => {
                    if (catIds.includes(cat.id)) {
                        dayRecurringTasks.push(...cat.recurringTasks);
                    }
                });
                
                // Add the orphans (Global Routines)
                dayRecurringTasks.push(...loadedOrphans);

                return {
                    id: dt.id, name: dt.name,
                    categoryIds: catIds,
                    recurringTasks: dayRecurringTasks 
                };
            });
            setDayTypes(formattedDayTypes);
        }

        const { data: statsDefs } = await supabase.from('stat_definitions').select('*');
        if (statsDefs) setStatDefinitions(statsDefs);

        const { data: statsVals } = await supabase.from('stat_values').select('*');
        if (statsVals) setStatValues(statsVals);

        setIsDataLoaded(true);
      } catch (error) { 
          console.error("Error loading data", error); 
          // Even if error, enable data loaded so app doesn't stay white
          setIsDataLoaded(true);
      }
    }
    loadInitialData();
  }, []); 

  const regenerateTasks = useCallback(async (dayTypeId: string, date: string) => {
    const selectedDayType = dayTypes.find(dt => dt.id === dayTypeId);
    if (!selectedDayType) return;
    
    const log = dailyLogs[date] || { date: date, dayTypeId: null, tasks: [] };
    const oneOffTasks = log.tasks.filter(t => !t.isRecurring);
    
    const newRecurringTasksForDb = selectedDayType.recurringTasks.map(rt => ({
      log_date: date, 
      text: rt.text, 
      category_id: rt.categoryId === 'uncategorized' ? null : rt.categoryId, 
      is_recurring: true, 
      completed: false
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
    if (!isDataLoaded) { setTimeout(() => fetchDailyLog(date), 100); return; }
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
    
    setDailyLogs(prev => ({ ...prev, [date]: { date: logData.date, dayTypeId: logData.day_type_id, tasks: formattedTasks } }));
  }, [isDataLoaded]);

  useEffect(() => { fetchDailyLog(selectedDate); }, [selectedDate, fetchDailyLog]);
  const currentDailyLog = useMemo(() => dailyLogs[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] }, [dailyLogs, selectedDate]);

  const handleSelectDayTypeFromDropdown = (dayTypeId: string) => regenerateTasks(dayTypeId, selectedDate);
  
  const handleReorderCategories = async (newOrderIds: string[]) => {
    const currentLog = dailyLogs[selectedDate];
    if (currentLog && currentLog.dayTypeId) {
        const dayTypeId = currentLog.dayTypeId;
        setDayTypes(prev => prev.map(dt => dt.id === dayTypeId ? { ...dt, categoryIds: newOrderIds } : dt));
        const dayType = dayTypes.find(dt => dt.id === dayTypeId);
        if (dayType) {
            const updates = newOrderIds.map((catId, index) => {
                if (dayType.categoryIds.includes(catId)) {
                    return supabase.from('day_type_categories').update({ sort_order: index }).eq('day_type_id', dayTypeId).eq('category_id', catId);
                } return null;
            }).filter(Boolean);
            await Promise.all(updates);
        }
    }
  };

  const handleAddTask = async (text: string, categoryId: string, isRecurring: boolean = false) => {
    const dbCatId = categoryId === 'uncategorized' || categoryId === '' ? null : categoryId;
    const { data } = await supabase.from('tasks').insert({ 
        log_date: selectedDate, text, category_id: dbCatId, is_recurring: isRecurring 
    }).select().single();

    if (data) {
        const newTask = { ...data, categoryId: data.category_id || 'uncategorized', isRecurring: data.is_recurring, subtasks: [] };
        setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: [...currentDailyLog.tasks, newTask] } }));
    }
  };

  const handleAddRecurringTask = async (dayTypeId: string, text: string, categoryId: string) => {
      const dbCatId = categoryId === 'uncategorized' || categoryId === '' ? null : categoryId;
      const { data } = await supabase.from('recurring_task_templates').insert({ category_id: dbCatId, text }).select().single();
      
      if (data) {
          const newTemplate: RecurringTaskTemplate = { 
              id: data.id, text: data.text, categoryId: categoryId || 'uncategorized', daysOfWeek: [], subtaskTemplates: [] 
          };

          if (dbCatId) {
             setCategories(categories.map(c => c.id === categoryId ? { ...c, recurringTasks: [...c.recurringTasks, newTemplate] } : c)); 
          } else {
             setUncategorizedTemplates(prev => [...prev, newTemplate]);
             setDayTypes(dayTypes.map(dt => ({...dt, recurringTasks: [...dt.recurringTasks, newTemplate]})));
          }

          const currentDayTypeId = dailyLogs[selectedDate]?.dayTypeId;
          if (currentDayTypeId === dayTypeId) {
              const { data: newTask } = await supabase.from('tasks').insert({
                  log_date: selectedDate, text: text, category_id: dbCatId, is_recurring: true
              }).select().single();

              if (newTask) {
                  setDailyLogs(prev => {
                      const safeLog = prev[selectedDate] || { date: selectedDate, dayTypeId: dayTypeId, tasks: [] };
                      return {
                          ...prev,
                          [selectedDate]: {
                              ...safeLog,
                              tasks: [...safeLog.tasks, { 
                                  id: newTask.id, text: newTask.text, completed: false, 
                                  categoryId: newTask.category_id || 'uncategorized', isRecurring: true, subtasks: [] 
                              }]
                          }
                      };
                  });
              }
          }
      }
  };

  const handleToggleTask = async (id: string) => { setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; const task = log.tasks.find(t => t.id === id); if (!task) return prev; const newCompleted = !task.completed; supabase.from('tasks').update({ completed: newCompleted }).eq('id', id).then(); return { ...prev, [selectedDate]: { ...log, tasks: log.tasks.map(t => t.id === id ? { ...t, completed: newCompleted } : t) } }; }); };
  const handleDeleteTask = async (id: string) => { await supabase.from('tasks').delete().eq('id', id); setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: currentDailyLog.tasks.filter(t => t.id !== id) } })); };
  const handleUpdateTaskText = async (id: string, text: string) => { await supabase.from('tasks').update({ text }).eq('id', id); setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: currentDailyLog.tasks.map(t => t.id === id ? { ...t, text } : t) } })); };
  const handleAddSubtask = async (taskId: string, text: string) => { const { data } = await supabase.from('subtasks').insert({ parent_task_id: taskId, log_date: selectedDate, text, is_recurring: false }).select().single(); if (data) { const newSub = { ...data, isRecurring: false }; setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; return { ...prev, [selectedDate]: { ...log, tasks: log.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t) } }; }); } };
  const handleDeleteSubtask = async (subtaskId: string) => { await supabase.from('subtasks').delete().eq('id', subtaskId); setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; return { ...prev, [selectedDate]: { ...log, tasks: log.tasks.map(t => ({ ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) })) } }; }); };
  const handleUpdateSubtaskText = async (taskId: string, subtaskId: string, text: string) => { await supabase.from('subtasks').update({ text }).eq('id', subtaskId); setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; return { ...prev, [selectedDate]: { ...log, tasks: log.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, text } : st) } : t) } }; }); };
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => { setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; const task = log.tasks.find(t => t.id === taskId); if (!task) return prev; const subtask = task.subtasks.find(st => st.id === subtaskId); if (!subtask) return prev; const newSubState = !subtask.completed; supabase.from('subtasks').update({ completed: newSubState }).eq('id', subtaskId).then(); const newTasks = log.tasks.map(t => { if (t.id === taskId) { const newSubs = t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: newSubState } : st); const allComplete = newSubs.every(st => st.completed); if (allComplete !== t.completed) supabase.from('tasks').update({ completed: allComplete }).eq('id', taskId).then(); return { ...t, subtasks: newSubs, completed: allComplete }; } return t; }); return { ...prev, [selectedDate]: { ...log, tasks: newTasks } }; }); };
  const handleToggleSubtaskRecurring = async (taskId: string, subtaskId: string) => { setDailyLogs(prev => { const log = prev[selectedDate] || currentDailyLog; const task = log.tasks.find(t => t.id === taskId); if (!task) return prev; const subtask = task.subtasks.find(st => st.id === subtaskId); if (!subtask) return prev; const newRecurringState = !subtask.isRecurring; supabase.from('subtasks').update({ is_recurring: newRecurringState }).eq('id', subtaskId).then(); if (newRecurringState && task.isRecurring) { const category = categories.find(c => c.id === task.categoryId); const recurringTask = category?.recurringTasks.find(rt => rt.text === task.text); if (recurringTask) { supabase.from('recurring_subtask_templates').insert({ parent_template_id: recurringTask.id, text: subtask.text }).then(({ data }) => { if (data) { setCategories(prevCats => prevCats.map(cat => ({ ...cat, recurringTasks: cat.recurringTasks.map(rt => rt.id === recurringTask.id ? { ...rt, subtaskTemplates: [...rt.subtaskTemplates, { id: data[0].id, text: subtask.text, parentTemplateId: recurringTask.id }] } : rt) }))); } }); } } const newTasks = log.tasks.map(t => { if (t.id === taskId) { return { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, isRecurring: newRecurringState } : st) }; } return t; }); return { ...prev, [selectedDate]: { ...log, tasks: newTasks } }; }); };
  
  const handleAddCategory = async (name: string, color: string) => { const { data } = await supabase.from('categories').insert({ name, color }).select().single(); if (data) setCategories([...categories, { ...data, recurringTasks: [] }]); };
  const handleUpdateCategory = async (id: string, name: string, color: string) => { await supabase.from('categories').update({ name, color }).eq('id', id); setCategories(categories.map(c => c.id === id ? { ...c, name, color } : c)); };
  const handleDeleteCategory = async (id: string) => { if(id==='uncategorized')return; await supabase.from('categories').delete().eq('id', id); setCategories(categories.filter(c => c.id !== id)); };
  const onDeleteRecurringTask = async (dayTypeId: string, id: string) => { await supabase.from('recurring_task_templates').delete().eq('id', id); setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.filter(rt => rt.id !== id) }))); setUncategorizedTemplates(uncategorizedTemplates.filter(t => t.id !== id)); setDayTypes(dayTypes.map(dt => ({ ...dt, recurringTasks: dt.recurringTasks.filter(t => t.id !== id) }))); }; 
  const onUpdateRecurringTask = async (task: RecurringTaskTemplate) => { await supabase.from('recurring_task_templates').update({ days_of_week: task.daysOfWeek }).eq('id', task.id); setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.map(rt => rt.id === task.id ? task : rt) }))); };
  const onAddRecurringSubtask = async (parentId: string, text: string) => { const { data } = await supabase.from('recurring_subtask_templates').insert({ parent_template_id: parentId, text }).select().single(); if (data) { setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.map(rt => rt.id === parentId ? { ...rt, subtaskTemplates: [...rt.subtaskTemplates, { id: data.id, text, parentTemplateId: parentId }] } : rt) }))); } };
  const onDeleteRecurringSubtask = async (id: string) => { await supabase.from('recurring_subtask_templates').delete().eq('id', id); setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.map(rt => ({ ...rt, subtaskTemplates: rt.subtaskTemplates.filter(st => st.id !== id) })) }))); };
  const handleUpdateRecurringTaskText = async (id: string, text: string) => { await supabase.from('recurring_task_templates').update({ text }).eq('id', id); setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.map(rt => rt.id === id ? { ...rt, text } : rt) }))); };
  const handleUpdateRecurringSubtaskText = async (id: string, text: string) => { await supabase.from('recurring_subtask_templates').update({ text }).eq('id', id); setCategories(categories.map(c => ({ ...c, recurringTasks: c.recurringTasks.map(rt => ({ ...rt, subtaskTemplates: rt.subtaskTemplates.map(st => st.id === id ? { ...st, text } : st) })) }))); };
  const handleAddDayType = async (name: string) => { const { data } = await supabase.from('day_types').insert({ name }).select().single(); if (data) setDayTypes([...dayTypes, { ...data, categoryIds: [], recurringTasks: [...uncategorizedTemplates] }]); };
  const handleUpdateDayType = async (id: string, name: string) => { await supabase.from('day_types').update({ name }).eq('id', id); setDayTypes(dayTypes.map(dt => dt.id === id ? { ...dt, name } : dt)); };
  const handleDeleteDayType = async (id: string) => { await supabase.from('day_types').delete().eq('id', id); setDayTypes(dayTypes.filter(dt => dt.id !== id)); };
  const handleAddCategoryToDayType = async (dtId: string, catId: string) => { await supabase.from('day_type_categories').insert({ day_type_id: dtId, category_id: catId, sort_order: 99 }); const cat = categories.find(c => c.id === catId); setDayTypes(dayTypes.map(dt => dt.id === dtId ? { ...dt, categoryIds: [...dt.categoryIds, catId], recurringTasks: [...dt.recurringTasks, ...(cat?.recurringTasks || [])] } : dt)); };
  const onRemoveCategoryFromDayType = async (dtId: string, catId: string) => { await supabase.from('day_type_categories').delete().eq('day_type_id', dtId).eq('category_id', catId); setDayTypes(dayTypes.map(dt => dt.id === dtId ? { ...dt, categoryIds: dt.categoryIds.filter(c => c !== catId), recurringTasks: dt.recurringTasks.filter(rt => rt.categoryId !== catId || rt.categoryId === 'uncategorized') } : dt)); };

  const handleAddTracker = async (name: string, type: TrackerType, linkedCategoryId?: string, target?: number, color?: string) => { const { data } = await supabase.from('stat_definitions').insert({ name, type, linked_category_id: linkedCategoryId, target, color }).select().single(); if (data) setStatDefinitions([...statDefinitions, data]); };
  const handleUpdateTracker = async (id: string, updates: Partial<StatDefinition>) => { const { data } = await supabase.from('stat_definitions').update(updates).eq('id', id).select().single(); if (data) setStatDefinitions(statDefinitions.map(s => s.id === id ? data : s)); };
  const handleDeleteTracker = async (id: string) => { await supabase.from('stat_definitions').delete().eq('id', id); setStatDefinitions(statDefinitions.filter(s => s.id !== id)); };
  const handleUpdateStatValue = async (date: string, definitionId: string, value: number | boolean | null) => { let numVal = 0; if (typeof value === 'boolean') numVal = value ? 1 : 0; else if (value !== null) numVal = Number(value); const existing = statValues.find(v => v.date === date && v.stat_definition_id === definitionId); if (value === null) { if (existing) { await supabase.from('stat_values').delete().eq('id', existing.id); setStatValues(statValues.filter(v => v.id !== existing.id)); } } else { if (existing) { await supabase.from('stat_values').update({ value: numVal, is_manual: true }).eq('id', existing.id); setStatValues(statValues.map(v => v.id === existing.id ? { ...v, value: numVal, is_manual: true } : v)); } else { const { data } = await supabase.from('stat_values').insert({ date, stat_definition_id: definitionId, value: numVal, is_manual: true }).select().single(); if (data) setStatValues([...statValues, data]); } } };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center mb-8">
            <div className="bg-gray-800 p-1 rounded-full inline-flex shadow-lg border border-gray-700 gap-1">
                <button onClick={() => setCurrentView('planner')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${currentView === 'planner' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                    <PlannerIcon className="w-4 h-4" /> Planner
                </button>
                <button onClick={() => setCurrentView('tasks')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${currentView === 'tasks' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                    <CheckIcon className="w-4 h-4" /> Tasks
                </button>
                <button onClick={() => setCurrentView('statistics')} className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${currentView === 'statistics' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
                    <StatsIcon className="w-4 h-4" /> Stats
                </button>
            </div>
        </div>

        {currentView === 'planner' && (
            <div className="animate-in fade-in">
                <Header completionPercentage={completionPercentage} selectedDate={selectedDate} />
                <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
                <main>
                  <div className="p-6 bg-gray-800 rounded-lg shadow-lg mb-6 border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <label htmlFor="day-type" className="block mb-2 text-sm font-medium text-gray-300">Select Day's Focus</label>
                        <select id="day-type" value={currentDailyLog.dayTypeId || ''} onChange={(e) => handleSelectDayTypeFromDropdown(e.target.value)} className="bg-gray-700 border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5">
                          <option value="" disabled>Choose a day type...</option>
                          {dayTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-6 items-end">
                         <button onClick={() => setDayTypeManagerOpen(true)} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"><EditIcon className="w-4 h-4" /> Manage Day Types</button>
                         <button onClick={() => setCategoryManagerOpen(true)} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200"><SettingsIcon className="w-4 h-4" /> Manage Categories</button>
                      </div>
                    </div>
                  </div>
                  
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
                  <AddTaskForm categories={categories.filter(c => c.id !== 'uncategorized')} onAddTask={(t, c) => handleAddTask(t, c, false)} />
                </main>
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

        {currentView === 'statistics' && (
            <div className="animate-in fade-in">
                <Statistics 
                    categories={categories} 
                    dailyLogs={dailyLogs}
                    statDefinitions={statDefinitions}
                    statValues={statValues}
                    onOpenTrackerManager={() => setTrackerManagerOpen(true)}
                    onUpdateStatValue={handleUpdateStatValue}
                />
            </div>
        )}

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
    </div>
  );
}

export default App;
