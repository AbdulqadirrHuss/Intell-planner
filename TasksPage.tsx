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
  // Strict Filtering: Only show Uncategorized tasks (The "Blank Slate")
  const blankSlateTasks = props.dailyLog.tasks.filter(
    t => !t.categoryId || t.categoryId === 'uncategorized'
  );

  const routineTasks = blankSlateTasks.filter(t => t.isRecurring);
  const adHocTasks = blankSlateTasks.filter(t => !t.isRecurring);
  const dummySortedIds: string[] = [];

  return (
    <div className="animate-in fade-in flex flex-col min-h-[85vh] pb-24">
      
      {/* TOP BAR: Header + Day Type Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <Header completionPercentage={props.completionPercentage} selectedDate={props.selectedDate} />
          
          <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700 shadow-sm">
              <div className="flex flex-col px-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Mode</span>
                  <select 
                      value={props.dailyLog.dayTypeId || ''} 
                      onChange={(e) => props.onSelectDayType(e.target.value)} 
                      className="bg-transparent text-indigo-300 text-sm font-bold border-none focus:ring-0 p-0 cursor-pointer hover:text-indigo-200 w-32"
                  >
                    <option value="" disabled>Select Type...</option>
                    {props.dayTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
                  </select>
              </div>
              <div className="h-8 w-px bg-gray-700"></div>
              <button 
                onClick={props.onOpenDayTypeManager} 
                className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
                title="Manage Routines"
              >
                <RecurringIcon className="w-5 h-5" />
              </button>
          </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-2 mb-8 shadow-lg border border-gray-700">
          <DateNavigator selectedDate={props.selectedDate} onDateChange={props.setSelectedDate} />
      </div>

      <div className="mb-6">
         <h2 className="text-2xl font-bold text-white mb-1">Execution Dashboard</h2>
         <p className="text-gray-400 text-sm">Prioritize and Execute. Use "Manage Routines" to configure Day Types.</p>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* ROUTINES CARD */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 flex flex-col min-h-[300px]">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-700/50 pb-4">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                <h3 className="text-xl font-bold text-gray-100">Routine & Boilerplate</h3>
            </div>
            
            {routineTasks.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-700/50 rounded-xl opacity-50">
                    <p className="text-gray-400 font-medium">No active routine.</p>
                    <p className="text-xs text-gray-500 mt-1">Select a Day Type above to load routines.</p>
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

        {/* AD-HOC CARD */}
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
      
      <div className="sticky bottom-6 z-20">
        <AdvancedTaskForm categories={props.categories} onAddTask={props.onAddTask} />
      </div>
    </div>
  );
};

export default TasksPage;
