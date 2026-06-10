import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

function Button({ children, onClick, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
    >
      {children}
    </button>
  );
}

export default Button;
