import React from 'react';

interface AuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const AuCard: React.FC<AuCardProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`au-card rounded-2xl p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};
