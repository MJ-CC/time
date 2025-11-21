
import React from 'react';

interface AddTodoButtonProps {
  onAddTodo: () => void;
}

const AddTodoButton: React.FC<AddTodoButtonProps> = ({ onAddTodo }) => {
  return (
    <button
      onClick={onAddTodo}
      className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 fixed bottom-4 right-4 z-50 md:static md:w-full md:rounded-lg md:h-16 md:mb-4"
      title="新增待辦事項"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 md:h-8 md:w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
};

export default AddTodoButton;
