import React, { useState } from 'react';
import { DayType, Category } from './types';
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
  onDeleteDayType, onAddRecurringTask, onDeleteRecurringTask
}) => {
  const [newDayTypeName, setNewDayTypeName] = useState('');
  const [editingDayTypeId, setEditingDayTypeId] = useState<string | null>(null);
  const [editingDayTypeName, setEditingDayTypeName] = useState('');
  const [newRecurringTask, setNewRecurringTask] = useState<{ [key: string]: string }>({});
  const [selectedDayType, setSelectedDayType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Select the first day type by default if none selected
  if (!selectedDayType && dayTypes.length > 0) {
      setSelectedDayType(dayTypes[0].id);
  }

  const activeDayType = dayTypes.find(dt => dt.id === selectedDayType);

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
  };

  const handleAddRoutine = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedDayType && newRecurringTask[selectedDayType]?.trim()) {
          // IMPORTANT: We send '' as categoryId to mark it as a ROUTINE (Uncategorized)
          onAddRecurringTask(selectedDayType, newRecurringTask[selectedDayType], '');
          setNewRecurringTask(prev => ({ ...prev, [selectedDayType]: '' }));
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex border border-gray-800 overflow-hidden">
        
        {/* SIDEBAR: Day Types List */}
        <div className="w-1/3 border-r border-gray-800 flex flex-col bg-gray-900">
            <div className="p-5 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Day Types</h2>
                <p className="text-xs text-gray-500 mt-1">Select a day to manage routines.</p>
            </div>
            
            <div className="flex-grow overflow-y-auto p-3 space-y-2">
                {dayTypes.map(dt => (
                    <div 
                        key={dt.id} 
                        onClick={() => setSelectedDayType(dt.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedDayType === dt.id ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-gray-800/50 border-transparent hover:bg-gray-800'}`}
                    >
                        <div className="flex justify-between items-center">
                            {editingDayTypeId === dt.id ? (
                                <div className="flex gap-2 w-full">
                                    <input 
                                        type="text" 
                                        value={editingDayTypeName} 
                                        onClick={e => e.stopPropagation()}
                                        onChange={e => setEditingDayTypeName(e.target.value)} 
                                        className="flex-grow bg-gray-900 text-white rounded border border-indigo-500 px-2 text-sm" 
                                        autoFocus
                                    />
                                    <button onClick={() => handleUpdateDayType(dt.id)} className="text-green-400"><CheckIcon className="w-4 h-4"/></button>
                                </div>
                            ) : (
                                <span className={`font-medium ${selectedDayType === dt.id ? 'text-indigo-300' : 'text-gray-300'}`}>{dt.name}</span>
                            )}
                            <div className="flex gap-1">
                                <button onClick={(e) => { e.stopPropagation(); startEditing(dt); }} className="p-1 text-gray-500 hover:text-white"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteDayType(dt.id); }} className="p-1 text-gray-500 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-800">
                <form onSubmit={handleAddDayType} className="flex gap-2">
                    <input 
                        type="text" 
                        value={newDayTypeName} 
                        onChange={e => setNewDayTypeName(e.target.value)}
                        placeholder="New Day Type..." 
                        className="flex-grow bg-gray-800 border-none rounded-lg text-sm text-white px-3 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button type="submit" className="bg-indigo-600 p-2 rounded-lg text-white"><PlusIcon className="w-5 h-5"/></button>
                </form>
            </div>
        </div>

        {/* MAIN: Routines for Selected Day */}
        <div className="w-2/3 flex flex-col bg-gray-900/50">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                    Routines for <span className="text-indigo-400">{activeDayType?.name}</span>
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="flex-grow overflow-y-auto p-6">
                {activeDayType ? (
                    <div className="space-y-4">
                        {/* List Routines */}
                        {activeDayType.recurringTasks.filter(t => !t.categoryId || t.categoryId === 'uncategorized').length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl">
                                <p className="text-gray-500 italic">No routine tasks defined for this day type yet.</p>
                            </div>
                        )}

                        {activeDayType.recurringTasks.filter(t => !t.categoryId || t.categoryId === 'uncategorized').map(task => (
                            <div key={task.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                    <span className="text-gray-200">{task.text}</span>
                                </div>
                                <button onClick={() => onDeleteRecurringTask(activeDayType.id, task.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Select a day type to edit.</p>
                )}
            </div>

            {/* Add Routine Input */}
            {activeDayType && (
                <div className="p-6 border-t border-gray-800 bg-gray-900">
                    <form onSubmit={handleAddRoutine} className="flex gap-3">
                        <input 
                            type="text"
                            value={newRecurringTask[activeDayType.id] || ''}
                            onChange={e => setNewRecurringTask(prev => ({ ...prev, [activeDayType.id]: e.target.value }))} 
                            placeholder="Add a new routine task (e.g. Drink Water)..."
                            className="flex-grow bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all">
                            Add
                        </button>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DayTypeManager;
