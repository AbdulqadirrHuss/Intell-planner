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
  // SYSTEM FIX: Strict Filtering
  // We only allow tasks here that have NO category (or explicitly 'uncategorized')
  // This prevents Planner items from leaking into this view.
  const blankSlateTasks = props.dailyLog.tasks.filter(
    t => !t.categoryId || t.categoryId === 'uncategorized'
  );

  // Tripartite Division
  const routineTasks = blankSlateTasks.filter(t => t.isRecurring);
  const adHocTasks = blankSlateTasks.filter(t => !t.isRecurring);

  // Dummy sorter (not needed for blank slate)
  const dummySortedIds: string[] = [];

  return (
    <div className="animate-in fade-in flex flex-col min-h-[85vh] pb-24">
      <div className="flex justify-between items-start mb-6">
          <Header completionPercentage={props.completionPercentage} selectedDate={props.selectedDate} />
          <button 
            onClick={props.onOpenDayTypeManager} 
            className="mt-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RecurringIcon className="w-4 h-4" />
            Manage Routines
          </button>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-2 mb-8 shadow-lg border border-gray-700">
          <DateNavigator selectedDate={props.selectedDate} onDateChange={props.setSelectedDate} />
      </div>

      <div className="mb-6">
         <h2 className="text-2xl font-bold text-white mb-1">Execution Dashboard</h2>
         <p className="text-gray-400 text-sm">Prioritize and Execute. Use the Planner to automate routine tasks.</p>
      </div>

      {/* TRIPARTITE DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* LEFT CARD: ROUTINE & BOILERPLATE */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 flex flex-col min-h-[300px]">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-700/50 pb-4">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                <h3 className="text-xl font-bold text-gray-100">Routine & Boilerplate</h3>
            </div>
            
            {routineTasks.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-700/50 rounded-xl opacity-50">
                    <p className="text-gray-400 font-medium">No active routine tasks.</p>
                    <p className="text-xs text-gray-500 mt-1">Select a Day Type or use "Manage Routines" to scaffold.</p>
                </div>
            ) : (
                <div className="flex-grow">
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
                </div>
            )}
        </div>

        {/* RIGHT CARD: AD-HOC & SPECIFICS */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 flex flex-col min-h-[300px]">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-700/50 pb-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <h3 className="text-xl font-bold text-gray-100">Ad-hoc & Specifics</h3>
            </div>

            {adHocTasks.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-700/50 rounded-xl opacity-50">
                    <p className="text-gray-400 font-medium">No specific tasks added.</p>
                    <p className="text-xs text-gray-500 mt-1">Use the composer below to add one-offs.</p>
                </div>
            ) : (
                <div className="flex-grow">
                    <TaskList
                        tasks={adHocTasks}
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
                </div>
            )}
        </div>
      </div>
      
      {/* BOTTOM: COMPOSER */}
      <div className="sticky bottom-6 z-20">
        <AdvancedTaskForm categories={props.categories} onAddTask={props.onAddTask} />
      </div>
    </div>
  );
};

export default TasksPage;
