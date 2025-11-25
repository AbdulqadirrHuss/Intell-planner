import React, { useState } from 'react';
import { Category } from './types';
import { PlusIcon, RecurringIcon } from './icons';

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${filled ? "text-yellow-400" : "text-gray-500"}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);

interface AdvancedTaskFormProps {
  categories: Category[];
  onAddTask: (text: string, categoryId: string, isRecurring: boolean) => void;
}

const AdvancedTaskForm: React.FC<AdvancedTaskFormProps> = ({ categories, onAddTask }) => {
  const [text, setText] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isPriority, setIsPriority] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTask(text, categoryId || 'uncategorized', isRecurring);
      setText('');
      setIsRecurring(false);
      setIsPriority(false);
      setCategoryId('');
    }
  };

  const currentCategoryName = categories.find(c => c.id === categoryId)?.name || "No Link";
  const currentCategoryColor = categories.find(c => c.id === categoryId)?.color || "#9ca3af";

  return (
    <div className="mt-auto pt-6">
      <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg transition-colors focus-within:border-gray-600">
        <div className="p-4 pb-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-transparent border-none text-gray-200 placeholder-gray-500 focus:ring-0 text-lg"
          />
        </div>
        <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setIsPriority(!isPriority)} className="p-1 hover:bg-gray-700 rounded transition-colors">
              <StarIcon filled={isPriority} />
            </button>
            <div className="h-4 w-px bg-gray-700"></div>
            <button 
              type="button" 
              onClick={() => setIsRecurring(!isRecurring)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isRecurring ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <RecurringIcon className="w-4 h-4" />
              {isRecurring ? "Recurring" : "One-off"}
            </button>
            <div className="h-4 w-px bg-gray-700"></div>
            <div className="relative group">
                <select 
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                    <option value="">No Link</option>
                    {categories.filter(c => c.id !== 'uncategorized').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryId ? currentCategoryColor : '#4b5563' }}></span>
                    {currentCategoryName}
                </div>
            </div>
          </div>
          <button type="submit" disabled={!text.trim()} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-lg">
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedTaskForm;
