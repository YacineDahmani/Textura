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
};

export function TopBar() {
  const activeTool = useToolStore((state) => state.activeTool);
  const toggleTheme = useToolStore((state) => state.toggleTheme);
  const setCommandPaletteOpen = useToolStore((state) => state.setCommandPaletteOpen);
  const setShortcutsModalOpen = useToolStore((state) => state.setShortcutsModalOpen);
  const setHistoryDrawerOpen = useToolStore((state) => state.setHistoryDrawerOpen);

  return (
    <header className="h-12 w-full fixed top-0 left-0 bg-surface-container border-b border-outline-variant/60 flex items-center justify-between px-4 z-50">
      {/* Left: Branding & Current Tool Indicator */}
      <div className="flex items-center gap-4 select-none">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-primary animate-pulse-subtle" />
          <span className="font-bold text-[16px] tracking-wide text-primary font-sans">Textura</span>
        </div>
        <div className="h-4 w-[1px] bg-outline-variant/50" />
        <div className="flex items-center gap-2 text-text-muted text-[11px] font-semibold tracking-widest uppercase">
          <span>{toolNames[activeTool]}</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex items-center">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="relative bg-surface-container-low border border-outline-variant/40 hover:border-primary/50 text-text-muted hover:text-text-base px-4 py-1.5 rounded-full w-80 text-left text-[12px] flex items-center justify-between transition-all duration-150 outline-none cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-text-faint group-hover:text-primary transition-colors" />
            <span>Search tools...</span>
          </div>
          <span className="text-text-faint font-mono text-[10px] border border-outline-variant/60 px-1.5 py-0.5 rounded uppercase select-none">
            Ctrl+K
          </span>
        </button>
      </div>

      {/* Right: Quick Action Controls & Version */}
      <div className="flex items-center gap-1.5">
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
          className="p-1.5 text-text-muted hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer rounded outline-none"
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
        
        <div className="h-4 w-[1px] bg-outline-variant/50 mx-1" />
        
        <span className="text-[10px] font-mono text-text-faint select-none">
          v1.0.0
        </span>
      </div>
    </header>
  );
}
