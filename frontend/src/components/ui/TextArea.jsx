import React, { useRef, useEffect } from 'react';

export function TextArea({
  value,
  onChange,
  placeholder,
  readOnly = false,
  isOutput = false,
  error = null,
}) {
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

  // Sync scroll between textarea and line number gutter
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Generate line numbers based on the value
  const lines = value === '' ? ['1'] : value.split('\n');
  
  // Keep scroll aligned on value change (e.g. swap or copy)
  useEffect(() => {
    handleScroll();
  }, [value]);

  return (
    <div className={`flex-1 flex h-full relative border border-transparent overflow-hidden ${
      isOutput ? 'bg-surface-container-low/20' : 'bg-surface-container-low/40'
    }`}>
      {/* Line Numbers Gutter */}
      <div
        ref={gutterRef}
        className="w-10 select-none bg-surface-container-lowest/30 border-r border-outline-variant/10 py-4 flex flex-col items-end pr-2 overflow-hidden scrollbar-hide text-text-faint font-mono text-[11px] leading-6"
      >
        {lines.map((_, index) => (
          <span 
            key={index} 
            className={`${error && error.line === index + 1 ? 'text-error-red font-semibold animate-pulse-subtle' : ''}`}
          >
            {index + 1}
          </span>
        ))}
      </div>

      {/* Editor Surface */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck="false"
        className={`flex-1 p-4 font-mono text-[13px] leading-6 outline-none h-full overflow-y-auto whitespace-pre overflow-x-auto ${
          isOutput 
            ? 'text-primary/95 placeholder:text-text-faint' 
            : 'text-text-base placeholder:text-text-faint'
        }`}
      />

      {/* Inline Validation Error Overlay */}
      {error && (
        <div className="absolute bottom-4 left-14 right-4 bg-error-red/10 border border-error-red/20 px-3 py-2 text-[12px] font-mono text-error-red rounded flex items-center justify-between">
          <span>{error.message}</span>
          {error.line && <span className="opacity-70">Line {error.line}</span>}
        </div>
      )}
    </div>
  );
}
