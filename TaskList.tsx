import React from 'react';
import { Task, Category } from '../types';
import { TrashIcon } from './icons';

interface TaskItemProps {
  task: Task;
  categoryColor: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, categoryColor, onToggle, onDelete }) => (
  <div className={`flex items-center p-3 bg-gray-800 rounded-lg mb-2 border-l-4`} style={{ borderColor: categoryColor }}>
    <input
      type="checkbox"
      checked={task.completed}
      onChange={() => onToggle(task.id)}
      className="w-5 h-5 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-600 ring-offset-gray-800 focus:ring-2"
    />
    <span className={`ml-4 flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
      {task.text}
    </span>
    {task.isRecurring && <span className="text-xs bg-gray-700 text-indigo-300 px-2 py-1 rounded-full mr-3">Recurring</span>}
    <button onClick={() => onDelete(task.id)} className="text-gray-500 hover:text-red-500 transition-colors">
      <TrashIcon className="w-5 h-5" />
    </button>
  </div>
);

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, categories, onToggleTask, onDeleteTask }) => {
  // FIX: Using a more explicit reduce with a generic type to ensure correct type inference for groupedTasks.
  // This resolves issues where properties on `category` and `tasksInCategory` were not found because their types were inferred as `unknown`.
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

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([categoryId, tasksInCategory]) => {
        const category = categoryMap.get(categoryId);
        if (!category) return null;
        return (
          <div key={categoryId}>
            <h2 className="text-xl font-bold mb-3 flex items-center" style={{ color: category.color }}>
              {category.name}
            </h2>
            {tasksInCategory.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                categoryColor={category.color}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
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
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
      )}
    </div>
  );
};

export default TaskList;