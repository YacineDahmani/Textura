import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { Search, Keyboard, Contrast, History, Terminal } from 'lucide-react';

const toolNames = {
  'case-converter': 'Case Converter',
  'text-cleaner': 'Text Cleaner',
  'text-stats': 'Text Stats',
  'json-formatter': 'JSON Formatter',
  'diff-viewer': 'Diff Viewer',
  'regex-tester': 'Regex Tester',
  'base64': 'Base64 Tool',
  'url-encoder': 'URL Encoder',
  'hash-generator': 'Hash Generator',
  'minifier': 'Code Minifier',
};

export function TopBar() {
  const activeTool = useToolStore((state) => state.activeTool);
  const toggleTheme = useToolStore((state) => state.toggleTheme);
  const setCommandPaletteOpen = useToolStore((state) => state.setCommandPaletteOpen);
  const setShortcutsModalOpen = useToolStore((state) => state.setShortcutsModalOpen);
  const setHistoryDrawerOpen = useToolStore((state) => state.setHistoryDrawerOpen);
  const toggleMobileSidebarOpen = useToolStore((state) => state.toggleMobileSidebarOpen);

  return (
    <header className="h-12 w-full fixed top-0 left-0 bg-surface-container border-b border-outline-variant/60 flex items-center justify-between px-3 sm:px-4 z-50 gap-2">
      {/* Left: Branding & Current Tool Indicator */}
      <div className="flex items-center gap-2 sm:gap-4 select-none min-w-0">
        <button
          onClick={() => toggleMobileSidebarOpen()}
          className="md:hidden p-1.5 text-text-muted hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer rounded outline-none"
          aria-label="Open tools menu"
        >
          <span className="block h-0.5 w-4 bg-current rounded mb-1" />
          <span className="block h-0.5 w-4 bg-current rounded mb-1" />
          <span className="block h-0.5 w-4 bg-current rounded" />
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <Terminal size={18} className="text-primary animate-pulse-subtle" />
          <span className="font-bold text-[15px] sm:text-[16px] tracking-wide text-primary font-sans">Textura</span>
        </div>
        <div className="h-4 w-[1px] bg-outline-variant/50 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-2 text-text-muted text-[11px] font-semibold tracking-widest uppercase min-w-0">
          <span>{toolNames[activeTool]}</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex items-center flex-1 justify-center min-w-0 px-1 sm:px-0">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="relative bg-surface-container-low border border-outline-variant/40 hover:border-primary/50 text-text-muted hover:text-text-base p-2 sm:px-4 sm:py-1.5 rounded-full flex items-center justify-center transition-all duration-150 outline-none cursor-pointer group w-9 h-9 sm:w-auto sm:max-w-[24rem] md:w-80"
        >
          <Search
            size={13}
            className="text-text-faint group-hover:text-primary transition-colors shrink-0 sm:absolute sm:left-3 sm:top-1/2 sm:-translate-y-1/2"
          />
          <span className="hidden sm:block w-full text-center truncate text-[11px] leading-none">
            Search tools...
          </span>
        </button>
      </div>

      {/* Right: Quick Action Controls & Version */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          onClick={() => setHistoryDrawerOpen(true)}
          title="Recent History (Alt+Z / Alt+Y)"
          className="p-1.5 text-text-muted hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer rounded outline-none"
        >
          <History size={16} />
        </button>
        <button
          onClick={() => setShortcutsModalOpen(true)}
          title="Keyboard Shortcuts (?)"
          className="hidden sm:inline-flex p-1.5 text-text-muted hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer rounded outline-none"
        >
          <Keyboard size={16} />
        </button>
        <button
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
          className="p-1.5 text-text-muted hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer rounded outline-none"
        >
          <Contrast size={16} />
        </button>
        
        <div className="h-4 w-[1px] bg-outline-variant/50 mx-1 hidden sm:block" />
        
        <span className="hidden sm:inline text-[10px] font-mono text-text-faint select-none">
          v1.0.0
        </span>
      </div>
    </header>
  );
}
