import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Category, DayType, RecurringTaskTemplate, DailyLog } from './types';
import Header from './components/Header';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
import DayTypeManager from './components/DayTypeManager';
import CategoryManager from './components/CategoryManager';
import { SettingsIcon, EditIcon } from './components/icons';
import DateNavigator from './components/DateNavigator';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Setup ---
// These are environment variables you will set in Vercel (Step 6)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ----------------------

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Type mapping for Supabase (database uses snake_case)
interface SupabaseTask extends Omit<Task, 'categoryId' | 'isRecurring'> { category_id: string; is_recurring: boolean; log_date: string; }
interface SupabaseDayType extends Omit<DayType, 'recurringTasks'> { recurring_tasks: RecurringTaskTemplate[]; }
interface SupabaseRecurringTask extends Omit<RecurringTaskTemplate, 'categoryId'> { category_id: string; }

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dayTypes, setDayTypes] = useState<DayType[]>([]);
  const [dailyLogs, setDailyLogs] = useState<{ [date: string]: DailyLog }>({});
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  const [isDayTypeManagerOpen, setDayTypeManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);

  // --- Data Loading from Supabase ---
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Fetch Categories
        const { data: catData, error: catError } = await supabase.from('categories').select('*');
        if (catError) throw catError;
        setCategories(catData);

        // Fetch Day Types and their recurring tasks
        const { data: dtData, error: dtError } = await supabase.from('day_types').select(`
          *,
          recurring_task_templates ( * )
        `);
        if (dtError) throw dtError;
        
        const formattedDayTypes = dtData.map((dt: any) => ({
          ...dt,
          recurringTasks: dt.recurring_task_templates.map((rt: SupabaseRecurringTask) => ({
            id: rt.id,
            text: rt.text,
            categoryId: rt.category_id
          }))
        }));
        setDayTypes(formattedDayTypes);

      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    }
    loadInitialData();
  }, []);

  // --- Daily Log Loading (when date changes) ---
  const fetchDailyLog = useCallback(async (date: string) => {
    // 1. Check for an existing log
    let { data: logData, error: logError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('date', date)
      .maybeSingle();
      
    if (logError) throw logError;

    // 2. If no log, create one
    if (!logData) {
      const { data: newLogData, error: newLogError } = await supabase
        .from('daily_logs')
        .insert({ date: date, day_type_id: null })
        .select()
        .single();
      if (newLogError) throw newLogError;
      logData = newLogData;
    }

    // 3. Fetch tasks for that log
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('log_date', date);
      
    if (taskError) throw taskError;

    const formattedTasks: Task[] = taskData.map((t: SupabaseTask) => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      categoryId: t.category_id,
      isRecurring: t.is_recurring
    }));

    // 4. Set the state
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
  
  // --- Core App Logic (Now talks to Supabase) ---

  const handleSelectDayType = async (dayTypeId: string) => {
    const selectedDayType = dayTypes.find(dt => dt.id === dayTypeId);
    if (!selectedDayType) return;

    // 1. Get existing non-recurring tasks
    const nonRecurringTasks = currentDailyLog.tasks.filter(t => !t.isRecurring);

    // 2. Create new recurring tasks for the database
    const newRecurringTasksForDb = selectedDayType.recurringTasks.map(rt => ({
      log_date: selectedDate,
      text: rt.text,
      category_id: rt.categoryId,
      is_recurring: true,
      completed: false
    }));

    // 3. Delete old recurring tasks
    await supabase.from('tasks').delete()
      .eq('log_date', selectedDate)
      .eq('is_recurring', true);
      
    // 4. Add new recurring tasks
    const { data: newTasksData, error: newTasksError } = await supabase
      .from('tasks')
      .insert(newRecurringTasksForDb)
      .select();
      
    if (newTasksError) throw newTasksError;
    
    // 5. Update the daily log
    await supabase.from('daily_logs').update({ day_type_id: dayTypeId }).eq('date', selectedDate);

    // 6. Update local state
    const newTasks: Task[] = newTasksData.map((t: SupabaseTask) => ({
      id: t.id, text: t.text, completed: t.completed, categoryId: t.category_id, isRecurring: t.is_recurring
    }));
    
    setDailyLogs(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        dayTypeId: dayTypeId,
        tasks: [...nonRecurringTasks, ...newTasks]
      }
    }));
  };

  const handleAddTask = async (text: string, categoryId: string) => {
    const newTaskForDb = {
      log_date: selectedDate,
      text: text,
      category_id: categoryId,
      is_recurring: false,
      completed: false
    };

    const { data, error } = await supabase.from('tasks').insert(newTaskForDb).select().single();
    if (error) throw error;
    
    const newTask: Task = {
      id: data.id, text: data.text, completed: data.completed, categoryId: data.category_id, isRecurring: data.is_recurring
    };

    setDailyLogs(prev => ({
      ...prev,
      [selectedDate]: { ...currentDailyLog, tasks: [...currentDailyLog.tasks, newTask] }
    }));
  };

  const handleToggleTask = async (id: string) => {
    const taskToToggle = currentDailyLog.tasks.find(t => t.id === id);
    if (!taskToToggle) return;

    const newCompletedState = !taskToToggle.completed;

    await supabase.from('tasks').update({ completed: newCompletedState }).eq('id', id);

    const newTasks = currentDailyLog.tasks.map(task =>
      task.id === id ? { ...task, completed: newCompletedState } : task
    );
    setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: newTasks } }));
  };

  const handleDeleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);

    const newTasks = currentDailyLog.tasks.filter(task => task.id !== id);
    setDailyLogs(prev => ({ ...prev, [selectedDate]: { ...currentDailyLog, tasks: newTasks } }));
  };

  // --- Management Functions (Also talk to Supabase) ---

  const handleAddCategory = async (name: string, color: string) => {
    const { data, error } = await supabase.from('categories').insert({ name, color }).select().single();
    if (error) throw error;
    setCategories([...categories, data]);
  };

  const handleUpdateCategory = async (id: string, name: string, color: string) => {
    await supabase.from('categories').update({ name, color }).eq('id', id);
    setCategories(categories.map(cat => cat.id === id ? { ...cat, name, color } : cat));
  };

  const handleDeleteCategory = async (id: string) => {
    // We can't delete 'uncategorized'
    if (id === 'uncategorized') return;
    
    // In a real app, you'd re-assign tasks, but for simplicity we'll just delete
    // The database is set to 'ON DELETE SET NULL' for category_id, so tasks won't be deleted.
    // We need to re-assign them to 'uncategorized'
    await supabase.from('tasks').update({ category_id: 'uncategorized' }).eq('category_id', id);
    await supabase.from('recurring_task_templates').update({ category_id: 'uncategorized' }).eq('category_id', id);
    
    await supabase.from('categories').delete().eq('id', id);
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleAddDayType = async (name: string) => {
    const { data, error } = await supabase.from('day_types').insert({ name }).select().single();
    if (error) throw error;
    setDayTypes([...dayTypes, { ...data, recurringTasks: [] }]);
  };

  const handleUpdateDayType = async (id: string, name: string) => {
    await supabase.from('day_types').update({ name }).eq('id', id);
    setDayTypes(dayTypes.map(dt => dt.id === id ? { ...dt, name } : dt));
  };

  const handleDeleteDayType = async (id: string) => {
    // Database cascade will delete recurring tasks
    await supabase.from('day_types').delete().eq('id', id);
    setDayTypes(dayTypes.filter(dt => dt.id !== id));
  };

  const handleAddRecurringTask = async (dayTypeId: string, text: string, categoryId: string) => {
    const newTaskTemplate = {
      day_type_id: dayTypeId,
      text: text,
      category_id: categoryId
    };
    
    const { data, error } = await supabase.from('recurring_task_templates').insert(newTaskTemplate).select().single();
    if (error) throw error;
    
    const formattedTask: RecurringTaskTemplate = { id: data.id, text: data.text, categoryId: data.category_id };
    
    setDayTypes(dayTypes.map(dt =>
      dt.id === dayTypeId ? { ...dt, recurringTasks: [...dt.recurringTasks, formattedTask] } : dt
    ));
  };

  const onDeleteRecurringTask = async (dayTypeId: string, taskId: string) => {
    await supabase.from('recurring_task_templates').delete().eq('id', taskId);
    
    setDayTypes(dayTypes.map(dt =>
      dt.id === dayTypeId ? { ...dt, recurringTasks: dt.recurringTasks.filter(rt => rt.id !== taskId) } : dt
    ));
  };

  // --- No changes needed below this line ---

  const completionPercentage = useMemo(() => {
    const totalTasks = currentDailyLog.tasks.length;
    if (totalTasks === 0) return 0;
    const completedTasks = currentDailyLog.tasks.filter(t => t.completed).length;
    return (completedTasks / totalTasks) * 100;
  }, [currentDailyLog.tasks]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <Header completionPercentage={completionPercentage} selectedDate={selectedDate} />
        
        <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <main>
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
          onAddRecurringTask={handleAddRecurringTask}
          onDeleteRecurringTask={onDeleteRecurringTask}
        />

        <CategoryManager
          isOpen={isCategoryManagerOpen}
          onClose={() => setCategoryManagerOpen(false)}
          categories={categories}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </div>
    </div>
  );
}

export default App;
