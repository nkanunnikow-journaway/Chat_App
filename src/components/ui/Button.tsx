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
      className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export default Button;
