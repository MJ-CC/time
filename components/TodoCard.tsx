
import React, { useState } from 'react';
import { TodoItem, QuadrantId } from '../types';

interface TodoCardProps {
  todo: TodoItem;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, id: string, sourceQuadrantId: QuadrantId | null) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  isDragging: boolean; // True if this specific card is being dragged
  dragOverCardId: string | null; // ID of the card being hovered over
  dragOverPosition: 'top' | 'bottom' | null; // Position relative to dragOverCardId
  onDragOverCard: (event: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragLeaveCard: (event: React.DragEvent<HTMLDivElement>) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  isDragging,
  dragOverCardId,
  dragOverPosition,
  onDragOverCard,
  onDragLeaveCard,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editText.trim() !== todo.text) {
      onEdit(todo.id, editText.trim());
    } else {
      setEditText(todo.text); // Revert if no change
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (editText.trim() !== todo.text) {
        onEdit(todo.id, editText.trim());
      } else {
        setEditText(todo.text); // Revert if no change
      }
    }
  };

  const showInsertionTop = dragOverCardId === todo.id && dragOverPosition === 'top';
  const showInsertionBottom = dragOverCardId === todo.id && dragOverPosition === 'bottom';

  return (
    <div
      draggable="true"
      onDragStart={(e) => onDragStart(e, todo.id, todo.quadrantId)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOverCard(e, todo.id)}
      onDragLeave={onDragLeaveCard}
      className={`
        relative p-3 bg-white rounded-md shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing
        hover:bg-gray-50 transition-colors duration-200 group
        ${isDragging ? 'opacity-50 border-blue-500 border-2' : ''}
        ${showInsertionTop ? 'border-t-4 border-blue-500' : ''}
        ${showInsertionBottom ? 'border-b-4 border-blue-500' : ''}
      `}
      style={{
        // Prevents the border-t/b from shifting content
        marginTop: showInsertionTop ? '-4px' : '0',
        marginBottom: showInsertionBottom ? '-4px' : '0',
      }}
    >
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
          autoFocus
          className="w-full bg-gray-50 border border-blue-400 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <p className="text-gray-800 text-sm break-words" onDoubleClick={handleDoubleClick}>
          {todo.text}
        </p>
      )}
      <button
        onClick={() => onDelete(todo.id)}
        className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full"
        title="刪除待辦事項"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default TodoCard;
