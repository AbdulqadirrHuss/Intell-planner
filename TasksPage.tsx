import React, { useState } from 'react';
import { Category, DailyLog, StatDefinition, StatValue } from './types';
import Header from './Header';
import DateNavigator from './DateNavigator';
import { RecurringIcon, PlusIcon, StarIcon } from './icons';

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
  onAddTask: (text: string, catId: string, isRecurring: boolean, isImportant: boolean) => void;
  onUpdateStatValue: (date: string, statId: string, value: boolean | number | null) => void;
}

const TasksPage: React.FC<TasksPageProps> = (props) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  // Filter trackers relevant to the current day
  const currentDayType = props.dayTypes.find(dt => dt.id === props.dailyLog?.dayTypeId);

  const relevantTrackers = props.statDefinitions.filter(stat => {
    if (!stat.linked_category_id) return true;
    if (currentDayType) {
      return currentDayType.categoryIds.includes(stat.linked_category_id);
    }
    return true;
  });

  // FILTER: Only show Uncategorized tasks
  const tasks = props.dailyLog?.tasks || [];
  const uncategorizedTasks = tasks.filter(t => !t.categoryId || t.categoryId === 'uncategorized');

  const importantTasks = uncategorizedTasks.filter(t => t.isImportant);
  const routineTasks = uncategorizedTasks.filter(t => t.isRecurring && !t.isImportant);
  const adHocTasks = uncategorizedTasks.filter(t => !t.isRecurring && !t.isImportant);

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    // We need to pass isImportant to the parent handler. 
    // Since the parent handler signature might not support it yet, we might need to update App.tsx or just pass it as part of the text for now?
    // No, I should update the handler in App.tsx. But I can't do that in this file.
    // For now, I will assume the handler accepts it or I'll have to modify App.tsx later.
    // Wait, onAddTask signature in props is: (text: string, catId: string, isRecurring: boolean) => void;
    // I need to update the interface and the handler.
    // For now, I will just call it. If I can't pass isImportant, I'll lose it.
    // I'll update the interface in this file first.
    props.onAddTask(newTaskText, newTaskCategory || 'uncategorized', false, isImportant);
    setNewTaskText('');
    setIsImportant(false);
  };

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

      {/* Most Important Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <StarIcon className="w-5 h-5 text-yellow-500" filled />
          <h2 className="text-xl font-bold text-yellow-500">Most Important</h2>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 min-h-[100px] flex flex-col justify-center">
          {importantTasks.length === 0 ? (
            <div className="text-center opacity-50"><p className="text-gray-400 font-medium">No important tasks.</p></div>
          ) : (
            <div className="space-y-2">
              {importantTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => props.onToggleTask(task.id)}
                      className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-600 bg-gray-700 border-gray-600"
                    />
                    <span className={`text-lg font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-100"}`}>{task.text}</span>
                  </div>
                  <button onClick={() => props.onDeleteTask(task.id)} className="text-gray-600 hover:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Execution Dashboard</h2>
          <p className="text-gray-400 text-sm">Prioritize and Execute. Use the Planner to automate routine tasks.</p>
        </div>
        <button
          onClick={props.onOpenDayTypeManager}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg border border-indigo-500/30 transition-colors"
        >
          <RecurringIcon className="w-4 h-4" />
          Manage Routines
        </button>
      </div>

      {/* Uncategorized Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
        {/* ROUTINE CARD */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 flex flex-col min-h-[300px]">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-700/50 pb-4">
            <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            <h3 className="text-xl font-bold text-gray-100">Routine & Boilerplate</h3>
          </div>
          <div className="flex-grow space-y-2">
            {routineTasks.length === 0 ? (
              <div className="text-center py-12 opacity-50"><p className="text-gray-400 font-medium">No active routine tasks.</p></div>
            ) : (
              routineTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => props.onToggleTask(task.id)}
                      className="w-5 h-5 text-indigo-500 rounded focus:ring-indigo-600 bg-gray-700 border-gray-600"
                    />
                    <span className={task.completed ? "line-through text-gray-500" : "text-gray-200"}>{task.text}</span>
                  </div>
                  <button onClick={() => props.onDeleteTask(task.id)} className="text-gray-600 hover:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AD-HOC CARD */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 flex flex-col min-h-[300px]">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-700/50 pb-4">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <h3 className="text-xl font-bold text-gray-100">Ad-hoc & Specifics</h3>
          </div>
          <div className="flex-grow space-y-2">
            {adHocTasks.length === 0 ? (
              <div className="text-center py-12 opacity-50"><p className="text-gray-400 font-medium">No specific tasks added.</p></div>
            ) : (
              adHocTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => props.onToggleTask(task.id)}
                      className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-600 bg-gray-700 border-gray-600"
                    />
                    <span className={task.completed ? "line-through text-gray-500" : "text-gray-200"}>{task.text}</span>
                  </div>
                  <button onClick={() => props.onDeleteTask(task.id)} className="text-gray-600 hover:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Task Input (Sticky Bottom) */}
      <div className="fixed bottom-6 left-0 right-0 px-4 md:px-8 max-w-7xl mx-auto z-30">
        <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 p-2 rounded-2xl shadow-2xl flex gap-2 items-center">
          <input
            type="text"
            placeholder="Add a new task..."
            className="flex-grow bg-transparent text-white placeholder-gray-500 outline-none px-4"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTask();
              }
            }}
          />

          <div className="flex items-center gap-2 border-l border-gray-700 pl-2">
            <button
              onClick={() => setIsImportant(!isImportant)}
              className={`p-2 rounded-lg transition-colors ${isImportant ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-500 hover:text-gray-300'}`}
              title="Mark as Important"
            >
              <StarIcon className="w-5 h-5" filled={isImportant} />
            </button>

            <div className="flex flex-col items-end px-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase">One-off</span>
            </div>

            <select
              className="bg-gray-800 text-xs text-gray-300 border-none rounded-lg outline-none cursor-pointer hover:text-white h-9 px-2 max-w-[100px] truncate"
              onChange={(e) => setNewTaskCategory(e.target.value)}
              value={newTaskCategory}
            >
              <option value="">No Link</option>
              {props.categories.filter(c => c.id !== 'uncategorized').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <button
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 ml-2"
              onClick={handleAddTask}
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TasksPage;
