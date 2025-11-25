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
  // Filter for the "Blank Slate" behavior:
  // Only show tasks that are NOT linked to a category (Uncategorized)
  const uncategorizedTasks = props.dailyLog.tasks.filter(
    t => t.categoryId === 'uncategorized' || !t.categoryId
  );

  // Tripartite Division of the Uncategorized List
  const routineTasks = uncategorizedTasks.filter(t => t.isRecurring);
  const todoTasks = uncategorizedTasks.filter(t => !t.isRecurring);

  // We pass an empty list for sortedIds because we are only showing Uncategorized here
  const dummySortedIds: string[] = [];

  return (
    <div className="animate-in fade-in flex flex-col min-h-[85vh] pb-24">
      <Header completionPercentage={props.completionPercentage} selectedDate={props.selectedDate} />
      
      <div className="bg-gray-800 rounded-xl p-2 mb-6 shadow-lg border border-gray-700 flex flex-col md:flex-row items-center gap-4">
           <div className="flex-grow w-full">
              <DateNavigator selectedDate={props.selectedDate} onDateChange={props.setSelectedDate} />
           </div>
      </div>

      {/* SECTION 1: ROUTINE & HABITS (Blank Slate / Unlinked) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-2">
            <RecurringIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-200 uppercase tracking-wide">Routine & Habits</h3>
            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-500 border border-gray-700">{routineTasks.length}</span>
        </div>
        
        {routineTasks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-xl text-gray-600">
                <p>No routines set.</p>
                <p className="text-xs mt-1">Add a recurring task with "No Link" below to populate this list.</p>
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

      {/* SECTION 2: MY TODOS (One-off / Unlinked) */}
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-4 px-2 pt-6 border-t border-gray-800">
            <CheckIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-gray-200 uppercase tracking-wide">My Todos</h3>
            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-500 border border-gray-700">{todoTasks.length}</span>
        </div>

        {todoTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-600 italic">
                No independent todos for today.
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
      
      {/* SECTION 3: COMPOSER */}
      <div className="sticky bottom-6 z-20">
        <AdvancedTaskForm categories={props.categories} onAddTask={props.onAddTask} />
      </div>
    </div>
  );
};

export default TasksPage;
