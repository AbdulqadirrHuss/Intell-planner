import React, { useState } from 'react';
import { Category, RecurringTaskTemplate } from '../types';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon } from './icons';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddRecurringTask: (categoryId: string, text: string) => void;
  onDeleteRecurringTask: (taskId: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen, onClose, categories, onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddRecurringTask, onDeleteRecurringTask
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
                <div className="pl-4 space-y-2 mb-4">
                  {cat.recurringTasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center bg-gray-600 p-2 rounded">
                      <span className="text-sm text-gray-200">{task.text}</span>
                      <button onClick={() => onDeleteRecurringTask(task.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
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
