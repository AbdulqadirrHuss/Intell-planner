
import React, { useState } from 'react';
import { DayType, Category, RecurringTaskTemplate } from '../types';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon } from './icons';

interface DayTypeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  dayTypes: DayType[];
  categories: Category[];
  onAddDayType: (name: string) => void;
  onUpdateDayType: (id: string, name: string) => void;
  onDeleteDayType: (id: string) => void;
  onAddRecurringTask: (dayTypeId: string, text: string, categoryId: string) => void;
  onDeleteRecurringTask: (dayTypeId: string, taskId: string) => void;
}

const DayTypeManager: React.FC<DayTypeManagerProps> = ({
  isOpen, onClose, dayTypes, categories, onAddDayType, onUpdateDayType,
  onDeleteDayType, onAddRecurringTask, onDeleteRecurringTask
}) => {
  const [newDayTypeName, setNewDayTypeName] = useState('');
  const [editingDayTypeId, setEditingDayTypeId] = useState<string | null>(null);
  const [editingDayTypeName, setEditingDayTypeName] = useState('');
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

  const handleAddRecurringTask = (e: React.FormEvent, dayTypeId: string) => {
    e.preventDefault();
    const taskInfo = newRecurringTask[dayTypeId];
    if (taskInfo && taskInfo.text.trim() && taskInfo.categoryId) {
      onAddRecurringTask(dayTypeId, taskInfo.text, taskInfo.categoryId);
      setNewRecurringTask(prev => ({ ...prev, [dayTypeId]: { text: '', categoryId: categories[0]?.id || '' } }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Manage Day Types</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Add New Day Type Form */}
          <form onSubmit={handleAddDayType} className="flex gap-2">
            <input
              type="text"
              value={newDayTypeName}
              onChange={(e) => setNewDayTypeName(e.target.value)}
              placeholder="Add a new day type (e.g., Weekend)"
              className="flex-grow bg-gray-700 border-gray-600 text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 p-2"
            />
            <button type="submit" className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"><PlusIcon className="w-5 h-5"/></button>
          </form>

          {/* List of Day Types */}
          <div className="space-y-4">
            {dayTypes.map(dt => (
              <div key={dt.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  {editingDayTypeId === dt.id ? (
                      <div className="flex gap-2 w-full">
                        <input type="text" value={editingDayTypeName} onChange={e => setEditingDayTypeName(e.target.value)} className="flex-grow bg-gray-600 rounded p-1" autoFocus/>
                        <button onClick={() => handleUpdateDayType(dt.id)} className="text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5"/></button>
                      </div>
                  ) : (
                    <h3 className="text-lg font-bold text-indigo-300">{dt.name}</h3>
                  )}
                  <div className="flex items-center gap-2">
                     <button onClick={() => startEditing(dt)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button>
                     <button onClick={() => onDeleteDayType(dt.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </div>

                {/* Recurring Tasks */}
                <div className="space-y-2 mb-4">
                  {dt.recurringTasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center bg-gray-600 p-2 rounded">
                      <span className="text-sm">{task.text}</span>
                      <button onClick={() => onDeleteRecurringTask(dt.id, task.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {dt.recurringTasks.length === 0 && <p className="text-sm text-gray-500">No recurring tasks.</p>}
                </div>

                {/* Add Recurring Task Form */}
                <form onSubmit={(e) => handleAddRecurringTask(e, dt.id)} className="flex gap-2 text-sm">
                  <input
                    type="text"
                    value={newRecurringTask[dt.id]?.text || ''}
                    onChange={(e) => setNewRecurringTask(prev => ({ ...prev, [dt.id]: { ...prev[dt.id], text: e.target.value, categoryId: prev[dt.id]?.categoryId || categories[0]?.id } }))}
                    placeholder="Add recurring task..."
                    className="flex-grow bg-gray-600 border-gray-500 rounded-md p-2"
                  />
                  <select
                     value={newRecurringTask[dt.id]?.categoryId || categories[0]?.id}
                     onChange={(e) => setNewRecurringTask(prev => ({ ...prev, [dt.id]: { ...prev[dt.id], categoryId: e.target.value, text: prev[dt.id]?.text || '' } }))}
                     className="bg-gray-600 border-gray-500 rounded-md p-2"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
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

export default DayTypeManager;
