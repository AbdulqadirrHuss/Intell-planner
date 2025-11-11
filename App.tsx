// abdulqadirrhuss/intell-planner/Intell-planner-713a94aab450542265643e214f51f6b366832262/App.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Category, DayType, RecurringTaskTemplate, DailyLog, Subtask, RecurringSubtaskTemplate } from './types';
import Header from './Header';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm';
import DayTypeManager from './DayTypeManager';
import CategoryManager from './CategoryManager';
import { SettingsIcon, EditIcon } from './icons';
import DateNavigator from './DateNavigator';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getTodayDateString = () => new Date().toISOString().split('T')[0];

interface SupabaseTask extends Omit<Task, 'categoryId' | 'isRecurring' | 'subtasks'> { category_id: string; is_recurring: boolean; log_date: string; }
interface SupabaseSubtask extends Omit<Subtask, 'parent_task_id' | 'isRecurring'> { parent_task_id: string; log_date: string; is_recurring: boolean; }
interface SupabaseRecurringTask extends Omit<RecurringTaskTemplate, 'categoryId' | 'daysOfWeek' | 'subtaskTemplates'> { 
  category_id: string; 
  days_of_week: number[];
}
interface SupabaseRecurringSubtaskTemplate extends Omit<RecurringSubtaskTemplate, 'parentTemplateId'> { parent_template_id: string; }
interface SupabaseDayTypeCategoryLink { day_type_id: string; category_id: string; }

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dayTypes, setDayTypes] = useState<DayType[]>([]);
  const [dailyLogs, setDailyLogs] = useState<{ [date: string]: DailyLog }>({});
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  const [isDayTypeManagerOpen, setDayTypeManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); 

  useEffect(() => {
    async function loadInitialData() {
      try {
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
            daysOfWeek: rt.days_of_week || [],
            subtaskTemplates: rt.recurring_subtask_templates.map((rst: SupabaseRecurringSubtaskTemplate) => ({
              id: rst.id,
              text: rst.text,
              parentTemplateId: rst.parent_template_id
            }))
          }))
        }));
        setCategories(formattedCategories);

        const { data: dtData, error: dtError } = await supabase.from('day_types').select('*');
        if (dtError) throw dtError;
        
        const { data: linksData, error: linksError } = await supabase.from('day_type_categories').select('*');
        if (linksError) throw linksError;

        const formattedDayTypes: DayType[] = dtData.map(dt => ({
          id: dt.id,
          name: dt.name,
          categoryIds: linksData
            .filter((link: SupabaseDayTypeCategoryLink) => link.day_type_id === dt.id)
            .map((link: SupabaseDayTypeCategoryLink) => link.category_id)
        }));
        setDayTypes(formattedDayTypes);
        setIsDataLoaded(true); 

      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    }
    loadInitialData();
  }, []);

  const regenerateTasks = useCallback(async (dayTypeId: string, date: string) => {
    const selectedDayType = dayTypes.find(dt => dt.id === dayTypeId);
    if (!selectedDayType) return;

    const currentDayOfWeek = new Date(date + 'T00:00:00').getDay();
    
    const log = dailyLogs[date] || { date: date, dayTypeId: null, tasks: [] };
    const nonRecurringTasks = log.tasks.filter(t => !t.isRecurring);

    const categoryIdsForDayType = selectedDayType.categoryIds;
    
    const allRecurringTaskTemplates: RecurringTaskTemplate[] = [];
    categoryIdsForDayType.forEach(catId => {
      const category = categories.find(c => c.id === catId);
      if (category) {
        const tasksForThisDay = category.recurringTasks.filter(rt => {
          const hasDaysSet = rt.daysOfWeek && rt.daysOfWeek.length > 0;
          if (!hasDaysSet) return true;
          return rt.daysOfWeek.includes(currentDayOfWeek);
        });
        allRecurringTaskTemplates.push(...tasksForThisDay);
      }
    });

    const { data: oldRecTasks } = await supabase.from('tasks').select('id')
      .eq('log_date', date).eq('is_recurring', true);
    const oldRecTaskIds = oldRecTasks?.map(t => t.id) || [];
    
    if (oldRecTaskIds.length > 0) {
      await supabase.from('subtasks').delete().in('parent_task_id', oldRecTaskIds);
      await supabase.from('tasks').delete().in('id', oldRecTaskIds);
    }
      
    if (allRecurringTaskTemplates.length === 0) {
       await supabase.from('daily_logs').update({ day_type_id: dayTypeId }).eq('date', date);
       setDailyLogs(prev => ({
         ...prev,
         [date]: { ...log, dayTypeId: dayTypeId, tasks: nonRecurringTasks }
       }));
       return;
    }

    const newRecurringTasksForDb = allRecurringTaskTemplates.map(rt => ({
      log_date: date, text: rt.text, category_id: rt.categoryId,
      is_recurring: true, completed: false
    }));

    const { data: newTasksData, error: newTasksError } = await supabase
      .from('tasks').insert(newRecurringTasksForDb).select();
    if (newTasksError) throw newTasksError;

    const newSubtasksForDb: Omit<SupabaseSubtask, 'id' | 'completed'>[] = [];
    const newTasks: Task[] = newTasksData.map((t: SupabaseTask, index: number) => {
      const template = allRecurringTaskTemplates[index];
      template.subtaskTemplates.forEach(rst => {
        newSubtasksForDb.push({
          parent_task_id: t.id,
          text: rst.text,
          log_date: date,
          is_recurring: true
        });
      });
      return {
        id: t.id, text: t.text, completed: t.completed, categoryId: t.category_id, isRecurring: t.is_recurring,
        subtasks: []
      };
    });

    let newSubtasks: Subtask[] = [];
    if (newSubtasksForDb.length > 0) {
        const { data: newSubtasksData, error: newSubtasksError } = await supabase
          .from('subtasks').insert(newSubtasksForDb).select();
        if (newSubtasksError) throw newSubtasksError;
        newSubtasks = newSubtasksData.map((st: SupabaseSubtask) => ({
          id: st.id, parent_task_id: st.parent_task_id, log_date: st.log_date, text: st.text, completed: st.completed, isRecurring: st.is_recurring
        }));
    }

    await supabase.from('daily_logs').update({ day_type_id: dayTypeId }).eq('date', date);
    
    newTasks.forEach(task => {
      task.subtasks = newSubtasks.filter(st => st.parent_task_id === task.id);
    });
    
    setDailyLogs(prev => ({
      ...prev,
      [date]: {
        ...log,
        dayTypeId: dayTypeId,
        tasks: [...nonRecurringTasks, ...newTasks]
      }
    }));
  }, [categories, dayTypes, dailyLogs]); 


  const fetchDailyLog = useCallback(async (date: string) => {
    if (!isDataLoaded) { 
      setTimeout(() => fetchDailyLog(date), 100);
      return;
    }

    let { data: logData, error: logError } = await supabase
      .from('daily_logs').select('*').eq('date', date).maybeSingle();
      
    if (logError) throw logError;
    if (!logData) {
      const { data: newLogData, error: newLogError } = await supabase
        .from('daily_logs').insert({ date: date, day_type_id: null }).select().single();
      if (newLogError) throw newLogError;
      logData = newLogData;
    }
    
    const { data: taskData, error: taskError } = await supabase
      .from('tasks').select('*').eq('log_date', date);
    if (taskError) throw taskError;
    const { data: subtaskData, error: subtaskError } = await supabase
      .from('subtasks').select('*').eq('log_date', date);
    if (subtaskError) throw subtaskError;

    const subtasks: Subtask[] = subtaskData.map((st: SupabaseSubtask) => ({
      id: st.id, parent_task_id: st.parent_task_id, log_date: st.log_date, text: st.text, completed: st.completed, isRecurring: st.is_recurring || false
    }));
    const formattedTasks: Task[] = taskData.map((t: SupabaseTask) => ({
      id: t.id, text: t.text, completed: t.completed, categoryId: t.category_id, isRecurring: t.is_recurring,
      subtasks: subtasks.filter(st => st.parent_task_id === t.id)
    }));

    setDailyLogs(prevLogs => ({
      ...prevLogs,
      [date]: {
        date: logData.date,
        dayTypeId: logData.day_type_id,
        tasks: formattedTasks
      }
    }));
    
  }, [isDataLoaded]); 

  useEffect(() => {
    fetchDailyLog(selectedDate);
  }, [selectedDate, fetchDailyLog]);

  const currentDailyLog = useMemo(() => {
    return dailyLogs[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
  }, [dailyLogs, selectedDate]);
  
  const handleSelectDayTypeFromDropdown = (dayTypeId: string) => {
    regenerateTasks(dayTypeId, selectedDate);
  };

  const handleAddTask = async (text: string, categoryId: string) => {
    const newTaskForDb = {
      log_date: selectedDate, text: text, category_id: categoryId,
      is_recurring: false, completed: false
    };
    const { data, error } = await supabase.from('tasks').insert(newTaskForDb).select().single();
    if (error) throw error;
    
    const newTask: Task = {
      id: data.id, text: data.text, completed: data.completed, categoryId: data.category_id, isRecurring: data.is_recurring,
      subtasks: []
    };

    setDailyLogs(prev => {
      const log = prev[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
      return {
        ...prev,
        [selectedDate]: { ...log, tasks: [...log.tasks, newTask] }
      };
    });
  };

  const handleToggleTask = async (id: string) => {
    setDailyLogs(prev => {
      const log = prev[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
      const taskToToggle = log.tasks.find(t => t.id === id);

      if (!taskToToggle || (taskToToggle.subtasks && taskToToggle.subtasks.length > 0)) {
        return prev;
      }
      
      const newCompletedState = !taskToToggle.completed;
      
      supabase.from('tasks').update({ completed: newCompletedState }).eq('id', id).then();
      
      const newTasks = log.tasks.map(task =>
        task.id === id ? { ...task, completed: newCompletedState } : task
      );
      return { ...prev, [selectedDate]: { ...log, tasks: newTasks } };
    });
  };

  const handleDeleteTask = async (id: string) => {
    await supabase.from('subtasks').delete().eq('parent_task_id', id);
    await supabase.from('tasks').delete().eq('id', id);
    
    setDailyLogs(prev => {
      const log = prev[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
      const newTasks = log.tasks.filter(task => task.id !== id);
      return { ...prev, [selectedDate]: { ...log, tasks: newTasks } };
    });
  };

  const handleUpdateTaskText = async (taskId: string, newText: string) => {
    await supabase.from('tasks').update({ text: newText }).eq('id', taskId);
    
    setDailyLogs(prevLogs => {
      const log = prevLogs[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
      const newTasks = log.tasks.map(task =>
          task.id === taskId ? { ...task, text: newText } : task
      );
      return { ...prevLogs, [selectedDate]: { ...log, tasks: newTasks } };
    });
  };

  const handleAddSubtask = async (taskId: string, text: string) => {
    const { data, error } = await supabase.from('subtasks').insert({
      parent_task_id: taskId,
      log_date: selectedDate,
      text: text,
      is_recurring: false
    }).select().single();
    if (error) throw error;
    
    const newSubtask: Subtask = {
      id: data.id, parent_task_id: data.parent_task_id, log_date: data.log_date, text: data.text, completed: data.completed, isRecurring: false
    };
    
    setDailyLogs(prev => {
      const log = prev[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
      const newTasks = log.tasks.map(task => 
        task.id === taskId ? { ...task, subtasks: [...task.subtasks, newSubtask] } : task
      );
      return { ...prev, [selectedDate]: { ...log, tasks: newTasks } };
    });
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await supabase.from('subtasks').delete().eq('id', subtaskId);
    
    setDailyLogs(prev => {
      const log = prev[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
      const newTasks = log.tasks.map(task => ({
        ...task,
        subtasks: task.subtasks.filter(st => st.id !== subtaskId)
      }));
      return { ...prev, [selectedDate]: { ...log, tasks: newTasks } };
    });
  };

  const handleUpdateSubtaskText = async (taskId: string, subtaskId: string, newText: string) => {
    await supabase.from('subtasks').update({ text: newText }).eq('id', subtaskId);

    setDailyLogs(prevLogs => {
      const log = prevLogs[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
      const newTasks = log.tasks.map(task =>
        task.id === taskId ? {
          ...task,
          subtasks: task.subtasks.map(subtask =>
            subtask.id === subtaskId ? { ...subtask, text: newText } : subtask
          )
        } : task
      );
      return { ...prevLogs, [selectedDate]: { ...log, tasks: newTasks } };
    });
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    setDailyLogs(prev => {
      const log = prev[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
      const task = log.tasks.find(t => t.id === taskId);
      if (!task) return prev;
      
      const subtask = task.subtasks.find(st => st.id === subtaskId);
      if (!subtask) return prev;
      
      const newSubtaskState = !subtask.completed;
      let parentCompletedState = task.completed;
      const originalParentState = task.completed;

      const newTasks = log.tasks.map(t => {
        if (t.id === taskId) {
          const newSubtasks = t.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: newSubtaskState } : st
          );
          
          const allSubtasksComplete = newSubtasks.every(st => st.completed);
          parentCompletedState = t.completed; 

          if (allSubtasksComplete && !t.completed) {
            parentCompletedState = true;
          } else if (!allSubtasksComplete && t.completed) {
            parentCompletedState = false;
          }
          
          return { ...t, completed: parentCompletedState, subtasks: newSubtasks };
        }
        return t;
      });
      
      supabase.from('subtasks').update({ completed: newSubtaskState }).eq('id', subtaskId).then();
      
      if (originalParentState !== parentCompletedState) {
        supabase.from('tasks').update({ completed: parentCompletedState }).eq('id', taskId).then();
      }

      return { ...prev, [selectedDate]: { ...log, tasks: newTasks } };
    });
  };

  // NEW: Toggle subtask recurring status
  const handleToggleSubtaskRecurring = async (taskId: string, subtaskId: string) => {
    setDailyLogs(prev => {
      const log = prev[selectedDate] || { date: selectedDate, dayTypeId: null, tasks: [] };
      const task = log.tasks.find(t => t.id === taskId);
      if (!task) return prev;
      
      const subtask = task.subtasks.find(st => st.id === subtaskId);
      if (!subtask) return prev;
      
      const newRecurringState = !subtask.isRecurring;
      
      // Update database
      supabase.from('subtasks').update({ is_recurring: newRecurringState }).eq('id', subtaskId).then();
      
      // If making recurring and parent is recurring, add to template
      if (newRecurringState && task.isRecurring) {
        const category = categories.find(c => c.id === task.categoryId);
        const recurringTask = category?.recurringTasks.find(rt => rt.text === task.text);
        if (recurringTask) {
          supabase.from('recurring_subtask_templates').insert({
            parent_template_id: recurringTask.id,
            text: subtask.text
          }).then(({ data }) => {
            if (data) {
              setCategories(prevCats => prevCats.map(cat => ({
                ...cat,
                recurringTasks: cat.recurringTasks.map(rt =>
                  rt.id === recurringTask.id ? {
                    ...rt,
                    subtaskTemplates: [...rt.subtaskTemplates, {
                      id: data[0].id,
                      text: subtask.text,
                      parentTemplateId: recurringTask.id
                    }]
                  } : rt
                )
              })));
            }
          });
        }
      }
      
      const newTasks = log.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map(st =>
              st.id === subtaskId ? { ...st, isRecurring: newRecurringState } : st
            )
          };
        }
        return t;
      });
      
      return { ...prev, [selectedDate]: { ...log, tasks: newTasks } };
    });
  };

  const handleAddCategory = async (name: string, color: string) => {
    const { data, error } = await supabase.from('categories').insert({ name, color, id: crypto.randomUUID() }).select().single();
    if (error) throw error;
    setCategories(prev => [...prev, { ...data, recurringTasks: [] }]);
  };
  const handleUpdateCategory = async (id: string, name: string, color: string) => {
    await supabase.from('categories').update({ name, color }).eq('id', id);
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name, color } : cat));
  };
  const handleDeleteCategory = async (id: string) => {
    if (id === 'uncategorized') return;
    await supabase.from('tasks').update({ category_id: 'uncategorized' }).eq('category_id', id);
    await supabase.from('day_type_categories').delete().eq('category_id', id);
    await supabase.from('categories').delete().eq('id', id);
    
    setCategories(prev => prev.filter(cat => cat.id !== id));
    setDayTypes(prev => prev.map(dt => ({
      ...dt,
      categoryIds: dt.categoryIds.filter(catId => catId !== id)
    })));
  };
  
  const handleAddRecurringTask = async (categoryId: string, text: string) => {
    const { data, error } = await supabase.from('recurring_task_templates').insert({ 
      category_id: categoryId, text: text, days_of_week: []
    }).select().single();
    if (error) throw error;
    const newTask: RecurringTaskTemplate = { 
      id: data.id, text: data.text, categoryId: data.category_id, 
      daysOfWeek: data.days_of_week, subtaskTemplates: [] 
    };
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, recurringTasks: [...cat.recurringTasks, newTask] } : cat
    ));
  };
  const onDeleteRecurringTask = async (taskId: string) => {
    await supabase.from('recurring_task_templates').delete().eq('id', taskId);
    setCategories(prev => prev.map(cat => ({
      ...cat,
      recurringTasks: cat.recurringTasks.filter(rt => rt.id !== taskId)
    })));
  };

  const onUpdateRecurringTask = async (task: RecurringTaskTemplate) => {
    await supabase.from('recurring_task_templates')
      .update({ days_of_week: task.daysOfWeek })
      .eq('id', task.id);
    
    setCategories(prevCategories => prevCategories.map(cat => ({
      ...cat,
      recurringTasks: cat.recurringTasks.map(rt => rt.id === task.id ? task : rt)
    })));
  };

  const handleUpdateRecurringTaskText = async (taskId: string, newText: string) => {
    await supabase.from('recurring_task_templates').update({ text: newText }).eq('id', taskId);

    setCategories(prevCategories => prevCategories.map(cat => ({
      ...cat,
      recurringTasks: cat.recurringTasks.map(rt =>
        rt.id === taskId ? { ...rt, text: newText } : rt
      )
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

    setCategories(prevCategories => prevCategories.map(cat => ({
      ...cat,
      recurringTasks: cat.recurringTasks.map(rt => 
        rt.id === parentTemplateId ? { ...rt, subtaskTemplates: [...rt.subtaskTemplates, newSubtaskTemplate] } : rt
      )
    })));
  };

  const onDeleteRecurringSubtask = async (subtaskTemplateId: string) => {
    await supabase.from('recurring_subtask_templates').delete().eq('id', subtaskTemplateId);
    
    setCategories(prevCategories => prevCategories.map(cat => ({
      ...cat,
      recurringTasks: cat.recurringTasks.map(rt => ({
        ...rt,
        subtaskTemplates: rt.subtaskTemplates.filter(st => st.id !== subtaskTemplateId)
      }))
    })));
  };

  const handleUpdateRecurringSubtaskText = async (subtaskTemplateId: string, newText: string) => {
    await supabase.from('recurring_subtask_templates').update({ text: newText }).eq('id', subtaskTemplateId);

    setCategories(prevCategories => prevCategories.map(cat => ({
      ...cat,
      recurringTasks: cat.recurringTasks.map(rt => ({
        ...rt,
        subtaskTemplates: rt.subtaskTemplates.map(st =>
          st.id === subtaskTemplateId ? { ...st, text: newText } : st
        )
      }))
    })));
  };

  const handleAddDayType = async (name: string) => {
    const { data, error } = await supabase.from('day_types').insert({ name, id: crypto.randomUUID() }).select().single();
    if (error) throw error;
    setDayTypes(prev => [...prev, { ...data, categoryIds: [] }]);
  };
  const handleUpdateDayType = async (id: string, name: string) => {
    await supabase.from('day_types').update({ name }).eq('id', id);
    setDayTypes(prev => prev.map(dt => dt.id === id ? { ...dt, name } : dt));
  };
  const handleDeleteDayType = async (id: string) => {
    await supabase.from('day_types').delete().eq('id', id);
    setDayTypes(prev => prev.filter(dt => dt.id !== id));
  };
  const handleAddCategoryToDayType = async (dayTypeId: string, categoryId: string) => {
    await supabase.from('day_type_categories').insert({ day_type_id: dayTypeId, category_id: categoryId });
    setDayTypes(prev => prev.map(dt =>
      dt.id === dayTypeId ? { ...dt, categoryIds: [...dt.categoryIds, categoryId] } : dt
    ));
  };
  const onRemoveCategoryFromDayType = async (dayTypeId: string, categoryId: string) => {
    await supabase.from('day_type_categories').delete()
      .eq('day_type_id', dayTypeId)
      .eq('category_id', categoryId);
    setDayTypes(prev => prev.map(dt =>
      dt.id === dayTypeId ? { ...dt, categoryIds: dt.categoryIds.filter(cId => cId !== categoryId) } : dt
    ));
  };

  const completionPercentage = useMemo(() => {
    const tasks = currentDailyLog.tasks;
    const totalParentTasks = tasks.length;
    if (totalParentTasks === 0) return 0;

    const progressPerParent = 100 / totalParentTasks;

    const totalProgress = tasks.reduce((acc, task) => {
      if (task.subtasks.length === 0) {
        return acc + (task.completed ? progressPerParent : 0);
      } else {
        if (task.subtasks.length === 0) return acc;
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
                  onChange={(e) => handleSelectDayTypeFromDropdown(e.target.value)}
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
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onAddSubtask={handleAddSubtask}
            onUpdateTaskText={handleUpdateTaskText}
            onUpdateSubtaskText={handleUpdateSubtaskText}
            onToggleSubtaskRecurring={handleToggleSubtaskRecurring}
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
          onUpdateRecurringTask={onUpdateRecurringTask}
          onAddRecurringSubtask={onAddRecurringSubtask}
          onDeleteRecurringSubtask={onDeleteRecurringSubtask}
          onUpdateRecurringTaskText={handleUpdateRecurringTaskText}
          onUpdateRecurringSubtaskText={handleUpdateRecurringSubtaskText}
        />
      </div>
    </div>
  );
}

export default App;
