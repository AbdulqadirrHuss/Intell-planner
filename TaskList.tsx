// abdulqadirrhuss/intell-planner/Intell-planner-e4eec65ae3452797ce24afb321a4c1a7a0f5cce3/TaskList.tsx

import React, { useState, useMemo } from 'react';
import { Task, Category, Subtask } from '../types';
import { TrashIcon, PlusIcon, EditIcon, CheckIcon } from './icons';

// --- SubtaskItem Component ---
interface SubtaskItemProps {
  task: Task;
  subtask: Subtask;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onUpdateSubtaskText: (taskId: string, subtaskId: string, newText: string) => void;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({ task, subtask, onToggleSubtask, onDeleteSubtask, onUpdateSubtaskText }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(subtask.text);

  const handleUpdate = () => {
    if (text.trim() && text !== subtask.text) {
      onUpdateSubtaskText(task.id, subtask.id, text.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center pl-8 pr-3 py-2 bg-gray-900 rounded-md">
      <input
        type="checkbox"
        checked={subtask.completed}
        onChange={() => onToggleSubtask(task.id, subtask.id)}
        className="w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-600 ring-offset-gray-900 focus:ring-2"
      />
      
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
          className="ml-3 flex-1 text-sm bg-gray-700 text-white rounded p-0.5"
          autoFocus
        />
      ) : (
        <span className={`ml-3 flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
          {subtask.text}
        </span>
      )}

      {isEditing ? (
        <button onClick={handleUpdate} className="ml-2 text-green-400 hover:text-green-300"><CheckIcon className="w-4 h-4"/></button>
      ) : (
        <button onClick={() => setIsEditing(true)} className="ml-2 text-gray-500 hover:text-white"><EditIcon className="w-4 h-4"/></button>
      )}
      <button onClick={() => onDeleteSubtask(subtask.id)} className="text-gray-600 hover:text-red-500 transition-colors">
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
};


// --- TaskItem Component ---
interface TaskItemProps {
  task: Task;
  categoryColor: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onUpdateTaskText: (taskId: string, newText: string) => void;
  onUpdateSubtaskText: (taskId: string, subtaskId: string, newText: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, categoryColor, onToggleTask, onDeleteTask, 
  onToggleSubtask, onDeleteSubtask, onAddSubtask,
  onUpdateTaskText, onUpdateSubtaskText
}) => {
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(task.text);

  const hasSubtasks = task.subtasks.length > 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskText.trim()) {
      onAddSubtask(task.id, newSubtaskText);
      setNewSubtaskText('');
    }
  };

  const handleUpdate = () => {
    if (text.trim() && text !== task.text) {
      onUpdateTaskText(task.id, text.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`p-3 bg-gray-800 rounded-lg mb-2 border-l-4`} style={{ borderColor: categoryColor }}>
      {/* Parent Task Row */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          disabled={hasSubtasks}
          onChange={() => onToggleTask(task.id)}
          className={`w-5 h-5 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-600 ring-offset-gray-800 focus:ring-2 ${hasSubtasks ? 'opacity-70 cursor-not-allowed' : ''}`}
        />
        
        {isEditing ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
            className="ml-4 flex-1 bg-gray-700 text-white rounded p-0.5"
            autoFocus
          />
        ) : (
          <span className={`ml-4 flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
            {task.text}
          </span>
        )}
        
        {task.isRecurring && <span className="text-xs bg-gray-700 text-indigo-300 px-2 py-1 rounded-full mr-3">Recurring</span>}
        
        {isEditing ? (
          <button onClick={handleUpdate} className="ml-2 text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5"/></button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="ml-2 text-gray-500 hover:text-white"><EditIcon className="w-5 h-5"/></button>
        )}
        <button onClick={() => onDeleteTask(task.id)} className="text-gray-500 hover:text-red-500 transition-colors">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Subtask List */}
      <div className="mt-2 space-y-1">
        {task.subtasks.map(subtask => (
          <SubtaskItem 
            key={subtask.id}
            task={task}
            subtask={subtask}
            onToggleSubtask={onToggleSubtask}
            onDeleteSubtask={onDeleteSubtask}
            onUpdateSubtaskText={onUpdateSubtaskText}
          />
        ))}
      </div>

      {/* Add Subtask Form */}
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

// --- TaskList Component ---
interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onUpdateTaskText: (taskId: string, newText: string) => void;
  onUpdateSubtaskText: (taskId: string, subtaskId: string, newText: string) => void;
}

const calculateProgress = (tasks: Task[]): number => {
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
};

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, categories, onToggleTask, onDeleteTask,
  onToggleSubtask, onDeleteSubtask, onAddSubtask,
  onUpdateTaskText, onUpdateSubtaskText
}) => {
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

        const categoryProgress = calculateProgress(tasksInCategory);
        const isCollapsed = collapsedCategories[categoryId];

        return (
          <div key={categoryId}>
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
            
            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${categoryProgress}%`, backgroundColor: category.color }}
              ></div>
            </div>

            {!isCollapsed && tasksInCategory.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                categoryColor={category.color}
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onAddSubtask={onAddSubtask}
                onUpdateTaskText={onUpdateTaskText}
                onUpdateSubtaskText={onUpdateSubtaskText}
              />
            ))}
          </div>
        );
      })}
       {uncategorizedTasks.length > 0 && (
         <div>
            <h2 className="text-xl font-bold text-gray-400 mb-3">Uncategorized</h2>
            {uncategorizedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                categoryColor="#6b7280"
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onAddSubtask={onAddSubtask}
                onUpdateTaskText={onUpdateTaskText}
                onUpdateSubtaskText={onUpdateSubtaskText}
              />
            ))}
          </div>
      )}
    </div>
  );
};

export default TaskList;
