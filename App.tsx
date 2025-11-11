// abdulqadirrhuss/intell-planner/Intell-planner-e4eec65ae3452797ce24afb321a4c1a7a0f5cce3/App.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// MODIFIED: Import new types
import { Task, Category, DayType, RecurringTaskTemplate, DailyLog, Subtask, RecurringSubtaskTemplate } from './types';
import Header from './Header';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm';
import DayTypeManager from './DayTypeManager';
import CategoryManager from './CategoryManager';
import { SettingsIcon, EditIcon } from './icons';
import DateNavigator from './DateNavigator';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Setup ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ----------------------

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- MODIFIED: Type Mappings for Supabase ---
interface SupabaseTask extends Omit<Task, 'categoryId' | 'isRecurring' | 'subtasks'> { category_id: string; is_recurring: boolean; log_date: string; }
interface SupabaseSubtask extends Omit<Subtask, 'parent_task_id'> { parent_task_id: string; log_date: string; }
interface SupabaseRecurringTask extends Omit<RecurringTaskTemplate, 'categoryId' | 'daysOfWeek' | 'subtaskTemplates'> { 
  category_id: string; 
  days_of_week: number[]; // NEW
}
interface SupabaseRecurringSubtaskTemplate extends Omit<RecurringSubtaskTemplate, 'parent_template_id'> { parent_template_id: string; }
interface SupabaseDayTypeCategoryLink { day_type_id: string; category_id: string; }

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dayTypes, setDayTypes] = useState<DayType[]>([]);
  const [dailyLogs, setDailyLogs] = useState<{ [date: string]: DailyLog }>({});
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  const [isDayTypeManagerOpen, setDayTypeManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);

  // --- MODIFIED: Data Loading from Supabase ---
  useEffect(() => {
    async function loadInitialData() {
      try {
        // 1. Fetch Categories AND their recurring tasks (w/ subtask templates)
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select(`
            *,
            recurring_task_templates ( *, recurring_subtask_templates ( * ) )
          `);
        if (catError) throw catError;

        const formattedCategories: Category[] = catData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          recurringTasks: cat.recurring_task_templates.map((rt: any) => ({
            id: rt.id,
            text: rt.text,
            categoryId: rt.category_id,
            daysOfWeek: rt.days_of_week || [], // NEW
            subtaskTemplates: rt.recurring_subtask_templates.map((rst: SupabaseRecurringSubtaskTemplate) => ({
              id: rst.id,
              text: rst.text,
              parentTemplateId: rst.parent_template_id
            })) // NEW
          }))
        }));
        setCategories(formattedCategories);

        // 2. Fetch Day Types
        const { data: dtData, error: dtError } = await supabase.from('day_types').select('*');
        if (dtError) throw dtError;
        
        // 3. Fetch the links between Day Types and Categories
        const { data: linksData, error: linksError } = await supabase.from('day_type_categories').select('*');
        if (linksError) throw linksError;

        // 4. Combine Day Types with their category IDs
        const formattedDayTypes: DayType[] = dtData.map(dt => ({
          id: dt.id,
          name: dt.name,
          categoryIds: linksData
            .filter((link: SupabaseDayTypeCategoryLink) => link.day_type_id === dt.id)
            .map((link: SupabaseDayTypeCategoryLink) => link.category_id)
        }));
        setDayTypes(formattedDayTypes);

      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    }
    loadInitialData();
  }, []);

  // --- MODIFIED: Daily Log Loading (now includes subtasks) ---
  const fetchDailyLog = useCallback(async (date: string) => {
    let { data: logData, error: logError } = await supabase
      .from('daily_logs').select('*').eq('date', date).maybeSingle();
      
    if (logError) throw logError;
    if (!logData) {
      const { data: newLogData, error: newLogError } = await supabase
        .from('daily_logs').insert({ date: date, day_type_id: null }).select().single();
      if (newLogError) throw newLogError;
      logData = newLogData;
    }

    // 1. Fetch parent tasks
    const { data: taskData, error: taskError } = await supabase
      .from('tasks').select('*').eq('log_date', date);
    if (taskError) throw taskError;

    // 2. Fetch all subtasks for this date
    const { data: subtaskData, error: subtaskError } = await supabase
      .from('subtasks').select('*').eq('log_date', date);
    if (subtaskError) throw subtaskError;

    // 3. Map subtasks
    const subtasks: Subtask[] = subtaskData.map((st: SupabaseSubtask) => ({
      id: st.id,
      parent_task_id: st.parent_task_id,
      log_date: st.log_date,
      text: st.text,
      completed: st.completed
    }));

    // 4. Map tasks and nest their subtasks
    const formattedTasks: Task[] = taskData.map((t: SupabaseTask) => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      categoryId: t.category_id,
      isRecurring: t.is_recurring,
      subtasks: subtasks.filter(st => st.parent_task_id === t.id) // Nesting
    }));

    setDailyLogs(prevLogs => ({
      ...prevLogs,
      [date]: {
        date: logData.date,
        dayTypeId: logData.day_type_id,
        tasks: formattedTasks
      }
    }));
  }, []);

  useEffect(() => {
    fetchDailyLog(selectedDate);
  }, [selectedDate, fetchDailyLog]);

  const currentDailyLog = useMemo(() => {
    return dailyLogs[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
  }, [dailyLogs, selectedDate]);
  
  // --- MODIFIED: Core App Logic (Day Type Selection) ---
  const handleSelectDayType = async (dayTypeId: string) => {
    const selectedDayType = dayTypes.find(dt => dt.id === dayTypeId);
    if (!selectedDayType) return;

    // NEW: Get the day of the week for the selected date
    const currentDayOfWeek = new Date(selectedDate + 'T00:00:00').getDay();

    const nonRecurringTasks = currentDailyLog.tasks.filter(t => !t.isRecurring);
    const categoryIdsForDayType = selectedDayType.categoryIds;
    
    const allRecurringTaskTemplates: RecurringTaskTemplate[] = [];
    categoryIdsForDayType.forEach(catId => {
      const category = categories.find(c => c.id === catId);
      if (category) {
        // NEW: Filter by day of the week
        const tasksForThisDay = category.recurringTasks.filter(rt => 
          rt.daysOfWeek.includes(currentDayOfWeek)
        );
        allRecurringTaskTemplates.push(...tasksForThisDay);
      }
    });

    // 5. Delete old recurring tasks AND THEIR SUBTASKS from DB
    // We must fetch the IDs first to delete subtasks
    const { data: oldRecTasks } = await supabase.from('tasks').select('id')
      .eq('log_date', selectedDate).eq('is_recurring', true);
    const oldRecTaskIds = oldRecTasks?.map(t => t.id) || [];
    
    if (oldRecTaskIds.length > 0) {
      await supabase.from('subtasks').delete().in('parent_task_id', oldRecTaskIds);
      await supabase.from('tasks').delete().in('id', oldRecTaskIds);
    }
      
    // 6. Create new parent tasks in DB
    const newRecurringTasksForDb = allRecurringTaskTemplates.map(rt => ({
      log_date: selectedDate, text: rt.text, category_id: rt.categoryId,
      is_recurring: true, completed: false
    }));

    const { data: newTasksData, error: newTasksError } = await supabase
      .from('tasks').insert(newRecurringTasksForDb).select();
    if (newTasksError) throw newTasksError;

    // 7. Create new subtasks in DB
    const newSubtasksForDb: Omit<SupabaseSubtask, 'id' | 'completed'>[] = [];
    const newTasks: Task[] = newTasksData.map((t: SupabaseTask, index: number) => {
      const template = allRecurringTaskTemplates[index];
      template.subtaskTemplates.forEach(rst => {
        newSubtasksForDb.push({
          parent_task_id: t.id,
          text: rst.text,
          log_date: selectedDate
        });
      });
      return {
        id: t.id, text: t.text, completed: t.completed, categoryId: t.category_id, isRecurring: t.is_recurring,
        subtasks: [] // Will be populated in step 8
      };
    });

    const { data: newSubtasksData, error: newSubtasksError } = await supabase
      .from('subtasks').insert(newSubtasksForDb).select();
    if (newSubtasksError) throw newSubtasksError;

    // 8. Update daily log's dayTypeId in DB
    await supabase.from('daily_logs').update({ day_type_id: dayTypeId }).eq('date', selectedDate);

    // 9. Update local state
    const newSubtasks: Subtask[] = newSubtasksData.map((st: SupabaseSubtask) => ({
      id: st.id, parent_task_id: st.parent_task_id, log_date: st.log_date, text: st.text, completed: st.completed
    }));
    
    newTasks.forEach(task => {
      task.subtasks = newSubtasks.filter(st => st.parent_task_id === task.id);
    });
    
    setDailyLogs(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        dayTypeId: dayTypeId,
        tasks: [...nonRecurringTasks, ...newTasks]
      }
    }));
  };

  // --- MODIFIED: Task Handlers (now include subtasks) ---

  const handleAddTask = async (text: string, categoryId: string) => {
    // This function now only adds PARENT tasks
    const newTaskForDb = {
      log_date: selectedDate, text: text, category_id: categoryId,
      is_recurring: false, completed: false
    };
    const { data, error } = await supabase.from('tasks').insert(newTaskForDb).select().single();
    if (error) throw error;
    
    const newTask: Task = {
      id: data.id, text: data.text, completed: data.completed, categoryId: data.category_id, isRecurring: data.is_recurring,
      subtasks: [] // A new parent task has no subtasks
    };
    setDailyLogs(prev => ({
      ...prev,
      [selectedDate]: { ...currentDailyLog, tasks: [...currentDailyLog.tasks, newTask] }
    }));
  };

  const handleToggleTask = async (id: string) => {
    // This function is now ONLY for parent tasks WITHOUT subtasks
    const taskToToggle = currentDailyLog.tasks.find(t => t.id === id);
    if (!taskToToggle || taskToToggle.subtasks.length > 0) return; // Guard
    
    const newCompletedState = !taskToToggle.completed;
    await supabase.from('tasks').update({ completed: newCompletedState }).eq('id', id);
    
    const newTasks = currentDailyLog.tasks.map(task =>
      task.id === id ? { ...task, completed: newCompletedState } : task
    );
    setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: newTasks } }));
  };

  const handleDeleteTask = async (id: string) => {
    // Must also delete subtasks
    await supabase.from('subtasks').delete().eq('parent_task_id', id);
    await supabase.from('tasks').delete().eq('id', id);
    
    const newTasks = currentDailyLog.tasks.filter(task => task.id !== id);
    setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: newTasks } }));
  };

  // --- NEW: Subtask Handlers ---
  const handleAddSubtask = async (taskId: string, text: string) => {
    const { data, error } = await supabase.from('subtasks').insert({
      parent_task_id: taskId,
      log_date: selectedDate,
      text: text
    }).select().single();
    if (error) throw error;
    
    const newSubtask: Subtask = {
      id: data.id, parent_task_id: data.parent_task_id, log_date: data.log_date, text: data.text, completed: data.completed
    };
    
    const newTasks = currentDailyLog.tasks.map(task => 
      task.id === taskId ? { ...task, subtasks: [...task.subtasks, newSubtask] } : task
    );
    setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: newTasks } }));
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await supabase.from('subtasks').delete().eq('id', subtaskId);
    
    const newTasks = currentDailyLog.tasks.map(task => ({
      ...task,
      subtasks: task.subtasks.filter(st => st.id !== subtaskId)
    }));
    setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: newTasks } }));
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = currentDailyLog.tasks.find(t => t.id === taskId);
    if (!task) return;
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    const newSubtaskState = !subtask.completed;
    await supabase.from('subtasks').update({ completed: newSubtaskState }).eq('id', subtaskId);

    // Update local state for subtask
    const newSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: newSubtaskState } : st
    );

    // Check if parent task completion status needs to change
    const allSubtasksComplete = newSubtasks.every(st => st.completed);
    let parentCompletedState = task.completed;

    if (allSubtasksComplete && !task.completed) {
      // All subtasks are now complete, auto-complete parent
      parentCompletedState = true;
      await supabase.from('tasks').update({ completed: true }).eq('id', taskId);
    } else if (!allSubtasksComplete && task.completed) {
      // A subtask was un-checked, auto-un-complete parent
      parentCompletedState = false;
      await supabase.from('tasks').update({ completed: false }).eq('id', taskId);
    }

    const newTasks = currentDailyLog.tasks.map(t => 
      t.id === taskId ? { ...t, completed: parentCompletedState, subtasks: newSubtasks } : t
    );
    setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: newTasks } }));
  };


  // --- MODIFIED: Category Management (to include new handlers) ---
  const handleAddCategory = async (name: string, color: string) => {
    const { data, error } = await supabase.from('categories').insert({ name, color, id: crypto.randomUUID() }).select().single();
    if (error) throw error;
    setCategories([...categories, { ...data, recurringTasks: [] }]);
  };
  const handleUpdateCategory = async (id: string, name: string, color: string) => {
    await supabase.from('categories').update({ name, color }).eq('id', id);
    setCategories(categories.map(cat => cat.id === id ? { ...cat, name, color } : cat));
  };
  const handleDeleteCategory = async (id: string) => {
    if (id === 'uncategorized') return;
    await supabase.from('tasks').update({ category_id: 'uncategorized' }).eq('category_id', id);
    await supabase.from('day_type_categories').delete().eq('category_id', id);
    await supabase.from('categories').delete().eq('id', id);
    
    setCategories(categories.filter(cat => cat.id !== id));
    setDayTypes(prevDayTypes => prevDayTypes.map(dt => ({
      ...dt,
      categoryIds: dt.categoryIds.filter(catId => catId !== id)
    })));
  };
  
  const handleAddRecurringTask = async (categoryId: string, text: string) => {
    const { data, error } = await supabase.from('recurring_task_templates').insert({ 
      category_id: categoryId, text: text, days_of_week: [] // NEW: Default to empty days
    }).select().single();
    if (error) throw error;
    const newTask: RecurringTaskTemplate = { 
      id: data.id, text: data.text, categoryId: data.category_id, 
      daysOfWeek: data.days_of_week, subtaskTemplates: [] 
    };
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, recurringTasks: [...cat.recurringTasks, newTask] } : cat
    ));
  };
  const onDeleteRecurringTask = async (taskId: string) => {
    await supabase.from('recurring_task_templates').delete().eq('id', taskId);
    setCategories(categories.map(cat => ({
      ...cat,
      recurringTasks: cat.recurringTasks.filter(rt => rt.id !== taskId)
    })));
  };

  // --- NEW: Handlers for recurring task details ---
  const onUpdateRecurringTask = async (task: RecurringTaskTemplate) => {
    await supabase.from('recurring_task_templates')
      .update({ days_of_week: task.daysOfWeek })
      .eq('id', task.id);
    
    setCategories(categories.map(cat => ({
      ...cat,
      recurringTasks: cat.recurringTasks.map(rt => rt.id === task.id ? task : rt)
    })));
  };

  const onAddRecurringSubtask = async (parentTemplateId: string, text: string) => {
    const { data, error } = await supabase.from('recurring_subtask_templates').insert({
      parent_template_id: parentTemplateId, text: text
    }).select().single();
    if (error) throw error;

    const newSubtaskTemplate: RecurringSubtaskTemplate = {
      id: data.id, text: data.text, parentTemplateId: data.parent_template_id
    };

    setCategories(categories.map(cat => ({
      ...cat,
      recurringTasks: cat.recurringTasks.map(rt => 
        rt.id === parentTemplateId ? { ...rt, subtaskTemplates: [...rt.subtaskTemplates, newSubtaskTemplate] } : rt
      )
    })));
  };

  const onDeleteRecurringSubtask = async (subtaskTemplateId: string) => {
    await supabase.from('recurring_subtask_templates').delete().eq('id', subtaskTemplateId);
    
    setCategories(categories.map(cat => ({
      ...cat,
      recurringTasks: cat.recurringTasks.map(rt => ({
        ...rt,
        subtaskTemplates: rt.subtaskTemplates.filter(st => st.id !== subtaskTemplateId)
      }))
    })));
  };

  // --- Day Type Management (no change to handlers) ---
  const handleAddDayType = async (name: string) => {
    const { data, error } = await supabase.from('day_types').insert({ name, id: crypto.randomUUID() }).select().single();
    if (error) throw error;
    setDayTypes([...dayTypes, { ...data, categoryIds: [] }]);
  };
  const handleUpdateDayType = async (id: string, name: string) => {
    await supabase.from('day_types').update({ name }).eq('id', id);
    setDayTypes(dayTypes.map(dt => dt.id === id ? { ...dt, name } : dt));
  };
  const handleDeleteDayType = async (id: string) => {
    await supabase.from('day_types').delete().eq('id', id);
    setDayTypes(dayTypes.filter(dt => dt.id !== id));
  };
  const handleAddCategoryToDayType = async (dayTypeId: string, categoryId: string) => {
    await supabase.from('day_type_categories').insert({ day_type_id: dayTypeId, category_id: categoryId });
    setDayTypes(dayTypes.map(dt =>
      dt.id === dayTypeId ? { ...dt, categoryIds: [...dt.categoryIds, categoryId] } : dt
    ));
  };
  const onRemoveCategoryFromDayType = async (dayTypeId: string, categoryId: string) => {
    await supabase.from('day_type_categories').delete()
      .eq('day_type_id', dayTypeId)
      .eq('category_id', categoryId);
    setDayTypes(dayTypes.map(dt =>
      dt.id === dayTypeId ? { ...dt, categoryIds: dt.categoryIds.filter(cId => cId !== categoryId) } : dt
    ));
  };

  // --- MODIFIED: Hierarchical Progress Calculation ---
  const completionPercentage = useMemo(() => {
    const tasks = currentDailyLog.tasks;
    const totalParentTasks = tasks.length;
    if (totalParentTasks === 0) return 0;

    const progressPerParent = 100 / totalParentTasks;

    const totalProgress = tasks.reduce((acc, task) => {
      if (task.subtasks.length === 0) {
        // No subtasks: parent task completion counts
        return acc + (task.completed ? progressPerParent : 0);
      } else {
        // Has subtasks: progress is based on subtasks
        if (task.subtasks.length === 0) return acc; // Avoid division by zero
        const progressPerSubtask = progressPerParent / task.subtasks.length;
        const completedSubtasks = task.subtasks.filter(st => st.completed).length;
        return acc + (completedSubtasks * progressPerSubtask);
      }
    }, 0);

    return Math.round(totalProgress);
  }, [currentDailyLog.tasks]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* === THIS IS THE PART THAT WAS MISSING === */}
        <Header completionPercentage={completionPercentage} selectedDate={selectedDate} />
        <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
        
        <main>
          {/* === THIS IS THE OTHER PART THAT WAS MISSING === */}
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <label htmlFor="day-type" className="block mb-2 text-sm font-medium text-gray-300">Select Day's Focus</label>
                <select
                  id="day-type"
                  value={currentDailyLog.dayTypeId || ''}
                  onChange={(e) => handleSelectDayType(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                >
                  <option value="" disabled>Choose a day type...</option>
                  {dayTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-6 items-end">
                 <button onClick={() => setDayTypeManagerOpen(true)} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200">
                   <EditIcon className="w-4 h-4" /> Manage Day Types
                </button>
                 <button onClick={() => setCategoryManagerOpen(true)} className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200">
                   <SettingsIcon className="w-4 h-4" /> Manage Categories
                </button>
              </div>
            </div>
          </div>
          
          <TaskList
            tasks={currentDailyLog.tasks}
            categories={categories}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            // NEW: Pass subtask handlers
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onAddSubtask={handleAddSubtask}
          />
          <AddTaskForm categories={categories} onAddTask={handleAddTask} />
        
        </main>
        
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
        />
        <CategoryManager
          isOpen={isCategoryManagerOpen}
          onClose={() => setCategoryManagerOpen(false)}
          categories={categories}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddRecurringTask={handleAddRecurringTask}
          onDeleteRecurringTask={onDeleteRecurringTask}
          // NEW: Pass new handlers
          onUpdateRecurringTask={onUpdateRecurringTask}
          onAddRecurringSubtask={onAddRecurringSubtask}
          onDeleteRecurringSubtask={onDeleteRecurringSubtask}
        />
      </div>
    </div>
  );
}

export default App;
