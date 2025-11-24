import React, { useState, useEffect, useRef } from 'react';
import { Task, Category } from '../types';
import { TrashIcon, PlusIcon, EditIcon, CheckIcon, DragHandleIcon, ChevronDownIcon, RecurringIcon } from './icons';

// ... (Icons same as previous contexts, omitted for brevity) ...

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
  sortedCategoryIds: string[]; // NEW PROP from App.tsx
  onReorderCategories: (newOrder: string[]) => void; // NEW PROP from App.tsx
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
  tasks, categories, sortedCategoryIds, onReorderCategories,
  onToggleTask, onDeleteTask,
  onToggleSubtask, onDeleteSubtask, onAddSubtask,
  onUpdateTaskText, onUpdateSubtaskText, onToggleSubtaskRecurring
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [expandedCompletedSections, setExpandedCompletedSections] = useState<Record<string, boolean>>({});
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [forcedVisibleCategories, setForcedVisibleCategories] = useState<string[]>([]);
  const [isAddCatDropdownOpen, setIsAddCatDropdownOpen] = useState(false);

  // Drag and Drop State
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);

  // Initialize order based on props
  useEffect(() => {
    if (categories.length === 0) return;

    // 1. Map sortedCategoryIds to actual category objects
    const orderedFromProps = sortedCategoryIds
        .map(id => categories.find(c => c.id === id))
        .filter(c => c !== undefined) as Category[];

    // 2. Identify categories that are NOT in the sorted list (new ones, or one-offs)
    const otherCategories = categories.filter(c => !sortedCategoryIds.includes(c.id));

    // 3. Combine: Sorted First + Others
    setOrderedCategories([...orderedFromProps, ...otherCategories]);
  }, [categories, sortedCategoryIds]);

  const groupedTasks = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const categoryId = task.categoryId;
    (acc[categoryId] = acc[categoryId] || []).push(task);
    return acc;
  }, {});

  const uncategorizedTasks = groupedTasks['uncategorized'] || [];

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, category: Category) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault(); // Necessary to allow dropping
    if (!draggedCategory || draggedCategory.id === targetCategory.id) return;

    const currentIndex = orderedCategories.findIndex(c => c.id === draggedCategory.id);
    const targetIndex = orderedCategories.findIndex(c => c.id === targetCategory.id);

    if (currentIndex === -1 || targetIndex === -1 || currentIndex === targetIndex) return;

    const newOrderedCategories = [...orderedCategories];
    // Move item in local state immediately for visual feedback
    newOrderedCategories.splice(currentIndex, 1);
    newOrderedCategories.splice(targetIndex, 0, draggedCategory);

    setOrderedCategories(newOrderedCategories);
  };

  const handleDragEnd = () => {
    if (draggedCategory) {
        // Report new order to parent to save to DB
        const newOrderIds = orderedCategories.map(c => c.id);
        onReorderCategories(newOrderIds);
    }
    setDraggedCategory(null);
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

  // Main list to render
  const categoriesToRender = orderedCategories.filter(c => c.id !== 'uncategorized');

  // Dropdown list items
  const hiddenCategories = categories.filter(c => 
    c.id !== 'uncategorized' && 
    (!groupedTasks[c.id] || groupedTasks[c.id].length === 0) &&
    !forcedVisibleCategories.includes(c.id)
  );

  if (tasks.length === 0 && forcedVisibleCategories.length === 0) {
    return (
        <div className="text-center py-12 px-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-300">No tasks for this day!</h3>
            <p className="text-gray-500 mt-2">Select a Day Type or add a new task to get started.</p>
            <div className="mt-6">
              <button onClick={() => setIsAddCatDropdownOpen(!isAddCatDropdownOpen)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-1 mx-auto">
                <PlusIcon className="w-4 h-4" /> Add Category to Day
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

  return (
    <div className="space-y-6 pb-24">
      {categoriesToRender.map((category) => {
        const tasksInCategory = groupedTasks[category.id] || [];
        const isVisible = tasksInCategory.length > 0 || forcedVisibleCategories.includes(category.id);
        
        if (!isVisible) return null;

        const categoryProgress = calculateProgress(tasksInCategory);
        const isCollapsed = collapsedCategories[category.id];
        const activeTasks = tasksInCategory.filter(t => !t.completed);
        const completedTasks = tasksInCategory.filter(t => t.completed);
        const isBeingDragged = draggedCategory?.id === category.id;

        return (
          <div 
            key={category.id}
            draggable
            onDragStart={(e) => handleDragStart(e, category)}
            onDragOver={(e) => handleDragOver(e, category)}
            onDragEnd={handleDragEnd}
            className={`
              transition-all duration-200 ease-in-out rounded-lg
              ${isBeingDragged ? 'opacity-40 bg-gray-800/50' : ''}
            `}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-3 group select-none">
              <div className="flex items-center flex-grow cursor-pointer" onClick={() => toggleCategory(category.id)}>
                <div 
                  className="mr-3 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 p-1 rounded hover:bg-gray-800 transition-colors" 
                  onMouseDown={(e) => e.stopPropagation()} 
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
            
            {/* Progress Bar (Thicker, solid color style restored) */}
            <div className="w-full bg-gray-700/50 rounded-full h-2 mb-5 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${categoryProgress}%`, backgroundColor: category.color }}
              ></div>
            </div>

            {/* Tasks Area */}
            {!isCollapsed && !isBeingDragged && (
              <div className="space-y-4 pl-2">
                
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

                {/* Empty State */}
                {activeTasks.length === 0 && completedTasks.length === 0 && (
                    <div className="text-sm text-gray-500 italic ml-4 py-4 border-2 border-dashed border-gray-800 rounded-lg text-center">
                        No tasks yet. Add a task below.
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
                            categoryColor="#4b5563" 
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
