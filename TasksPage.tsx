import React, { useState } from 'react';
import { Task, Category, DailyLog, StatDefinition, StatValue } from './types';
import Header from './Header';
import DateNavigator from './DateNavigator';
import TaskList from './TaskList';
import { RecurringIcon, PlusIcon } from './icons';

interface TasksPageProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  completionPercentage: number;
  dailyLog: DailyLog;
  dayTypes: any[];
  categories: Category[];
  statDefinitions: StatDefinition[];
  statValues: StatValue[];
  onSelectDayType: (id: string) => void;
  onOpenDayTypeManager: () => void;
  onOpenCategoryManager: () => void;
  onOpenTrackerManager: () => void;
  onReorderCategories: (newOrder: string[]) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskText: (id: string, text: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onUpdateSubtaskText: (taskId: string, subtaskId: string, newText: string) => void;
  onToggleSubtaskRecurring: (taskId: string, subtaskId: string) => void;
  onAddTask: (text: string, catId: string, isRecurring: boolean) => void;
  onUpdateStatValue: (date: string, definitionId: string, value: number | boolean | null) => void;
}

const TasksPage: React.FC<TasksPageProps> = (props) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');

  // Derive sorted categories from the current day type
  const currentDayType = props.dayTypes.find(dt => dt.id === props.dailyLog?.dayTypeId);
  const sortedCategoryIds = currentDayType?.categoryIds || [];

  // Filter trackers relevant to the current day (linked to visible categories)
  // If no day type selected, maybe show all? Or none? Let's show all for now or those linked to categories present.
  const visibleCategoryIds = props.categories.map(c => c.id); // For now, let's just show all active trackers or filter by category if needed.
  // Actually, let's show trackers that are either global (no link) or linked to a category that is part of the current day type.
  const relevantTrackers = props.statDefinitions.filter(stat => {
    if (!stat.linked_category_id) return true; // Global tracker
    if (currentDayType) {
      return currentDayType.categoryIds.includes(stat.linked_category_id);
    }
    return true; // If no day type, show all
  });

  return (
    <div className="animate-in fade-in flex flex-col min-h-[85vh] pb-24">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Header completionPercentage={props.completionPercentage} selectedDate={props.selectedDate} />
        <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700 shadow-sm">
          <div className="flex flex-col px-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Mode</span>
            <select
              value={props.dailyLog?.dayTypeId || ''}
              onChange={(e) => props.onSelectDayType(e.target.value)}
              className="bg-transparent text-indigo-300 text-sm font-bold border-none focus:ring-0 p-0 cursor-pointer hover:text-indigo-200 w-32"
            >
              <option value="" disabled>Select Type...</option>
              {(props.dayTypes || []).map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
            </select>
          </div>
          <div className="h-8 w-px bg-gray-700"></div>
          <button onClick={props.onOpenDayTypeManager} className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700 transition-colors" title="Edit Day Types">
            <RecurringIcon className="w-5 h-5" />
          </button>
          <button onClick={props.onOpenTrackerManager} className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700 transition-colors" title="Manage Trackers">
            {/* Using PlusIcon as placeholder for Tracker Icon if needed, or just text */}
            <span className="font-bold text-lg">#</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-2 mb-8 shadow-lg border border-gray-700">
        <DateNavigator selectedDate={props.selectedDate} onDateChange={props.setSelectedDate} />
      </div>

      {/* Trackers Section */}
      {relevantTrackers.length > 0 && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {relevantTrackers.map(stat => {
            const currentVal = props.statValues.find(v => v.date === props.selectedDate && v.stat_definition_id === stat.id);
            const val = currentVal ? currentVal.value : null;

            return (
              <div key={stat.id} className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-gray-400 uppercase font-bold mb-2">{stat.name}</span>
                <div className="flex items-center gap-2">
                  {stat.type === 'check' ? (
                    <input
                      type="checkbox"
                      checked={!!val}
                      onChange={(e) => props.onUpdateStatValue(props.selectedDate, stat.id, e.target.checked)}
                      className="w-6 h-6 text-indigo-500 rounded focus:ring-indigo-600 bg-gray-700 border-gray-600"
                    />
                  ) : (
                    <input
                      type="number"
                      value={val === null ? '' : val}
                      onChange={(e) => props.onUpdateStatValue(props.selectedDate, stat.id, e.target.value === '' ? null : Number(e.target.value))}
                      placeholder="0"
                      className="bg-transparent text-xl font-bold text-white w-full outline-none border-b border-gray-700 focus:border-indigo-500 transition-colors"
                    />
                  )}
                  {stat.type === 'percent' && <span className="text-gray-500">%</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Task List */}
      <div className="mb-24">
        <TaskList
          tasks={props.dailyLog?.tasks || []}
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

      {/* Add Task Input (Sticky Bottom) */}
      <div className="fixed bottom-6 left-0 right-0 px-4 md:px-8 max-w-7xl mx-auto z-30">
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 p-2 rounded-2xl shadow-2xl flex gap-2 items-center">
          <select
            className="bg-gray-800 text-xs text-gray-300 border-none rounded-lg outline-none cursor-pointer hover:text-white h-10 px-2 max-w-[120px] truncate"
            onChange={(e) => setNewTaskCategory(e.target.value)}
            value={newTaskCategory}
          >
            <option value="">No Category</option>
            {props.categories.filter(c => c.id !== 'uncategorized').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            type="text"
            placeholder="Add a new task..."
            className="flex-grow bg-transparent text-white placeholder-gray-500 outline-none px-2"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                props.onAddTask(newTaskText, newTaskCategory || 'uncategorized', false);
                setNewTaskText('');
              }
            }}
          />
          <button
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            onClick={() => {
              props.onAddTask(newTaskText, newTaskCategory || 'uncategorized', false);
              setNewTaskText('');
            }}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
