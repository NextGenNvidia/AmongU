import React from 'react';

interface AuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'red' | 'lime' | 'cyan' | 'yellow' | 'white';
  children: React.ReactNode;
}

const variantClasses = {
  red: 'bg-crew-red hover:bg-red-500 text-white',
  lime: 'bg-crew-lime hover:bg-green-400 text-black',
  cyan: 'bg-crew-cyan hover:bg-cyan-300 text-black',
  yellow: 'bg-crew-yellow hover:bg-yellow-300 text-black',
  white: 'bg-crew-white hover:bg-gray-200 text-black',
};

export const AuButton: React.FC<AuButtonProps> = ({
  variant = 'lime',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`au-btn font-display rounded-full py-3 px-8 transition-transform ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
