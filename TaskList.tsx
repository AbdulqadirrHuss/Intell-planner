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
  
  // Local state for drag and drop ordering of categories
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);

  // Sync local orderedCategories with incoming categories prop on load/change
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

  // Drag and Drop Handlers
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
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

  if (tasks.length === 0) {
    return (
        <div className="text-center py-12 px-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-300">No tasks for this day!</h3>
            <p className="text-gray-500 mt-2">Select a Day Type or add a new task to get started.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {orderedCategories.filter(c => c.id !== 'uncategorized').map((category, index) => {
        const tasksInCategory = groupedTasks[category.id] || [];
        if (tasksInCategory.length === 0) return null; 

        const categoryProgress = calculateProgress(tasksInCategory);
        const isCollapsed = collapsedCategories[category.id];
        
        const activeTasks = tasksInCategory.filter(t => !t.completed);
        const completedTasks = tasksInCategory.filter(t => t.completed);

        return (
          <div 
            key={category.id}
            draggable
            onDragStart={(e) => { dragItem.current = index; e.currentTarget.classList.add('opacity-50'); }}
            onDragEnter={(e) => { dragOverItem.current = index; }}
            onDragEnd={(e) => { handleSort(); e.currentTarget.classList.remove('opacity-50'); }}
            onDragOver={(e) => e.preventDefault()}
            className="transition-all duration-200 ease-in-out"
          >
            {/* Category Header with Drag Handle */}
            <div className="flex items-center justify-between mb-3 group select-none">
              <div className="flex items-center flex-grow cursor-pointer" onClick={() => toggleCategory(category.id)}>
                <div className="mr-3 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 p-1 rounded hover:bg-gray-800 transition-colors" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => {
                    // Only allow drag start from handle
                    e.currentTarget.closest('[draggable]')?.setAttribute('draggable', 'true');
                }}>
                  <DragHandleIcon />
                </div>
                <h2 className="text-xl font-bold flex items-center" style={{ color: category.color }}>
                  {category.name}
                </h2>
                <div className={`ml-2 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`}>
                    <ChevronDownIcon isOpen={!isCollapsed} className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-gray-800 rounded-full border border-gray-700" style={{ color: category.color }}>{categoryProgress}%</span>
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
                            categoryColor="#4b5563" // Muted gray for completed
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

                {activeTasks.length === 0 && completedTasks.length === 0 && (
                    <p className="text-sm text-gray-600 italic ml-4 py-2">No tasks in this category.</p>
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
    </div>
  );
};

export default TaskList;
