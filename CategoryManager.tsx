// abdulqadirrhuss/intell-planner/Intell-planner-e4eec65ae3452797ce24afb321a4c1a7a0f5cce3/CategoryManager.tsx

import React, { useState } from 'react';
import { Category, RecurringTaskTemplate, RecurringSubtaskTemplate } from '../types';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon } from './icons';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  // MODIFIED: Recurring task props
  onAddRecurringTask: (categoryId: string, text: string) => void;
  onDeleteRecurringTask: (taskId: string) => void;
  onUpdateRecurringTask: (task: RecurringTaskTemplate) => void; // NEW
  onAddRecurringSubtask: (parentTemplateId: string, text: string) => void; // NEW
  onDeleteRecurringSubtask: (subtaskTemplateId: string) => void; // NEW
}

const DAYS_OF_WEEK = [
  { label: 'S', value: 0 }, { label: 'M', value: 1 }, { label: 'T', value: 2 },
  { label: 'W', value: 3 }, { label: 'T', value: 4 }, { label: 'F', value: 5 },
  { label: 'S', value: 6 }
];

const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen, onClose, categories, onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddRecurringTask, onDeleteRecurringTask, onUpdateRecurringTask,
  onAddRecurringSubtask, onDeleteRecurringSubtask
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4f46e5');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newRecurringTask, setNewRecurringTask] = useState<{ [key: string]: string }>({});
  
  // NEW: State for editing a recurring task's days
  const [editingRecTaskId, setEditingRecTaskId] = useState<string | null>(null);
  const [editingRecTaskDays, setEditingRecTaskDays] = useState<number[]>([]);
  
  // NEW: State for adding a subtask template
  const [newRecSubtask, setNewRecSubtask] = useState<{ [key: string]: string }>({});

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

  // --- NEW: Handlers for recurring task day-of-week editing ---
  const startEditingDays = (task: RecurringTaskTemplate) => {
    setEditingRecTaskId(task.id);
    setEditingRecTaskDays(task.daysOfWeek || []);
  };

  const toggleDay = (day: number) => {
    setEditingRecTaskDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const saveEditingDays = (task: RecurringTaskTemplate) => {
    onUpdateRecurringTask({ ...task, daysOfWeek: editingRecTaskDays });
    setEditingRecTaskId(null);
  };

  // --- NEW: Handlers for recurring subtasks ---
  const handleAddRecSubtask = (e: React.FormEvent, parentTemplateId: string) => {
    e.preventDefault();
    const text = newRecSubtask[parentTemplateId];
    if (text && text.trim()) {
      onAddRecurringSubtask(parentTemplateId, text);
      setNewRecSubtask(prev => ({ ...prev, [parentTemplateId]: '' }));
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
          {/* Add New Category Form */}
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
            <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-md"><PlusIcon className="w-5 h-5"/></button>
          </form>

          {/* List of Categories */}
          <div className="space-y-4">
            {categories.filter(c => c.id !== 'uncategorized').map(cat => (
              <div key={cat.id} className="bg-gray-700 p-4 rounded-lg">
                {/* Category Edit Area */}
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
                      <button onClick={handleUpdateCategory} className="ml-2 text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5"/></button>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: cat.color }}></span>
                      <span className="font-bold text-lg" style={{ color: cat.color }}>{cat.name}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCategory(cat)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </div>
                
                {/* Recurring Tasks List for this Category */}
                <div className="pl-4 space-y-3 mb-4">
                  {cat.recurringTasks.map(task => (
                    <div key={task.id} className="bg-gray-600 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-200">{task.text}</span>
                        <div className="flex gap-2">
                          <button onClick={() => startEditingDays(task)} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4"/></button>
                          <button onClick={() => onDeleteRecurringTask(task.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                      </div>
                      
                      {/* NEW: Day of Week Editor */}
                      {editingRecTaskId === task.id ? (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex gap-1">
                            {DAYS_OF_WEEK.map(day => (
                              <button
                                key={day.value}
                                onClick={() => toggleDay(day.value)}
                                className={`w-6 h-6 rounded-full text-xs font-bold ${editingRecTaskDays.includes(day.value) ? 'bg-indigo-500 text-white' : 'bg-gray-500 text-gray-200'}`}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => saveEditingDays(task)} className="p-1 bg-green-500 rounded-md"><CheckIcon className="w-4 h-4"/></button>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-indigo-300">
                          {(task.daysOfWeek || []).length > 0 ? task.daysOfWeek.sort().map(d => DAYS_OF_WEEK[d].label).join(', ') : 'No days set'}
                        </div>
                      )}
                      
                      {/* NEW: Recurring Subtask List */}
                      <div className="pl-4 mt-2 space-y-1">
                        {task.subtaskTemplates.map(st => (
                          <div key={st.id} className="flex justify-between items-center bg-gray-500 p-1.5 rounded">
                            <span className="text-xs text-gray-300">{st.text}</span>
                            <button onClick={() => onDeleteRecurringSubtask(st.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-3 h-3"/></button>
                          </div>
                        ))}
                      </div>

                      {/* NEW: Add Recurring Subtask Form */}
                      <form onSubmit={(e) => handleAddRecSubtask(e, task.id)} className="flex gap-2 text-sm pl-4 mt-2">
                        <input
                          type="text"
                          value={newRecSubtask[task.id] || ''}
                          onChange={(e) => setNewRecSubtask(prev => ({ ...prev, [task.id]: e.target.value }))}
                          placeholder="Add subtask template..."
                          className="flex-grow bg-gray-500 border-gray-400 rounded-md p-1 text-xs text-white"
                        />
                        <button type="submit" className="p-1 bg-indigo-500 hover:bg-indigo-600 rounded-md"><PlusIcon className="w-3 h-3"/></button>
                      </form>
                    </div>
                  ))}
                  {cat.recurringTasks.length === 0 && <p className="text-sm text-gray-500">No recurring tasks for this category.</p>}
                </div>

                {/* Add Recurring Task Form for this Category */}
                <form onSubmit={(e) => handleAddRecurringTask(e, cat.id)} className="flex gap-2 text-sm pl-4">
                  <input
                    type="text"
                    value={newRecurringTask[cat.id] || ''}
                    onChange={(e) => setNewRecurringTask(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    placeholder="Add new recurring task..."
                    className="flex-grow bg-gray-600 border-gray-500 rounded-md p-2 text-white"
                  />
                  <button type="submit" className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-md"><PlusIcon className="w-4 h-4"/></button>
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
