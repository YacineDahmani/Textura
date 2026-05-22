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

  // Mobile layout state management
  const [activeMobileTab, setActiveMobileTab] = useState('input');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Automatically reset mobile view to input pane when active tool changes
  useEffect(() => {
    setActiveMobileTab('input');
  }, [activeTool]);

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
        className="flex-1 flex w-full relative overflow-hidden select-none min-h-0 flex-col md:flex-row"
      >
        {/* Left Input Pane */}
        <div
          style={isMobile ? undefined : { width: `${splitRatio}%` }}
          className={`h-full flex-col shrink-0 min-h-0 min-w-0 overflow-hidden w-full md:w-auto md:flex-1 ${
            isMobile 
              ? (activeMobileTab === 'input' ? 'flex' : 'hidden') 
              : 'flex'
          }`}
        >
          {leftPane}
        </div>

        {/* Gutter Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="hidden md:flex w-[4px] h-full cursor-col-resize bg-outline-variant/20 hover:bg-primary/60 transition-colors shrink-0 z-10 items-center justify-center group"
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
        <div
          style={isMobile ? undefined : { width: `${100 - splitRatio}%` }}
          className={`h-full flex-col shrink-0 min-h-0 min-w-0 overflow-hidden w-full md:w-auto md:flex-1 ${
            isMobile 
              ? (activeMobileTab === 'output' ? 'flex' : 'hidden') 
              : 'flex'
          }`}
        >
          {rightPane}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden select-text relative">
      {/* Mobile Glassmorphic Tab Bar */}
      {isMobile && !customLayout && (
        <div className="flex md:hidden w-full h-11 border-b border-outline-variant/30 bg-surface-container-lowest/60 backdrop-blur-md items-center justify-center shrink-0 px-4 select-none">
          <div className="flex bg-surface-container-high/60 p-0.5 rounded-lg border border-outline-variant/20 w-full max-w-[280px]">
            <button
              onClick={() => setActiveMobileTab('input')}
              className={`flex-1 py-1 text-[11px] font-bold tracking-wider uppercase rounded-md transition-all duration-200 cursor-pointer ${
                activeMobileTab === 'input'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-text-muted hover:text-text-base'
              }`}
            >
              Input
            </button>
            <button
              onClick={() => setActiveMobileTab('output')}
              className={`flex-1 py-1 text-[11px] font-bold tracking-wider uppercase rounded-md transition-all duration-200 cursor-pointer ${
                activeMobileTab === 'output'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-text-muted hover:text-text-base'
              }`}
            >
              Output
            </button>
          </div>
        </div>
      )}

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
      <footer className="h-8 w-full bg-surface-container-lowest/80 border-t border-outline-variant/60 flex items-center justify-between px-3 sm:px-4 z-10 select-none shrink-0 font-mono text-[10px] sm:text-[11px] overflow-hidden">
        <div className="flex-1 flex items-center gap-3 text-primary overflow-x-auto whitespace-nowrap scrollbar-hide mr-4">
          <span className="font-semibold">Chars: <span className="text-text-base">{charCount}</span> <span className="text-[9px] text-text-muted">({noSpaceCharCount} no spaces)</span></span>
          <span className="text-text-faint">·</span>
          <span className="font-semibold">Words: <span className="text-text-base">{wordCount}</span></span>
          <span className="text-text-faint">·</span>
          <span className="font-semibold">Lines: <span className="text-text-base">{lineCount}</span></span>
          <span className="text-text-faint">·</span>
          <span className="font-semibold">Bytes: <span className="text-text-base">{byteStr}</span></span>
          <span className="text-text-faint">·</span>
          <span className="font-semibold text-text-muted">Read: <span className="text-text-base">~{readTime}m</span></span>
        </div>
        <div className="flex items-center gap-2 text-text-faint text-[9px] uppercase tracking-wider shrink-0 select-none">
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
