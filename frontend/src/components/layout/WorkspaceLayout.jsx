import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToolStore } from '../../store/useToolStore';
import { ArrowLeftRight } from 'lucide-react';

export function WorkspaceLayout({
  children,
  actionChips = null,
  showSwap = true,
  customLayout = false, // If true, the parent tool renders its own layout
}) {
  const activeTool = useToolStore((state) => state.activeTool);
  const toolData = useToolStore((state) => state.tools[activeTool]);
  const swapToolInputOutput = useToolStore((state) => state.swapToolInputOutput);
  
  const [splitRatio, setSplitRatio] = useState(50); // percentage for left pane
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Stats computation for Stats Strip
  const inputText = toolData?.input || '';
  const charCount = inputText.length;
  const noSpaceCharCount = inputText.replace(/\s/g, '').length;
  const wordCount = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;
  const lineCount = inputText === '' ? 0 : inputText.split('\n').length;
  
  // Calculate size in bytes
  const byteCount = new Blob([inputText]).size;
  const byteStr = byteCount < 1024 
    ? `${byteCount} B` 
    : `${(byteCount / 1024).toFixed(1)} KB`;
    
  const readTime = Math.ceil(wordCount / 200);

  // Drag resizer handlers
  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - containerRect.left;
    const percentage = (relativeX / containerRect.width) * 100;
    
    // Bounds limit (between 20% and 80%)
    if (percentage >= 20 && percentage <= 80) {
      setSplitRatio(percentage);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Standard Split Layout rendering
  const renderStandardSplit = () => {
    if (!Array.isArray(children) || children.length < 2) return children;
    const [leftPane, rightPane] = children;

    return (
      <div 
        ref={containerRef} 
        className="flex-1 flex w-full relative overflow-hidden select-none h-[calc(100vh-48px-48px-32px)]"
      >
        {/* Left Input Pane */}
        <div style={{ width: `${splitRatio}%` }} className="h-full flex flex-col shrink-0">
          {leftPane}
        </div>

        {/* Gutter Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="w-[4px] h-full cursor-col-resize bg-outline-variant/20 hover:bg-primary/60 transition-colors shrink-0 z-10 flex items-center justify-center group"
        >
          {showSwap && (
            <button
              onClick={() => swapToolInputOutput(activeTool)}
              title="Swap Input/Output (Ctrl+Shift+S)"
              className="absolute -translate-x-0 w-6 h-6 rounded-full bg-surface-container-highest border border-outline-variant hover:border-primary text-text-muted hover:text-primary flex items-center justify-center transition-transform duration-300 hover:rotate-180 cursor-pointer shadow-md select-none"
            >
              <ArrowLeftRight size={12} />
            </button>
          )}
        </div>

        {/* Right Output Pane */}
        <div style={{ width: `${100 - splitRatio}%` }} className="h-full flex flex-col shrink-0">
          {rightPane}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-text relative">
      {/* Workspace Area */}
      {customLayout ? children : renderStandardSplit()}

      {/* Action Bar */}
      {actionChips && (
        <div className="h-12 w-full bg-surface-container-high border-t border-outline-variant/60 flex items-center px-4 gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
          <span className="text-[10px] font-bold tracking-widest text-text-faint uppercase font-mono mr-2 select-none">
            Options:
          </span>
          <div className="flex items-center gap-2 select-none">
            {actionChips}
          </div>
        </div>
      )}

      {/* Persistent Live Stats Strip */}
      <footer className="h-8 w-full bg-surface-container-lowest/80 border-t border-outline-variant/60 flex items-center px-4 gap-4 z-10 select-none shrink-0 font-mono text-[11px]">
        <div className="flex items-center gap-3 text-primary">
          <span className="font-semibold">Chars: <span className="text-text-base">{charCount}</span> <span className="text-text-muted">({noSpaceCharCount} no spaces)</span></span>
          <span className="text-text-faint">·</span>
          <span className="font-semibold">Words: <span className="text-text-base">{wordCount}</span></span>
          <span className="text-text-faint">·</span>
          <span className="font-semibold">Lines: <span className="text-text-base">{lineCount}</span></span>
          <span className="text-text-faint">·</span>
          <span className="font-semibold">Bytes: <span className="text-text-base">{byteStr}</span></span>
          <span className="text-text-faint">·</span>
          <span className="font-semibold text-text-muted">Read: <span className="text-text-base">~{readTime}m</span></span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-text-faint text-[9px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse-subtle"></span> 
            Live
          </span>
          <span className="text-outline-variant">|</span>
          <span className="font-bold">UTF-8</span>
        </div>
      </footer>
    </div>
  );
}
