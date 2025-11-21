
import React from 'react';
import { QuadrantDefinition, QuadrantId, TodoItem } from '../types';
import TodoCard from './TodoCard';

interface QuadrantProps {
  quadrant: QuadrantDefinition;
  todos: TodoItem[];
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void; // Drop on quadrant
  onDragOverQuadrant: (event: React.DragEvent<HTMLDivElement>, targetQuadrantId: QuadrantId) => void;
  onDragLeaveQuadrant: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, id: string, sourceQuadrantId: QuadrantId | null) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onEditTodo: (id: string, newText: string) => void;
  onDeleteTodo: (id: string) => void;
  draggingTodoId: string | null; // ID of the todo currently being dragged
  dragOverZoneId: QuadrantId | null; // ID of the quadrant/zone being dragged over
  dragOverCardId: string | null; // ID of the card being dragged over
  dragOverPosition: 'top' | 'bottom' | null; // Position relative to dragOverCardId
  onDragOverCard: (event: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragLeaveCard: (event: React.DragEvent<HTMLDivElement>) => void;
}

const Quadrant: React.FC<QuadrantProps> = ({
  quadrant,
  todos,
  onDrop,
  onDragOverQuadrant,
  onDragLeaveQuadrant,
  onDragStart,
  onDragEnd,
  onEditTodo,
  onDeleteTodo,
  draggingTodoId,
  dragOverZoneId,
  dragOverCardId,
  dragOverPosition,
  onDragOverCard,
  onDragLeaveCard,
}) => {
  const isDraggingOverThisQuadrant = dragOverZoneId === quadrant.id && !dragOverCardId;

  return (
    <div
      id={`quadrant-${quadrant.id}`}
      onDrop={onDrop}
      onDragOver={(e) => onDragOverQuadrant(e, quadrant.id)}
      onDragLeave={onDragLeaveQuadrant}
      className={`
        flex flex-col p-4 m-0.5 rounded-lg shadow-inner
        ${quadrant.bgColor} ${quadrant.textColor} ${quadrant.borderColor}
        border-2
        ${isDraggingOverThisQuadrant ? 'border-dashed border-blue-400 bg-blue-50/50' : ''}
        transition-all duration-200 ease-in-out
      `}
    >
      <h3 className={`font-bold text-lg mb-1 ${quadrant.textColor}`}>{quadrant.title}</h3>
      <p className={`text-sm mb-3 ${quadrant.textColor} opacity-80`}>{quadrant.description}</p>
      <div className="flex-grow flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
        {todos.length === 0 ? (
          <p className="text-gray-600 text-sm italic text-center py-4">
            此象限尚無待辦事項
            {isDraggingOverThisQuadrant && <span className="block text-blue-500 font-medium">在此處放置</span>}
          </p>
        ) : (
          todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onEdit={onEditTodo}
              onDelete={onDeleteTodo}
              isDragging={draggingTodoId === todo.id}
              dragOverCardId={dragOverCardId}
              dragOverPosition={dragOverPosition}
              onDragOverCard={onDragOverCard}
              onDragLeaveCard={onDragLeaveCard}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Quadrant;
