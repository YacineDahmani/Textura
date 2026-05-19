import React, { useEffect } from 'react';
import { useToolStore } from '../../store/useToolStore';
import { X } from 'lucide-react';

const shortcuts = [
  { key: 'Ctrl + K', desc: 'Open Command Palette' },
  { key: 'Ctrl + Enter', desc: 'Run Active Transformation' },
  { key: 'Ctrl + D', desc: 'Clear Workspace Inputs' },
  { key: 'Ctrl + Shift + C', desc: 'Copy Output to Clipboard' },
  { key: 'Ctrl + Shift + S', desc: 'Swap Input and Output' },
  { key: 'Alt + Z', desc: 'Step backward in history' },
  { key: 'Alt + Y', desc: 'Step forward in history' },
  { key: '1 – 9', desc: 'Jump to specific Tool by Index' },
  { key: '?', desc: 'Toggle this Shortcuts Modal' },
  { key: 'Esc', desc: 'Close any active overlay / modal' },
];

export function ShortcutsModal() {
  const isOpen = useToolStore((state) => state.shortcutsModalOpen);
  const setOpen = useToolStore((state) => state.setShortcutsModalOpen);

  // Handle Esc key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center modal-backdrop select-none">
      <div 
        className="w-[440px] bg-surface-container border border-outline-variant/60 rounded shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-10 px-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase font-sans">
            Keyboard Shortcuts
          </span>
          <button 
            onClick={() => setOpen(false)}
            className="p-1 text-text-muted hover:text-primary transition-colors cursor-pointer rounded outline-none"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2 bg-surface-container">
          <div className="flex flex-col gap-1 max-h-[360px] overflow-y-auto">
            {shortcuts.map((s, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between border-b border-outline-variant/10 py-2 last:border-b-0"
              >
                <span className="text-[12px] text-text-muted">{s.desc}</span>
                <kbd className="px-2 py-0.5 font-mono text-[10px] font-bold text-primary bg-surface-container-low border border-outline-variant/50 rounded uppercase shadow-sm">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="h-8 px-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-center">
          <span className="text-[9px] font-mono text-text-faint">
            Press ESC to exit
          </span>
        </div>
      </div>
    </div>
  );
}
