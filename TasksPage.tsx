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
  const sortedCategoryIds = props.dayTypes.find(dt => dt.id === props.dailyLog.dayTypeId)?.categoryIds || [];

  // --- THE TRIPARTITE DIVISION ---
  // 1. Routine Tasks (From Day Type Templates)
  const routineTasks = props.dailyLog.tasks.filter(t => t.isRecurring);
  
  // 2. One-off Todos (Manually Added)
  const todoTasks = props.dailyLog.tasks.filter(t => !t.isRecurring);

  return (
    <div className="animate-in fade-in flex flex-col min-h-[85vh] pb-24">
      <Header completionPercentage={props.completionPercentage} selectedDate={props.selectedDate} />
      
      {/* Date Navigator */}
      <div className="bg-gray-800 rounded-xl p-2 mb-6 shadow-lg border border-gray-700 flex flex-col md:flex-row items-center gap-4">
           <div className="flex-grow w-full">
              <DateNavigator selectedDate={props.selectedDate} onDateChange={props.setSelectedDate} />
           </div>
      </div>

      {/* SECTION 1: ROUTINE & HABITS */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-2">
            <RecurringIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-200 uppercase tracking-wide">Routine & Habits</h3>
            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-500 border border-gray-700">{routineTasks.length}</span>
        </div>
        
        {routineTasks.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-xl text-gray-600">
                No routine set for this day type. <button onClick={props.onOpenCategoryManager} className="text-indigo-400 underline">Manage Templates</button>
            </div>
        ) : (
            <TaskList
                tasks={routineTasks}
                categories={props.categories}
                sortedCategoryIds={sortedCategoryIds}
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

      {/* SECTION 2: MY TODOS (ONE-OFFS) */}
      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-4 px-2 pt-6 border-t border-gray-800">
            <CheckIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-gray-200 uppercase tracking-wide">My Todos</h3>
            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-500 border border-gray-700">{todoTasks.length}</span>
        </div>

        {todoTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-600 italic">
                No extra todos added for today.
            </div>
        ) : (
            <TaskList
                tasks={todoTasks}
                categories={props.categories}
                sortedCategoryIds={sortedCategoryIds}
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
      
      {/* SECTION 3: COMPOSER (Fixed at bottom or inline) */}
      <div className="sticky bottom-6 z-20">
        <AdvancedTaskForm categories={props.categories} onAddTask={props.onAddTask} />
      </div>
    </div>
  );
};

export default TasksPage;
