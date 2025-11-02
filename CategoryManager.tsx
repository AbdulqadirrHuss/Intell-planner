
import React, { useState } from 'react';
import { Category } from '../types';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon } from './icons';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen, onClose, categories, onAddCategory, onUpdateCategory, onDeleteCategory
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4f46e5');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Manage Categories</h2>
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
              className="flex-grow bg-gray-700 border-gray-600 rounded-md p-2"
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
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                {editingCategory?.id === cat.id ? (
                  <>
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="flex-grow bg-gray-600 p-1 rounded-md" autoFocus
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
                  <>
                    <div className="flex items-center">
                      <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: cat.color }}></span>
                      <span>{cat.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingCategory(cat)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button>
                      <button onClick={() => onDeleteCategory(cat.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
