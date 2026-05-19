import React from 'react';

export function Badge({ children, variant = 'info', className = '' }) {
  const styles = {
    info: 'bg-surface-container-highest text-text-muted border border-outline-variant/30',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-success-green/10 text-success-green border border-success-green/20',
    error: 'bg-error-red/10 text-error-red border border-error-red/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono leading-none ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
