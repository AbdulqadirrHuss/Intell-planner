import React from 'react';
import { Task, Category, DailyLog } from './types';
import Header from './Header';
import DateNavigator from './DateNavigator';
import TaskList from './TaskList';
import AdvancedTaskForm from './AdvancedTaskForm';
import { RecurringIcon, CheckIcon } from './icons';

interface TasksPageProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  completionPercentage: number;
  dailyLog: DailyLog;
  dayTypes: any[];
  categories: Category[];
  onSelectDayType: (id: string) => void;
  onOpenDayTypeManager: () => void;
  onOpenCategoryManager: () => void;
  onOpenTrackerManager: () => void;
  onReorderCategories: (ids: string[]) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (tid: string, sid: string) => void;
  onDeleteSubtask: (sid: string) => void;
  onAddSubtask: (tid: string, text: string) => void;
  onUpdateTaskText: (tid: string, text: string) => void;
  onUpdateSubtaskText: (tid: string, sid: string, text: string) => void;
  onToggleSubtaskRecurring: (tid: string, sid: string) => void;
  onAddTask: (text: string, catId: string, isRecurring: boolean) => void;
}

const TasksPage: React.FC<TasksPageProps> = (props) => {
  // 1. ROUTINE TASKS: Anything that is marked as recurring (comes from Day Type)
  // We show these regardless of category because they are part of the "Day Structure"
  const routineTasks = props.dailyLog.tasks.filter(t => t.isRecurring);
  
  // 2. MY TODOS: One-off tasks that are UNLINKED (Uncategorized).
  // We hide categorized one-offs (like "Email Client" under "Work") because those live in the Planner.
  // This ensures this section is a "Blank Slate" for your random thoughts/todos.
  const todoTasks = props.dailyLog.tasks.filter(t => 
    !t.isRecurring && (!t.categoryId || t.categoryId === 'uncategorized')
  );

  // Pass empty list for sorting because we aren't grouping by category here
  const dummySortedIds: string[] = [];

  return (
    <div className="animate-in fade-in flex flex-col min-h-[85vh] pb-24">
      <Header completionPercentage={props.completionPercentage} selectedDate={props.selectedDate} />
      
      <div className="bg-gray-800 rounded-xl p-2 mb-6 shadow-lg border border-gray-700 flex flex-col md:flex-row items-center gap-4">
           <div className="flex-grow w-full">
              <DateNavigator selectedDate={props.selectedDate} onDateChange={props.setSelectedDate} />
           </div>
      </div>

      <div className="flex justify-between items-end mb-6 px-2">
          <div className="flex flex-col">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Day Mode</span>
               <select 
                  value={props.dailyLog.dayTypeId || ''} 
                  onChange={(e) => props.onSelectDayType(e.target.value)} 
                  className="bg-transparent text-indigo-300 text-xl font-bold border-none focus:ring-0 p-0 cursor-pointer hover:text-indigo-200"
              >
                <option value="" disabled>Select Type...</option>
                {props.dayTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
              </select>
          </div>
          <button onClick={props.onOpenDayTypeManager} className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
            Manage Routine
          </button>
      </div>

      {/* SECTION 1: ROUTINE & HABITS */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4 px-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg"><RecurringIcon className="w-5 h-5 text-indigo-400" /></div>
            <h3 className="text-lg font-bold text-gray-100">Routine & Habits</h3>
            <span className="text-xs font-medium text-gray-500 ml-auto">{routineTasks.filter(t=>t.completed).length}/{routineTasks.length} Done</span>
        </div>
        
        {routineTasks.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl bg-gray-800/30 text-gray-500 text-sm">
                No routine loaded for this day type.
            </div>
        ) : (
            <TaskList
                tasks={routineTasks}
                categories={props.categories}
                sortedCategoryIds={dummySortedIds}
                onReorderCategories={props.onReorderCategories}
                onToggleTask={props.onToggleTask}
                onDeleteTask={props.onDeleteTask}
                onToggleSubtask={props.onToggleSubtask}
                onDeleteSubtask={props.onDeleteSubtask}
                onAddSubtask={props.onAddSubtask}
                onUpdateTaskText={props.onUpdateTaskText}
                onUpdateSubtaskText={props.onUpdateSubtaskText}
                onToggleSubtaskRecurring={props.onToggleSubtaskRecurring}
            />
        )}
      </div>

      {/* SECTION 2: MY TODOS (One-off) */}
      <div className="flex-grow">
        <div className="flex items-center gap-3 mb-4 px-2 pt-6 border-t border-gray-800/50">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg"><CheckIcon className="w-5 h-5 text-emerald-400" /></div>
            <h3 className="text-lg font-bold text-gray-100">My Todos</h3>
            <span className="text-xs font-medium text-gray-500 ml-auto">{todoTasks.filter(t=>t.completed).length}/{todoTasks.length} Done</span>
        </div>

        {todoTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-600 italic text-sm">
                Your todo list is clear. Add tasks below.
            </div>
        ) : (
            <TaskList
                tasks={todoTasks}
                categories={props.categories}
                sortedCategoryIds={dummySortedIds}
                onReorderCategories={props.onReorderCategories}
                onToggleTask={props.onToggleTask}
                onDeleteTask={props.onDeleteTask}
                onToggleSubtask={props.onToggleSubtask}
                onDeleteSubtask={props.onDeleteSubtask}
                onAddSubtask={props.onAddSubtask}
                onUpdateTaskText={props.onUpdateTaskText}
                onUpdateSubtaskText={props.onUpdateSubtaskText}
                onToggleSubtaskRecurring={props.onToggleSubtaskRecurring}
            />
        )}
      </div>
      
      <div className="sticky bottom-6 z-20">
        <AdvancedTaskForm categories={props.categories} onAddTask={props.onAddTask} />
      </div>
    </div>
  );
};

export default TasksPage;
