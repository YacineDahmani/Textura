import React, { useEffect } from 'react';
import { useToolStore } from '../../store/useToolStore';
import { X, CornerDownLeft, Clipboard } from 'lucide-react';

export function HistoryDrawer() {
  const isOpen = useToolStore((state) => state.historyDrawerOpen);
  const setOpen = useToolStore((state) => state.setHistoryDrawerOpen);
  const activeTool = useToolStore((state) => state.activeTool);
  const toolData = useToolStore((state) => state.tools[activeTool]);
  const updateToolInput = useToolStore((state) => state.updateToolInput);

  const history = toolData?.history || [];

  // Close drawer on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

  if (!isOpen) return null;

  const handleRestore = (text) => {
    updateToolInput(activeTool, text);
    setOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end modal-backdrop select-none"
      onClick={() => setOpen(false)}
    >
      <div 
        className="w-[300px] h-full bg-surface-container border-l border-outline-variant/60 flex flex-col justify-between shadow-2xl relative animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 px-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase font-sans">
            Input History
          </span>
          <button 
            onClick={() => setOpen(false)}
            className="p-1.5 text-text-muted hover:text-primary transition-colors cursor-pointer rounded outline-none"
          >
            <X size={15} />
          </button>
        </div>

        {/* List of Entries */}
        <div className="flex-1 p-4 overflow-y-auto bg-surface-container flex flex-col gap-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-faint text-center gap-1.5 py-12">
              <Clipboard size={24} className="opacity-40" />
              <span className="text-[12px] italic">No recent inputs saved.</span>
              <span className="text-[10px] leading-relaxed max-w-[200px]">
                Valid transformed inputs are cached here for quick restoration.
              </span>
            </div>
          ) : (
            history.map((text, idx) => (
              <div 
                key={idx}
                onClick={() => handleRestore(text)}
                title="Click to restore to Input pane"
                className="group border border-outline-variant/20 hover:border-primary/45 p-3 rounded bg-surface-container-low/40 hover:bg-primary/5 transition-all duration-120 cursor-pointer flex flex-col justify-between min-h-[72px]"
              >
                <div className="font-mono text-[11px] text-text-muted group-hover:text-text-base leading-relaxed line-clamp-3 break-all whitespace-pre-wrap select-text">
                  {text}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/5">
                  <span className="text-[9px] font-mono text-text-faint font-semibold">
                    ENTRY #{idx + 1}
                  </span>
                  <span className="text-[9px] font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 leading-none uppercase">
                    Restore
                    <CornerDownLeft size={10} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="h-8 px-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-center">
          <span className="text-[9px] font-mono text-text-faint uppercase tracking-wider">
            Saves up to 10 entries
          </span>
        </div>
      </div>
    </div>
  );
}
