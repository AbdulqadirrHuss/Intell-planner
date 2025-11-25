import React from 'react';
import { Task, Category, DailyLog } from './types';
import Header from './Header';
import DateNavigator from './DateNavigator';
import TaskList from './TaskList';
import AdvancedTaskForm from './AdvancedTaskForm';

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
  // Task handlers
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

  return (
    <div className="animate-in fade-in flex flex-col min-h-[85vh]">
      <Header completionPercentage={props.completionPercentage} selectedDate={props.selectedDate} />
      
      {/* Date Bar */}
      <div className="bg-gray-800 rounded-xl p-2 mb-6 shadow-lg border border-gray-700 flex flex-col md:flex-row items-center gap-4">
           <div className="flex-grow w-full">
              <DateNavigator selectedDate={props.selectedDate} onDateChange={props.setSelectedDate} />
           </div>
      </div>

      {/* Focus & Controls */}
      <div className="flex justify-between items-end mb-4 px-2">
          <div className="flex flex-col">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Day Focus</span>
               <select 
                  value={props.dailyLog.dayTypeId || ''} 
                  onChange={(e) => props.onSelectDayType(e.target.value)} 
                  className="bg-transparent text-indigo-300 text-sm font-bold border-none focus:ring-0 p-0 cursor-pointer hover:text-indigo-200"
              >
                <option value="" disabled>Select Type...</option>
                {props.dayTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
              </select>
          </div>
          <div className="flex gap-3">
              <button onClick={props.onOpenDayTypeManager} className="text-xs text-gray-500 hover:text-white transition-colors">Manage Days</button>
              <button onClick={props.onOpenCategoryManager} className="text-xs text-gray-500 hover:text-white transition-colors">Manage Cats</button>
              <button onClick={props.onOpenTrackerManager} className="text-xs text-gray-500 hover:text-white transition-colors">Metrics</button>
          </div>
      </div>

      {/* The Task List */}
      <div className="flex-grow">
          <TaskList
              tasks={props.dailyLog.tasks}
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
      </div>
      
      {/* The New Fancy Form */}
      <AdvancedTaskForm categories={props.categories} onAddTask={props.onAddTask} />
    </div>
  );
};

export default TasksPage;
