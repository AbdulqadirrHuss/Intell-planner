import React, { useState } from 'react';
import { Task } from './types';
import { TrashIcon, EditIcon, CheckIcon, RecurringIcon } from './icons';

interface SimpleTaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
}

const SimpleTaskItem: React.FC<SimpleTaskItemProps> = ({ task, onToggle, onDelete, onUpdateText }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(task.text);

  const handleUpdate = () => {
    if (text.trim() && text !== task.text) {
      onUpdateText(task.id, text.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center p-3 bg-gray-800/50 border border-gray-700 rounded-lg group hover:border-indigo-500/30 transition-all mb-2">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="w-5 h-5 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-600 cursor-pointer"
      />
      
      <div className="ml-3 flex-grow">
        {isEditing ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
            className="w-full bg-gray-900 text-white rounded p-1 border border-indigo-500 outline-none text-sm"
            autoFocus
          />
        ) : (
          <span className={`block text-sm transition-all ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
            {task.text}
          </span>
        )}
      </div>

      {task.isRecurring && (
          <RecurringIcon className="w-4 h-4 text-indigo-400 mr-3" />
      )}

      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <button onClick={handleUpdate} className="p-1 text-green-400 hover:text-green-300"><CheckIcon className="w-4 h-4"/></button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="p-1 text-gray-500 hover:text-white"><EditIcon className="w-4 h-4"/></button>
        )}
        <button onClick={() => onDelete(task.id)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
      </div>
    </div>
  );
};

export default SimpleTaskItem;
