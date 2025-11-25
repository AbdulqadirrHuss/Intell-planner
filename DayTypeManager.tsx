import React, { useState } from 'react';
import { DayType, Category, RecurringTaskTemplate } from './types';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon } from './icons';

interface DayTypeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  dayTypes: DayType[];
  categories: Category[];
  onAddDayType: (name: string) => void;
  onUpdateDayType: (id: string, name: string) => void;
  onDeleteDayType: (id: string) => void;
  onAddCategoryToDayType: (dayTypeId: string, categoryId: string) => void;
  onRemoveCategoryFromDayType: (dayTypeId: string, categoryId: string) => void;
  onAddRecurringTask: (dayTypeId: string, text: string, categoryId: string) => void;
  onDeleteRecurringTask: (dayTypeId: string, taskId: string) => void;
}

const DayTypeManager: React.FC<DayTypeManagerProps> = ({
  isOpen, onClose, dayTypes, categories, onAddDayType, onUpdateDayType,
  onDeleteDayType, onAddCategoryToDayType, onRemoveCategoryFromDayType,
  onAddRecurringTask, onDeleteRecurringTask
}) => {
  const [newDayTypeName, setNewDayTypeName] = useState('');
  const [editingDayTypeId, setEditingDayTypeId] = useState<string | null>(null);
  const [editingDayTypeName, setEditingDayTypeName] = useState('');
  const [newCategoryLink, setNewCategoryLink] = useState<{ [key: string]: string }>({});
  const [newRecurringTask, setNewRecurringTask] = useState<{ [key: string]: { text: string; categoryId: string } }>({});

  if (!isOpen) return null;

  const handleAddDayType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDayTypeName.trim()) {
      onAddDayType(newDayTypeName.trim());
      setNewDayTypeName('');
    }
  };

  const handleUpdateDayType = (id: string) => {
    if (editingDayTypeName.trim()) {
        onUpdateDayType(id, editingDayTypeName.trim());
        setEditingDayTypeId(null);
        setEditingDayTypeName('');
    }
  };

  const startEditing = (dayType: DayType) => {
    setEditingDayTypeId(dayType.id);
    setEditingDayTypeName(dayType.name);
  }

  const handleAddCategory = (e: React.FormEvent, dayTypeId: string) => {
    e.preventDefault();
    const categoryId = newCategoryLink[dayTypeId];
    if (categoryId) {
      onAddCategoryToDayType(dayTypeId, categoryId);
      setNewCategoryLink(prev => ({ ...prev, [dayTypeId]: '' }));
    }
  };

  const handleAddRecurringTask = (e: React.FormEvent, dayTypeId: string) => {
    e.preventDefault();
    const taskInfo = newRecurringTask[dayTypeId];
    if (taskInfo && taskInfo.text.trim()) {
      // Allow categoryId to be empty string for Uncategorized
      onAddRecurringTask(dayTypeId, taskInfo.text, taskInfo.categoryId || '');
      setNewRecurringTask(prev => ({ ...prev, [dayTypeId]: { text: '', categoryId: '' } }));
    }
  };

  const availableCategories = categories.filter(c => c.id !== 'uncategorized');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-white">Manage Day Types & Routines</h2>
            <p className="text-sm text-gray-400">Configure what preloads when you select a day.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto bg-gray-900/50">
          {/* Add New Day Type Form */}
          <form onSubmit={handleAddDayType} className="flex gap-3">
            <input
              type="text"
              value={newDayTypeName}
              onChange={(e) => setNewDayTypeName(e.target.value)}
              placeholder="Create new Day Type (e.g., 'Monk Mode', 'Deep Work')"
              className="flex-grow bg-gray-800 border-gray-600 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3"
            />
            <button type="submit" className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg transition-colors"><PlusIcon className="w-5 h-5"/></button>
          </form>

          {/* List of Day Types */}
          <div className="grid grid-cols-1 gap-6">
            {dayTypes.map(dt => (
              <div key={dt.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                
                {/* Header */}
                <div className="p-4 bg-gray-750 border-b border-gray-700 flex justify-between items-center">
                  {editingDayTypeId === dt.id ? (
                    <div className="flex gap-2 w-full items-center">
                      <input type="text" value={editingDayTypeName} onChange={e => setEditingDayTypeName(e.target.value)} className="flex-grow bg-gray-900 text-white rounded p-2 border border-indigo-500" autoFocus/>
                      <button onClick={() => handleUpdateDayType(dt.id)} className="p-2 bg-green-600 text-white rounded hover:bg-green-500"><CheckIcon className="w-5 h-5"/></button>
                    </div>
                  ) : (
                    <h3 className="text-xl font-bold text-indigo-300">{dt.name}</h3>
                  )}
                  <div className="flex items-center gap-2">
                     <button onClick={() => startEditing(dt)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><EditIcon className="w-5 h-5"/></button>
                     <button onClick={() => onDeleteDayType(dt.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Column 1: Routine Tasks */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Routine Tasks
                        </h4>
                        <div className="space-y-2 min-h-[100px] bg-gray-900/30 p-3 rounded-lg border border-gray-700/50">
                            {dt.recurringTasks.map(task => (
                                <div key={task.id} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-gray-500 text-xs">•</span>
                                        <span className="text-gray-300 text-sm truncate">{task.text}</span>
                                        {task.categoryId && task.categoryId !== 'uncategorized' && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 border border-gray-600">
                                                {categories.find(c => c.id === task.categoryId)?.name}
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={() => onDeleteRecurringTask(dt.id, task.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                            {dt.recurringTasks.length === 0 && <p className="text-xs text-gray-600 italic">No recurring tasks added.</p>}
                        </div>
                        
                        {/* Add Task Form */}
                        <form onSubmit={(e) => handleAddRecurringTask(e, dt.id)} className="flex gap-2">
                            <input
                                type="text"
                                value={newRecurringTask[dt.id]?.text || ''}
                                onChange={(e) => setNewRecurringTask(prev => ({ ...prev, [dt.id]: { ...prev[dt.id], text: e.target.value, categoryId: prev[dt.id]?.categoryId || '' } }))}
                                placeholder="Add routine task..."
                                className="flex-grow bg-gray-900 border-gray-600 rounded px-2 py-1.5 text-sm text-white"
                            />
                            <select
                                value={newRecurringTask[dt.id]?.categoryId || ''}
                                onChange={(e) => setNewRecurringTask(prev => ({ ...prev, [dt.id]: { ...prev[dt.id], categoryId: e.target.value, text: prev[dt.id]?.text || '' } }))}
                                className="bg-gray-900 border-gray-600 rounded px-2 py-1.5 text-xs text-gray-300 max-w-[100px]"
                            >
                                <option value="">Habit</option>
                                {availableCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <button type="submit" className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded"><PlusIcon className="w-4 h-4"/></button>
                        </form>
                    </div>

                    {/* Column 2: Linked Categories */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Visible Categories
                        </h4>
                        <div className="space-y-2 min-h-[100px] bg-gray-900/30 p-3 rounded-lg border border-gray-700/50">
                            {dt.categoryIds.map(catId => {
                                const category = categories.find(c => c.id === catId);
                                if (!category) return null;
                                return (
                                <div key={catId} className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded border border-gray-700">
                                    <span className="text-sm font-medium" style={{color: category.color}}>{category.name}</span>
                                    <button onClick={() => onRemoveCategoryFromDayType(dt.id, catId)} className="text-gray-500 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                                );
                            })}
                            {dt.categoryIds.length === 0 && <p className="text-xs text-gray-600 italic">No categories linked (Standard view).</p>}
                        </div>

                        <form onSubmit={(e) => handleAddCategory(e, dt.id)} className="flex gap-2">
                            <select
                                value={newCategoryLink[dt.id] || ''}
                                onChange={(e) => setNewCategoryLink(prev => ({ ...prev, [dt.id]: e.target.value }))}
                                className="flex-grow bg-gray-900 border-gray-600 rounded px-2 py-1.5 text-sm text-gray-300"
                            >
                                <option value="" disabled>Link category to view...</option>
                                {availableCategories
                                .filter(cat => !dt.categoryIds.includes(cat.id))
                                .map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                                }
                            </select>
                            <button type="submit" className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded"><PlusIcon className="w-4 h-4"/></button>
                        </form>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayTypeManager;
