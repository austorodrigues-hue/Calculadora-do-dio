
import React from 'react';

interface ButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'action' | 'scientific';
  className?: string;
}

export const CalcButton: React.FC<ButtonProps> = ({ label, onClick, variant = 'number', className = '' }) => {
  const baseStyles = "calc-button h-14 md:h-16 rounded-2xl font-semibold text-lg flex items-center justify-center transition-all duration-200 shadow-sm";
  
  const variantStyles = {
    number: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    operator: "bg-indigo-600 text-white hover:bg-indigo-500",
    action: "bg-slate-700 text-amber-400 hover:bg-slate-600",
    scientific: "bg-slate-900 text-indigo-400 hover:bg-slate-800 text-sm"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {label}
    </button>
  );
};

export const Display: React.FC<{ expression: string; result: string }> = ({ expression, result }) => (
  <div className="glass rounded-3xl p-6 mb-4 flex flex-col items-end justify-end overflow-hidden min-h-[140px]">
    <div className="text-slate-400 text-lg font-mono mb-2 truncate w-full text-right h-7">
      {expression || ' '}
    </div>
    <div className="text-white text-4xl md:text-5xl font-bold font-mono truncate w-full text-right">
      {result || '0'}
    </div>
  </div>
);
