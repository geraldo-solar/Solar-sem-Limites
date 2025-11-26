import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, fullWidth = false, className = '', ...props }) => {
  return (
    <button 
      className={`
        bg-gradient-to-r from-solar-gold to-[#D4B070]
        text-solar-deep font-sans font-bold uppercase tracking-widest
        py-4 px-8 rounded-sm shadow-lg hover:shadow-xl
        transform hover:-translate-y-1 transition-all duration-300
        border border-[#C6A668]
        ${fullWidth ? 'w-full' : 'w-auto'}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};