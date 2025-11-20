// abdulqadirrhuss/intell-planner/Intell-planner-713a94aab450542265643e214f51f6b366832262/TaskList.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Task, Category } from '../types';
import { TrashIcon, PlusIcon, EditIcon, CheckIcon } from './icons';

// --- Icons ---

const DragHandleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4", isOpen }: { className?: string, isOpen: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={`${className} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const RecurringIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

// --- Subtask Item Component ---
interface SubtaskItemProps {
  task: Task;
  subtask: any;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onUpdateSubtaskText: (taskId: string, subtaskId: string, newText: string) => void;
  onToggleSubtaskRecurring: (taskId: string, subtaskId: string) => void;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({ 
  task, subtask, onToggleSubtask, onDeleteSubtask, onUpdateSubtaskText, onToggleSubtaskRecurring 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(subtask.text);

  const handleUpdate = () => {
    if (text.trim() && text !== subtask.text) {
      onUpdateSubtaskText(task.id, subtask.id, text.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center pl-8 pr-3 py-2 bg-gray-900/50 rounded-md border border-gray-800/50 group hover:bg-gray-800 transition-colors">
      <input
        type="checkbox"
        checked={subtask.completed}
        onChange={() => onToggleSubtask(task.id, subtask.id)}
        className="w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-600 ring-offset-gray-900 focus:ring-2 cursor-pointer"
      />
      
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
          className="ml-3 flex-1 text-sm bg-gray-700 text-white rounded p-0.5 border border-indigo-500 outline-none"
          autoFocus
        />
      ) : (
        <span className={`ml-3 flex-1 text-sm transition-all ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
          {subtask.text}
        </span>
      )}

      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
         <button 
          onClick={() => onToggleSubtaskRecurring(task.id, subtask.id)}
          className={`mr-2 ${subtask.isRecurring ? 'text-indigo-400' : 'text-gray-600'} hover:text-indigo-300 transition-colors`}
          title={subtask.isRecurring ? "Recurring subtask" : "Make recurring"}
        >
          <RecurringIcon className="w-3.5 h-3.5" />
        </button>

        {isEditing ? (
          <button onClick={handleUpdate} className="mr-2 text-green-400 hover:text-green-300"><CheckIcon className="w-3.5 h-3.5"/></button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="mr-2 text-gray-500 hover:text-white"><EditIcon className="w-3.5 h-3.5"/></button>
        )}
        <button onClick={() => onDeleteSubtask(subtask.id)} className="text-gray-600 hover:text-red-500 transition-colors"><TrashIcon className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
};

// --- Task Item Component ---
interface TaskItemProps {
  task: Task;
  categoryColor: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onUpdateTaskText: (taskId: string, newText: string) => void;
  onUpdateSubtaskText: (taskId: string, subtaskId: string, newText: string) => void;
  onToggleSubtaskRecurring: (taskId: string, subtaskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, categoryColor, onToggleTask, onDeleteTask, 
  onToggleSubtask, onDeleteSubtask, onAddSubtask,
  onUpdateTaskText, onUpdateSubtaskText, onToggleSubtaskRecurring
}) => {
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(task.text);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskText.trim()) {
      onAddSubtask(task.id, newSubtaskText);
      setNewSubtaskText('');
    }
  };

  const handleUpdate = () => {
    if (text.trim() && text !== task.text) {
      onUpdateTaskText(task.id, text.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`group p-3 bg-gray-800 rounded-lg mb-2 border-l-4 shadow-md transition-all hover:bg-gray-750`} style={{ borderColor: categoryColor }}>
      {/* Parent Task Row */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          disabled={hasSubtasks}
          onChange={() => onToggleTask(task.id)}
          className={`w-5 h-5 text-indigo-500 bg-gray-700 border-gray-600 rounded focus:ring-indigo-600 ring-offset-gray-800 focus:ring-2 ${hasSubtasks ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        />
        
        {isEditing ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
            className="ml-4 flex-1 bg-gray-700 text-white rounded p-1 border border-indigo-500 outline-none font-medium"
            autoFocus
          />
        ) : (
          <span className={`ml-4 flex-1 font-medium transition-all ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
            {task.text}
          </span>
        )}
        
        {task.isRecurring && <span className="text-xs bg-gray-700 text-indigo-300 px-2 py-0.5 rounded-full mr-3 border border-gray-600 font-medium">Recurring</span>}
        
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
           {isEditing ? (
            <button onClick={handleUpdate} className="ml-2 text-green-400 hover:text-green-300"><CheckIcon className="w-5 h-5"/></button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="ml-2 text-gray-500 hover:text-white"><EditIcon className="w-4 h-4"/></button>
          )}
          <button onClick={() => onDeleteTask(task.id)} className="ml-2 text-gray-500 hover:text-red-500 transition-colors">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtask List */}
      {(task.subtasks && task.subtasks.length > 0) && (
        <div className="mt-3 space-y-1.5">
          {task.subtasks.map(subtask => (
            <SubtaskItem 
              key={subtask.id}
              task={task}
              subtask={subtask}
              onToggleSubtask={onToggleSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onUpdateSubtaskText={onUpdateSubtaskText}
              onToggleSubtaskRecurring={onToggleSubtaskRecurring}
            />
          ))}
        </div>
      )}

      {/* Add Subtask Form - Only show if not completed */}
      {!task.completed && (
        <form onSubmit={handleAddSubtask} className="flex gap-2 items-center mt-3 pl-9 opacity-60 hover:opacity-100 transition-opacity duration-200">
          <PlusIcon className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={newSubtaskText}
            onChange={(e) => setNewSubtaskText(e.target.value)}
            placeholder="Add subtask..."
            className="flex-grow bg-transparent border-none text-gray-400 text-sm placeholder-gray-600 focus:ring-0 focus:text-white p-0"
          />
        </form>
      )}
    </div>
  );
};

// --- Main TaskList Component ---
interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onUpdateTaskText: (taskId: string, newText: string) => void;
  onUpdateSubtaskText: (taskId: string, subtaskId: string, newText: string) => void;
  onToggleSubtaskRecurring: (taskId: string, subtaskId: string) => void;
}

const calculateProgress = (tasks: Task[]): number => {
  const totalParentTasks = tasks.length;
  if (totalParentTasks === 0) return 0;

  const progressPerParent = 100 / totalParentTasks;

  const totalProgress = tasks.reduce((acc, task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return acc + (task.completed ? progressPerParent : 0);
    } else {
      const progressPerSubtask = progressPerParent / task.subtasks.length;
      const completedSubtasks = task.subtasks.filter(st => st.completed).length;
      return acc + (completedSubtasks * progressPerSubtask);
    }
  }, 0);

  return Math.round(totalProgress);
};

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, categories, onToggleTask, onDeleteTask,
  onToggleSubtask, onDeleteSubtask, onAddSubtask,
  onUpdateTaskText, onUpdateSubtaskText, onToggleSubtaskRecurring
}) => {
  // Local state for collapsing categories (headers)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  // Local state for expanding the "Completed" dropdowns
  const [expandedCompletedSections, setExpandedCompletedSections] = useState<Record<string, boolean>>({});
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [forcedVisibleCategories, setForcedVisibleCategories] = useState<string[]>([]);
  const [isAddCatDropdownOpen, setIsAddCatDropdownOpen] = useState(false);

  // Drag and Drop State
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (orderedCategories.length === 0) {
      setOrderedCategories(categories);
    } else {
      const newCats = categories.filter(c => !orderedCategories.find(oc => oc.id === c.id));
      const existingCats = orderedCategories.filter(oc => categories.find(c => c.id === oc.id));
      const updatedExisting = existingCats.map(oc => categories.find(c => c.id === oc.id)!);
      setOrderedCategories([...updatedExisting, ...newCats]);
    }
  }, [categories]);

  const groupedTasks = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const categoryId = task.categoryId;
    (acc[categoryId] = acc[categoryId] || []).push(task);
    return acc;
  }, {});

  const uncategorizedTasks = groupedTasks['uncategorized'] || [];

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setIsDragging(true);
    // Create a ghost image or just rely on styling
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    e.currentTarget.classList.remove('opacity-50');
    
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      return;
    }

    const _categories = [...orderedCategories];
    const draggedItemContent = _categories.splice(dragItem.current, 1)[0];
    _categories.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;
    setOrderedCategories(_categories);
  };

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const toggleCompletedSection = (categoryId: string) => {
    setExpandedCompletedSections(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const addCategoryToView = (categoryId: string) => {
    if (!forcedVisibleCategories.includes(categoryId)) {
      setForcedVisibleCategories(prev => [...prev, categoryId]);
    }
    setIsAddCatDropdownOpen(false);
  };

  if (tasks.length === 0 && forcedVisibleCategories.length === 0) {
    return (
        <div className="text-center py-12 px-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-300">No tasks for this day!</h3>
            <p className="text-gray-500 mt-2">Select a Day Type or add a new task to get started.</p>
            {/* Allow adding a category even when empty */}
            <div className="mt-6">
              <button onClick={() => setIsAddCatDropdownOpen(!isAddCatDropdownOpen)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-1 mx-auto">
                <PlusIcon className="w-4 h-4" /> Add Category to View
              </button>
               {isAddCatDropdownOpen && (
                  <div className="mt-2 w-64 mx-auto bg-gray-700 rounded-lg shadow-xl border border-gray-600 z-10 overflow-hidden text-left">
                    {categories.filter(c => c.id !== 'uncategorized').map(cat => (
                      <div key={cat.id} onClick={() => addCategoryToView(cat.id)} className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-sm text-gray-200">
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </div>
    );
  }

  // Get list of hidden categories for the dropdown
  const hiddenCategories = categories.filter(c => 
    c.id !== 'uncategorized' && 
    (!groupedTasks[c.id] || groupedTasks[c.id].length === 0) &&
    !forcedVisibleCategories.includes(c.id)
  );

  return (
    <div className="space-y-6 pb-24">
      {orderedCategories.filter(c => c.id !== 'uncategorized').map((category, index) => {
        const tasksInCategory = groupedTasks[category.id] || [];
        
        // Logic: Show if it has tasks OR if user manually added it
        const isVisible = tasksInCategory.length > 0 || forcedVisibleCategories.includes(category.id);
        if (!isVisible) return null;

        const categoryProgress = calculateProgress(tasksInCategory);
        const isCollapsed = collapsedCategories[category.id];
        
        const activeTasks = tasksInCategory.filter(t => !t.completed);
        const completedTasks = tasksInCategory.filter(t => t.completed);

        return (
          <div 
            key={category.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()} // Necessary for drop
            className={`transition-all duration-300 ease-in-out ${isDragging ? 'cursor-grabbing' : ''}`}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-3 group select-none">
              <div className="flex items-center flex-grow cursor-pointer" onClick={() => toggleCategory(category.id)}>
                <div 
                  className="mr-3 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 p-1 rounded hover:bg-gray-800 transition-colors" 
                  onMouseDown={(e) => e.stopPropagation()} // Prevent click propagation
                >
                  <DragHandleIcon />
                </div>
                <h2 className="text-xl font-bold flex items-center" style={{ color: category.color }}>
                  {category.name}
                </h2>
                <div className={`ml-2 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`}>
                    <ChevronDownIcon isOpen={!isCollapsed} className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-gray-800 rounded-full border border-gray-700" style={{ color: category.color }}>{Math.round(categoryProgress)}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-1.5 mb-5 overflow-hidden">
              <div
                className="h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                style={{ width: `${categoryProgress}%`, backgroundColor: category.color }}
              ></div>
            </div>

            {/* Tasks Area */}
            {!isCollapsed && (
              <div className="space-y-4 transition-all duration-300 ease-in-out pl-2">
                
                {/* Active Tasks */}
                <div className="space-y-3">
                  {activeTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      categoryColor={category.color}
                      onToggleTask={onToggleTask}
                      onDeleteTask={onDeleteTask}
                      onToggleSubtask={onToggleSubtask}
                      onDeleteSubtask={onDeleteSubtask}
                      onAddSubtask={onAddSubtask}
                      onUpdateTaskText={onUpdateTaskText}
                      onUpdateSubtaskText={onUpdateSubtaskText}
                      onToggleSubtaskRecurring={onToggleSubtaskRecurring}
                    />
                  ))}
                </div>

                {/* Empty State for Manually Added Category */}
                {activeTasks.length === 0 && completedTasks.length === 0 && (
                    <div className="text-sm text-gray-500 italic ml-4 py-4 border-2 border-dashed border-gray-800 rounded-lg text-center">
                        No tasks yet. Add a task below or drag one here.
                    </div>
                )}

                {/* Completed Tasks Dropdown */}
                {completedTasks.length > 0 && (
                  <div className="mt-6">
                    <button 
                      onClick={() => toggleCompletedSection(category.id)}
                      className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-300 mb-3 transition-colors ml-1"
                    >
                      <ChevronDownIcon isOpen={!!expandedCompletedSections[category.id]} className="w-3 h-3" />
                      Completed ({completedTasks.length})
                    </button>
                    
                    {expandedCompletedSections[category.id] && (
                      <div className="space-y-2 pl-4 border-l-2 border-gray-800 opacity-70 hover:opacity-100 transition-opacity">
                        {completedTasks.map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            categoryColor="#4b5563" // Muted gray
                            onToggleTask={onToggleTask}
                            onDeleteTask={onDeleteTask}
                            onToggleSubtask={onToggleSubtask}
                            onDeleteSubtask={onDeleteSubtask}
                            onAddSubtask={onAddSubtask}
                            onUpdateTaskText={onUpdateTaskText}
                            onUpdateSubtaskText={onUpdateSubtaskText}
                            onToggleSubtaskRecurring={onToggleSubtaskRecurring}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

       {/* Uncategorized Tasks */}
       {uncategorizedTasks.length > 0 && (
         <div className="mt-10 pt-6 border-t border-gray-800">
            <h2 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-3 px-2">
                Uncategorized
                <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-500 border border-gray-700">{uncategorizedTasks.length}</span>
            </h2>
            <div className="space-y-3 pl-2">
            {uncategorizedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                categoryColor="#6b7280"
                onToggleTask={onToggleTask}
                onDeleteTask={onDeleteTask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={onDeleteSubtask}
                onAddSubtask={onAddSubtask}
                onUpdateTaskText={onUpdateTaskText}
                onUpdateSubtaskText={onUpdateSubtaskText}
                onToggleSubtaskRecurring={onToggleSubtaskRecurring}
              />
            ))}
            </div>
          </div>
      )}

      {/* Add Category Button (Floating at bottom or inline) */}
      {hiddenCategories.length > 0 && (
         <div className="mt-8 flex justify-center">
            <div className="relative">
                <button 
                  onClick={() => setIsAddCatDropdownOpen(!isAddCatDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm font-medium text-gray-300 transition-colors border border-gray-700 shadow-sm"
                >
                  <PlusIcon className="w-4 h-4" /> Add Category to View
                </button>
                
                {isAddCatDropdownOpen && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-20">
                    <div className="py-1">
                      {hiddenCategories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => addCategoryToView(cat.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                             {cat.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
         </div>
      )}
    </div>
  );
};

export default TaskList;
