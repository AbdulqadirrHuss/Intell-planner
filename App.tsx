import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Category, DayType, RecurringTaskTemplate, DailyLog } from './types';
import Header from './Header'; // NOTE: Assuming components are in root
import TaskList from './TaskList'; // NOTE: Assuming components are in root
import AddTaskForm from './AddTaskForm'; // NOTE: Assuming components are in root
import DayTypeManager from './DayTypeManager'; // NOTE: Assuming components are in root
import CategoryManager from './CategoryManager'; // NOTE: Assuming components are in root
import { SettingsIcon, EditIcon } from './icons'; // NOTE: Assuming components are in root
import DateNavigator from './DateNavigator'; // NOTE: Assuming components are in root
import { createClient } from '@supabase/supabase-js';

// --- Supabase Setup ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// ----------------------

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- Type Mappings for Supabase ---
interface SupabaseTask extends Omit<Task, 'categoryId' | 'isRecurring'> { category_id: string; is_recurring: boolean; log_date: string; }
interface SupabaseRecurringTask extends Omit<RecurringTaskTemplate, 'categoryId'> { category_id: string; }
interface SupabaseDayTypeCategoryLink { day_type_id: string; category_id: string; }

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dayTypes, setDayTypes] = useState<DayType[]>([]);
  const [dailyLogs, setDailyLogs] = useState<{ [date: string]: DailyLog }>({});
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  const [isDayTypeManagerOpen, setDayTypeManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);

  // --- Data Loading from Supabase (New Logic) ---
  useEffect(() => {
    async function loadInitialData() {
      try {
        // 1. Fetch Categories AND their recurring tasks
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select(`
            *,
            recurring_task_templates ( * )
          `);
        if (catError) throw catError;

        const formattedCategories: Category[] = catData.map((cat: any) => ({
          ...cat,
          recurringTasks: cat.recurring_task_templates.map((rt: SupabaseRecurringTask) => ({
            id: rt.id,
            text: rt.text,
            categoryId: rt.category_id
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

  // --- Daily Log Loading (when date changes) ---
  const fetchDailyLog = useCallback(async (date: string) => {
    let { data: logData, error: logError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('date', date)
      .maybeSingle();
      
    if (logError) throw logError;

    if (!logData) {
      const { data: newLogData, error: newLogError } = await supabase
        .from('daily_logs')
        .insert({ date: date, day_type_id: null })
        .select()
        .single();
      if (newLogError) throw newLogError;
      logData = newLogData;
    }

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
  
  // --- Core App Logic (NEW LOGIC) ---
  const handleSelectDayType = async (dayTypeId: string) => {
    const selectedDayType = dayTypes.find(dt => dt.id === dayTypeId);
    if (!selectedDayType) return;

    // 1. Get existing non-recurring tasks from state
    const nonRecurringTasks = currentDailyLog.tasks.filter(t => !t.isRecurring);

    // 2. Find all categories linked to this day type
    const categoryIdsForDayType = selectedDayType.categoryIds;
    
    // 3. Get all recurring task templates from those categories
    const allRecurringTasks: RecurringTaskTemplate[] = [];
    categoryIdsForDayType.forEach(catId => {
      const category = categories.find(c => c.id === catId);
      if (category) {
        allRecurringTasks.push(...category.recurringTasks);
      }
    });

    // 4. Create new tasks for the database
    const newRecurringTasksForDb = allRecurringTasks.map(rt => ({
      log_date: selectedDate,
      text: rt.text,
      category_id: rt.categoryId,
      is_recurring: true,
      completed: false
    }));

    // 5. Delete old recurring tasks from DB
    await supabase.from('tasks').delete()
      .eq('log_date', selectedDate)
      .eq('is_recurring', true);
      
    // 6. Add new recurring tasks to DB
    const { data: newTasksData, error: newTasksError } = await supabase
      .from('tasks')
      .insert(newRecurringTasksForDb)
      .select();
      
    if (newTasksError) throw newTasksError;
    
    // 7. Update the daily log's dayTypeId in DB
    await supabase.from('daily_logs').update({ day_type_id: dayTypeId }).eq('date', selectedDate);

    // 8. Update local state
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
      log_date: selectedDate, text: text, category_id: categoryId,
      is_recurring: false, completed: false
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

  // --- Category Management (NEW LOGIC) ---
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
    // Database cascade will delete tasks in recurring_task_templates
    // We must manually re-assign tasks and day_type_categories links
    await supabase.from('tasks').update({ category_id: 'uncategorized' }).eq('category_id', id);
    await supabase.from('day_type_categories').delete().eq('category_id', id); // Just remove links
    await supabase.from('categories').delete().eq('id', id);
    
    setCategories(categories.filter(cat => cat.id !== id));
    // Also update dayTypes state to remove the link
    setDayTypes(prevDayTypes => prevDayTypes.map(dt => ({
      ...dt,
      categoryIds: dt.categoryIds.filter(catId => catId !== id)
    })));
  };
  const handleAddRecurringTask = async (categoryId: string, text: string) => {
    const { data, error } = await supabase.from('recurring_task_templates').insert({ category_id: categoryId, text }).select().single();
    if (error) throw error;
    const newTask: RecurringTaskTemplate = { id: data.id, text: data.text, categoryId: data.category_id };
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

  // --- Day Type Management (NEW LOGIC) ---
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
    await supabase.from('day_types').delete().eq('id', id); // DB cascade deletes links
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

  // --- No changes needed to JSX ---
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
        />
      </div>
    </div>
  );
}

export default App;
