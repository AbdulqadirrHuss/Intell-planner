// abdulqadirrhuss/intell-planner/Intell-planner-e4eec65ae3452797ce24afb321a4c1a7a0f5cce3/TaskList.tsx

import React, { useState, useMemo } from 'react';
import { Task, Category, Subtask } from '../types';
import { TrashIcon, PlusIcon } from './icons';

// --- NEW: SubtaskItem Component ---
interface SubtaskItemProps {
  task: Task;
  subtask: Subtask;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({ task, subtask, onToggleSubtask, onDeleteSubtask }) => (
  <div className="flex items-center pl-8 pr-3 py-2 bg-gray-900 rounded-md">
    <input
      type="checkbox"
      checked={subtask.completed}
      onChange={() => onToggleSubtask(task.id, subtask.id)}
      className="w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-600 ring-offset-gray-900 focus:ring-2"
    />
    <span className={`ml-3 flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
      {subtask.text}
    </span>
    <button onClick={() => onDeleteSubtask(subtask.id)} className="text-gray-600 hover:text-red-500 transition-colors">
      <TrashIcon className="w-4 h-4" />
    </button>
  </div>
);

// --- MODIFIED: TaskItem Component ---
interface TaskItemProps {
  task: Task;
  categoryColor: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  // NEW: Props for subtasks
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, categoryColor, onToggleTask, onDeleteTask, 
  onToggleSubtask, onDeleteSubtask, onAddSubtask 
}) => {
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const hasSubtasks = task.subtasks.length > 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskText.trim()) {
      onAddSubtask(task.id, newSubtaskText);
      setNewSubtaskText('');
    }
  };

  return (
    <div className={`p-3 bg-gray-800 rounded-lg mb-2 border-l-4`} style={{ borderColor: categoryColor }}>
      {/* Parent Task Row */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          // MODIFIED: If it has subtasks, the parent checkbox is for visual only and disabled.
          // If it has NO subtasks, it's clickable.
          disabled={hasSubtasks}
          onChange={() => onToggleTask(task.id)}
          className={`w-5 h-5 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-600 ring-offset-gray-800 focus:ring-2 ${hasSubtasks ? 'opacity-70 cursor-not-allowed' : ''}`}
        />
        <span className={`ml-4 flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
          {task.text}
        </span>
        {task.isRecurring && <span className="text-xs bg-gray-700 text-indigo-300 px-2 py-1 rounded-full mr-3">Recurring</span>}
        <button onClick={() => onDeleteTask(task.id)} className="text-gray-500 hover:text-red-500 transition-colors">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* NEW: Subtask List */}
      <div className="mt-2 space-y-1">
        {task.subtasks.map(subtask => (
          <SubtaskItem 
            key={subtask.id}
            task={task}
            subtask={subtask}
            onToggleSubtask={onToggleSubtask}
            onDeleteSubtask={onDeleteSubtask}
          />
        ))}
      </div>

      {/* NEW: Add Subtask Form */}
      <form onSubmit={handleAddSubtask} className="flex gap-2 items-center mt-2 pl-8">
        <input
          type="text"
          value={newSubtaskText}
          onChange={(e) => setNewSubtaskText(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-grow bg-gray-700 border-gray-600 text-white placeholder-gray-500 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full p-1.5"
        />
        <button type="submit" className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
          <PlusIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

// --- MODIFIED: TaskList Component ---
interface TaskListProps {
  tasks: Task[]; // These are parent tasks
  categories: Category[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  // NEW: Subtask handlers
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
}

// NEW: Hierarchical progress calculation logic
const calculateProgress = (tasks: Task[]): number => {
  const totalParentTasks = tasks.length;
  if (totalParentTasks === 0) return 0;

  const progressPerParent = 100 / totalParentTasks;

  const totalProgress = tasks.reduce((acc, task) => {
    if (task.subtasks.length === 0) {
      // No subtasks: parent task completion counts
      return acc + (task.completed ? progressPerParent : 0);
    } else {
      // Has subtasks: progress is based on subtasks
      const progressPerSubtask = progressPerParent / task.subtasks.length;
      const completedSubtasks = task.subtasks.filter(st => st.completed).length;
      return acc + (completedSubtasks * progressPerSubtask);
    }
  }, 0);

  return Math.round(totalProgress);
};

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, categories, onToggleTask, onDeleteTask,
  onToggleSubtask, onDeleteSubtask, onAddSubtask 
}) => {
  // NEW: State for collapsible categories
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const groupedTasks = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const categoryId = task.categoryId;
    (acc[categoryId] = acc[categoryId] || []).push(task);
    return acc;
  }, {});

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

  const uncategorizedTasks = groupedTasks['uncategorized'] || [];
  delete groupedTasks['uncategorized'];

  if (tasks.length === 0) {
    return (
        <div className="text-center py-12 px-6 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-300">No tasks for this day!</h3>
            <p className="text-gray-500 mt-2">Select a Day Type or add a new task to get started.</p>
        </div>
    );
  }

  // NEW: Toggle function for category visibility
  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([categoryId, tasksInCategory]) => {
        const category = categoryMap.get(categoryId);
        if (!category) return null;

        // NEW: Calculate progress for this specific category
        const categoryProgress = calculateProgress(tasksInCategory);
        const isCollapsed = collapsedCategories[categoryId];

        return (
          <div key={categoryId}>
            {/* MODIFIED: Category Header is now a button */}
            <button
              onClick={() => toggleCategory(categoryId)}
              className="w-full flex justify-between items-center mb-3 cursor-pointer group"
            >
              <div className="flex items-center">
                <h2 className="text-xl font-bold" style={{ color: category.color }}>
                  {category.name}
                </h2>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
                  className={`w-5 h-5 ml-2 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                  style={{ color: category.color }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              <span className="text-sm font-medium" style={{ color: category.color }}>{categoryProgress}%</span>
            </button>
            
            {/* NEW: Category Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${categoryProgress}%`, backgroundColor: category.color }}
              ></div>
            </div>

            {/* NEW: Collapsible Task List */}
            {!isCollapsed && tasksInCategory.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                categoryColor={category.color}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                // NEW: Pass subtask handlers
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onAddSubtask={onAddSubtask}
              />
            ))}
          </div>
        );
      })}
      {/* ... Uncategorized tasks (can be updated with the same logic) ... */}
    </div>
  );
};

export default TaskList;
