import React, { useState, useEffect, useCallback } from 'react';
import { TodoItem, QuadrantId, QuadrantDefinition } from './types';
import Quadrant from './components/Quadrant';
import AddTodoButton from './components/AddTodoButton';
import TodoCard from './components/TodoCard';

// Define the quadrants for the Eisenhower Matrix
const quadrants: QuadrantDefinition[] = [
  {
    id: QuadrantId.URGENT_IMPORTANT,
    title: '重要且緊急',
    description: '立即處理，這是你的首要任務！',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-400',
  },
  {
    id: QuadrantId.NOT_URGENT_IMPORTANT,
    title: '重要但不緊急',
    description: '計劃處理，這是目標和長期發展的基礎。',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-400',
  },
  {
    id: QuadrantId.URGENT_NOT_IMPORTANT,
    title: '緊急但不重要',
    description: '委託處理，這些事情通常是干擾或別人的急事。',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-400',
  },
  {
    id: QuadrantId.NOT_URGENT_NOT_IMPORTANT,
    title: '不重要也不緊急',
    description: '消除或延後，避免花費太多時間在這上面。',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-400',
  },
];

const App: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [draggingTodoId, setDraggingTodoId] = useState<string | null>(null);
  const [dragOverZoneId, setDragOverZoneId] = useState<QuadrantId | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'top' | 'bottom' | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');

  // Initialize with some sample data and load from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    } else {
      setTodos([
        { id: crypto.randomUUID(), text: '設計網頁佈局', quadrantId: QuadrantId.URGENT_IMPORTANT },
        { id: crypto.randomUUID(), text: '撰寫報告草稿', quadrantId: QuadrantId.NOT_URGENT_IMPORTANT },
        { id: crypto.randomUUID(), text: '回覆電子郵件', quadrantId: QuadrantId.URGENT_NOT_IMPORTANT },
        { id: crypto.randomUUID(), text: '瀏覽社群媒體', quadrantId: QuadrantId.NOT_URGENT_NOT_IMPORTANT },
        { id: crypto.randomUUID(), text: '購買雜貨', quadrantId: QuadrantId.UNASSIGNED },
        { id: crypto.randomUUID(), text: '學習React Hooks', quadrantId: QuadrantId.UNASSIGNED },
      ]);
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const handleAddTodoClick = useCallback(() => {
    setIsAdding(true);
  }, []);
  
  const handleCancelAddTodo = useCallback(() => {
    setIsAdding(false);
    setNewTodoText('');
  }, []);

  const handleSaveNewTodo = useCallback(() => {
    if (newTodoText.trim()) {
      const newTodo: TodoItem = {
        id: crypto.randomUUID(),
        text: newTodoText.trim(),
        quadrantId: QuadrantId.UNASSIGNED,
      };
      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      handleCancelAddTodo();
    }
  }, [newTodoText, handleCancelAddTodo]);

  const handleNewTodoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveNewTodo();
    } else if (e.key === 'Escape') {
      handleCancelAddTodo();
    }
  };


  const handleDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, id: string, sourceQuadrantId: QuadrantId | null) => {
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.setData('sourceQuadrantId', sourceQuadrantId || QuadrantId.UNASSIGNED); // Store original quadrant
    setDraggingTodoId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingTodoId(null);
    setDragOverZoneId(null);
    setDragOverCardId(null);
    setDragOverPosition(null);
  }, []);

  const handleDragOverQuadrant = useCallback((event: React.DragEvent<HTMLDivElement>, targetQuadrantId: QuadrantId) => {
    event.preventDefault(); // Necessary to allow dropping
    event.dataTransfer.dropEffect = 'move';
    if (dragOverZoneId !== targetQuadrantId) {
      setDragOverZoneId(targetQuadrantId);
      setDragOverCardId(null); // Clear card hover if dragging over general quadrant area
      setDragOverPosition(null);
    }
  }, [dragOverZoneId]);

  const handleDragLeaveQuadrant = useCallback(() => {
    // We don't clear state here to prevent flickering when moving between cards within the same quadrant.
    // The state will be cleared on DragEnd or updated by DragOverQuadrant/DragOverCard.
  }, []);

  const handleDragOverCard = useCallback((event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.preventDefault();
    event.stopPropagation(); // Stop propagation to parent quadrant's drag over
    event.dataTransfer.dropEffect = 'move';

    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const position = y < rect.height / 2 ? 'top' : 'bottom';

    if (dragOverCardId !== id || dragOverPosition !== position) {
      setDragOverCardId(id);
      setDragOverPosition(position);

      // Ensure dragOverZoneId is correctly set based on the card's current quadrant
      const hoveredCard = todos.find(todo => todo.id === id);
      if (hoveredCard && dragOverZoneId !== (hoveredCard.quadrantId || QuadrantId.UNASSIGNED)) {
        setDragOverZoneId(hoveredCard.quadrantId || QuadrantId.UNASSIGNED);
      }
    }
  }, [dragOverCardId, dragOverPosition, dragOverZoneId, todos]);

  const handleDragLeaveCard = useCallback(() => {
    setDragOverCardId(null);
    setDragOverPosition(null);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const draggedId = event.dataTransfer.getData('text/plain');

    // Exit if there's no ID or if dropping onto the same card
    if (!draggedId || draggedId === dragOverCardId) {
      handleDragEnd();
      return;
    }

    const draggedTodoOriginalIndex = todos.findIndex(t => t.id === draggedId);
    if (draggedTodoOriginalIndex === -1) {
      handleDragEnd(); // Something went wrong, reset state
      return;
    }

    const draggedTodo = { ...todos[draggedTodoOriginalIndex] };
    
    // Create a new array without the dragged item.
    let remainingTodos = todos.filter(t => t.id !== draggedId);

    // Determine target quadrant
    const targetQuadrant = dragOverZoneId || QuadrantId.UNASSIGNED;
    draggedTodo.quadrantId = targetQuadrant; // Update quadrantId of the dragged item

    // This logic correctly preserves relative order within each quadrant.
    const todosInTargetQuadrant = remainingTodos.filter(t => t.quadrantId === targetQuadrant);
    const otherTodos = remainingTodos.filter(t => t.quadrantId !== targetQuadrant);

    let finalTargetQuadrantTodos = [...todosInTargetQuadrant]; // List to be reordered
    let insertionLocalIndex = finalTargetQuadrantTodos.length; // Default to append to the end of the quadrant's list

    if (dragOverCardId) {
        const targetCardLocalIndex = finalTargetQuadrantTodos.findIndex(t => t.id === dragOverCardId);
        if (targetCardLocalIndex !== -1) {
            insertionLocalIndex = dragOverPosition === 'top' ? targetCardLocalIndex : targetCardLocalIndex + 1;
        }
    }

    // Insert the dragged todo into its new local position within the target quadrant's list
    finalTargetQuadrantTodos.splice(insertionLocalIndex, 0, draggedTodo);

    // Reconstruct the global todos list
    setTodos([...otherTodos, ...finalTargetQuadrantTodos]);

    handleDragEnd(); // Reset all dragging states
  }, [todos, dragOverZoneId, dragOverCardId, dragOverPosition, handleDragEnd]);


  const handleEditTodo = useCallback((id: string, newText: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo))
    );
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    if (window.confirm('確定要刪除此待辦事項嗎？')) {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    }
  }, []);


  const unassignedTodos = todos.filter((todo) => todo.quadrantId === QuadrantId.UNASSIGNED);
  const isDraggingOverUnassignedZone = dragOverZoneId === QuadrantId.UNASSIGNED && !dragOverCardId;

  return (
    <div className="flex flex-col lg:flex-row w-full h-full bg-gray-50 rounded-lg shadow-xl">
      {/* Left 2/3 - Time Matrix Quadrants */}
      <div className="flex-grow-[2] p-4 grid grid-cols-1 md:grid-cols-2 gap-4 lg:h-full lg:overflow-y-auto custom-scrollbar">
        {quadrants.map((quadrant) => (
          <Quadrant
            key={quadrant.id}
            quadrant={quadrant}
            todos={todos.filter((todo) => todo.quadrantId === quadrant.id)}
            onDrop={handleDrop}
            onDragOverQuadrant={handleDragOverQuadrant}
            onDragLeaveQuadrant={handleDragLeaveQuadrant}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo}
            draggingTodoId={draggingTodoId}
            dragOverZoneId={dragOverZoneId}
            dragOverCardId={dragOverCardId}
            dragOverPosition={dragOverPosition}
            onDragOverCard={handleDragOverCard}
            onDragLeaveCard={handleDragLeaveCard}
          />
        ))}
      </div>

      {/* Right 1/3 - Unassigned Todo List & Add Button */}
      <div
        id={`quadrant-${QuadrantId.UNASSIGNED}`} // ID for the unassigned drop zone
        onDrop={handleDrop}
        onDragOver={(e) => handleDragOverQuadrant(e, QuadrantId.UNASSIGNED)}
        onDragLeave={handleDragLeaveQuadrant}
        className={`
          flex-grow-[1] p-4 bg-gray-100 border-l border-gray-200 flex flex-col gap-4 overflow-y-auto custom-scrollbar relative
          ${isDraggingOverUnassignedZone ? 'border-dashed border-blue-400 bg-gray-200/50' : ''}
          transition-all duration-200 ease-in-out
        `}
      >
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-2">待辦事項列表</h2>

        {/* New Add Todo Form */}
        {isAdding && (
          <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 mb-3 animate-fade-in">
            <textarea
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleNewTodoKeyDown}
              placeholder="輸入待辦事項，按 Enter 新增..."
              className="w-full bg-gray-50 border border-blue-400 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={handleCancelAddTodo} className="px-3 py-1 text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">取消</button>
              <button onClick={handleSaveNewTodo} className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">新增事項</button>
            </div>
          </div>
        )}

        <div className="flex-grow flex flex-col gap-3 rounded-lg p-3"> {/* Inner div for todos to prevent padding issues with scrollbar */}
          {unassignedTodos.length === 0 && !isAdding ? (
            <p className="text-gray-600 text-sm italic text-center py-4">
              將待辦事項拖曳到這裡，或點擊 '+' 新增。
              {isDraggingOverUnassignedZone && <span className="block text-blue-500 font-medium">在此處放置</span>}
            </p>
          ) : (
            unassignedTodos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
                isDragging={draggingTodoId === todo.id}
                dragOverCardId={dragOverCardId}
                dragOverPosition={dragOverPosition}
                onDragOverCard={handleDragOverCard}
                onDragLeaveCard={handleDragLeaveCard}
              />
            ))
          )}
        </div>
        <div className="flex justify-center md:block mt-auto pt-2">
          {!isAdding && <AddTodoButton onAddTodo={handleAddTodoClick} />}
        </div>
      </div>
    </div>
  );
};

export default App;
