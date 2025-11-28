import React, { useState, useEffect } from 'react';
import { Category, RecurringTaskTemplate, RecurringSubtaskTemplate } from './types';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon } from './icons';

// Component for editing recurring subtask template text
const RecurringSubtaskItem: React.FC<{
  subtask: RecurringSubtaskTemplate;
  onDelete: (id: string) => void;
  onUpdateText: (id: string, newText: string) => void;
}> = ({ subtask, onDelete, onUpdateText }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(subtask.text);

  const handleUpdate = () => {
    if (text.trim() && text !== subtask.text) {
      onUpdateText(subtask.id, text.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex justify-between items-center bg-gray-500 p-1.5 rounded">
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
          className="flex-grow bg-gray-400 text-black rounded p-0.5 text-xs"
          autoFocus
        />
      ) : (
        <span className="text-xs text-gray-300">{subtask.text}</span>
      )}
      <div className="flex gap-1">
        {isEditing ? (
          <button onClick={handleUpdate}><CheckIcon className="w-3 h-3 text-green-300" /></button>
        ) : (
          <button onClick={() => setIsEditing(true)}><EditIcon className="w-3 h-3 text-gray-300" /></button>
        )}
        <button onClick={() => onDelete(subtask.id)} className="text-gray-300 hover:text-red-500"><TrashIcon className="w-3 h-3" /></button>
      </div>
    </div>
  );
};

// Component for editing recurring task template
const RecurringTaskItem: React.FC<{
  task: RecurringTaskTemplate;
  onDelete: (id: string) => void;
  onUpdateDays: (task: RecurringTaskTemplate) => void;
  onUpdateText: (id: string, newText: string) => void;
  onAddSubtask: (parentTemplateId: string, text: string) => void;
  onDeleteSubtask: (id: string) => void;
  onUpdateSubtaskText: (id: string, newText: string) => void;
}> = ({ task, onDelete, onUpdateDays, onUpdateText, onAddSubtask, onDeleteSubtask, onUpdateSubtaskText }) => {

  const [editingDays, setEditingDays] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState(task.daysOfWeek || []);

  useEffect(() => {
    setDaysOfWeek(task.daysOfWeek || []);
  }, [task.daysOfWeek]);

  const [editingText, setEditingText] = useState(false);
  const [text, setText] = useState(task.text);

  useEffect(() => {
    setText(task.text);
  }, [task.text]);

  const [newSubtask, setNewSubtask] = useState('');

  const DAYS_OF_WEEK = [
    { label: 'S', value: 0 }, { label: 'M', value: 1 }, { label: 'T', value: 2 },
    { label: 'W', value: 3 }, { label: 'T', value: 4 }, { label: 'F', value: 5 },
    { label: 'S', value: 6 }
  ];

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSaveDays = () => {
    onUpdateDays({ ...task, daysOfWeek });
    setEditingDays(false);
  };

  const handleSaveText = () => {
    if (text.trim() && text !== task.text) {
      onUpdateText(task.id, text.trim());
    }
    setEditingText(false);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      onAddSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  return (
    <div className="bg-gray-600 p-3 rounded">
      <div className="flex justify-between items-center">
        {editingText ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSaveText}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveText()}
            className="flex-grow bg-gray-500 text-white rounded p-0.5"
            autoFocus
          />
        ) : (
          <span className="text-sm text-gray-200">{task.text}</span>
        )}
        <div className="flex gap-2">
          {editingText ? (
            <button onClick={handleSaveText}><CheckIcon className="w-4 h-4 text-green-300" /></button>
          ) : (
            <button onClick={() => setEditingText(true)}><EditIcon className="w-4 h-4 text-gray-300" /></button>
          )}
          <button onClick={() => setEditingDays(true)} className="text-gray-300 hover:text-white"><EditIcon className="w-4 h-4" /></button>
          <button onClick={() => onDelete(task.id)} className="text-gray-300 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
        </div>
      </div>

      {editingDays ? (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex gap-1">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`w-6 h-6 rounded-full text-xs font-bold ${daysOfWeek.includes(day.value) ? 'bg-indigo-500 text-white' : 'bg-gray-500 text-gray-200'}`}
              >
                {day.label}
              </button>
            ))}
          </div>
          <button onClick={handleSaveDays} className="p-1 bg-green-500 rounded-md"><CheckIcon className="w-4 h-4" /></button>
        </div>
      ) : (
        <div className="mt-1 text-xs text-indigo-300">
          {(task.daysOfWeek || []).length > 0 ? task.daysOfWeek.sort().map(d => DAYS_OF_WEEK[d].label).join(', ') : 'No days set'}
        </div>
      )}

      <div className="pl-4 mt-2 space-y-1">
        {task.subtaskTemplates.map(st => (
          <RecurringSubtaskItem
            key={st.id}
            subtask={st}
            onDelete={onDeleteSubtask}
            onUpdateText={onUpdateSubtaskText}
          />
        ))}
      </div>

      <form onSubmit={handleAddSubtask} className="flex gap-2 text-sm pl-4 mt-2">
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add subtask template..."
          className="flex-grow bg-gray-500 border-gray-400 rounded-md p-1 text-xs text-white"
        />
        <button type="submit" className="p-1 bg-indigo-500 hover:bg-indigo-600 rounded-md"><PlusIcon className="w-3 h-3" /></button>
      </form>
    </div>
  );
};

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddRecurringTask: (categoryId: string, text: string) => void;
  onDeleteRecurringTask: (taskId: string) => void;
  onUpdateRecurringTask: (task: RecurringTaskTemplate) => void;
  onAddRecurringSubtask: (parentTemplateId: string, text: string) => void;
  onDeleteRecurringSubtask: (subtaskTemplateId: string) => void;
  onUpdateRecurringTaskText: (taskId: string, newText: string) => void;
  onUpdateRecurringSubtaskText: (subtaskTemplateId: string, newText: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen, onClose, categories, onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddRecurringTask, onDeleteRecurringTask, onUpdateRecurringTask,
  onAddRecurringSubtask, onDeleteRecurringSubtask,
  onUpdateRecurringTaskText, onUpdateRecurringSubtaskText
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4f46e5');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newRecurringTask, setNewRecurringTask] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName('');
      setNewCategoryColor('#4f46e5');
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      onUpdateCategory(editingCategory.id, editingCategory.name, editingCategory.color);
      setEditingCategory(null);
    }
  }

  const handleAddRecurringTask = (e: React.FormEvent, categoryId: string) => {
    e.preventDefault();
    const text = newRecurringTask[categoryId];
    if (text && text.trim()) {
      onAddRecurringTask(categoryId, text);
      setNewRecurringTask(prev => ({ ...prev, [categoryId]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Manage Categories & Recurring Tasks</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <form onSubmit={handleAddCategory} className="flex gap-2 items-center">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
              className="flex-grow bg-gray-700 border-gray-600 rounded-md p-2 text-white"
            />
            <input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="bg-gray-700 rounded-md h-10 w-10 p-1 border-gray-600"
            />
            <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-md"><PlusIcon className="w-5 h-5" /></button>
          </form>

          <div className="space-y-4">
            {categories.filter(c => c.id !== 'uncategorized').map(cat => (
              <div key={cat.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  {editingCategory?.id === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="flex-grow bg-gray-600 p-1 rounded-md text-white" autoFocus
                      />
                      <input
                        type="color"
                        value={editingCategory.color}
                        onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                        className="bg-gray-600 rounded-md h-8 w-8 p-1 ml-2"
                      />
                      <button onClick={handleUpdateCategory} className="ml-2 text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5" /></button>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: cat.color }}></span>
                      <span className="font-bold text-lg" style={{ color: cat.color }}>{cat.name}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCategory(cat)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={() => onDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="pl-4 space-y-3 mb-4">
                  {cat.recurringTasks.map(task => (
                    <RecurringTaskItem
                      key={task.id}
                      task={task}
                      onDelete={onDeleteRecurringTask}
                      onUpdateDays={onUpdateRecurringTask}
                      onUpdateText={onUpdateRecurringTaskText}
                      onAddSubtask={onAddRecurringSubtask}
                      onDeleteSubtask={onDeleteRecurringSubtask}
                      onUpdateSubtaskText={onUpdateRecurringSubtaskText}
                    />
                  ))}
                  {cat.recurringTasks.length === 0 && <p className="text-sm text-gray-500">No recurring tasks for this category.</p>}
                </div>

                <form onSubmit={(e) => handleAddRecurringTask(e, cat.id)} className="flex gap-2 text-sm pl-4">
                  <input
                    type="text"
                    value={newRecurringTask[cat.id] || ''}
                    onChange={(e) => setNewRecurringTask(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    placeholder="Add new recurring task..."
                    className="flex-grow bg-gray-600 border-gray-500 rounded-md p-2 text-white"
                  />
                  <button type="submit" className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-md"><PlusIcon className="w-4 h-4" /></button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
