import React from 'react';

export function ActionButton({
  children,
  onClick,
  active = false,
  className = '',
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 h-8 rounded-full border text-[11px] font-semibold tracking-wider uppercase transition-all duration-120 active:scale-95 cursor-pointer shrink-0 ${
        active
          ? 'border-primary bg-primary text-on-primary font-bold shadow-[0_0_8px_rgba(138,210,222,0.15)]'
          : 'border-outline-variant hover:border-primary hover:text-primary text-text-muted bg-surface-container-high'
      } ${className}`}
    >
      {children}
    </button>
  );
}
