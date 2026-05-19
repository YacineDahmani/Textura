import { useEffect, useRef } from 'react';
import { useToolStore } from '../store/useToolStore';

export function useHistory() {
  const activeTool = useToolStore((state) => state.activeTool);
  const toolData = useToolStore((state) => state.tools[activeTool]);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const addHistoryEntry = useToolStore((state) => state.addHistoryEntry);
  
  // Track current history pointer
  const historyIndexRef = useRef(-1);

  // Reset history pointer when active tool changes or when input is cleared
  useEffect(() => {
    historyIndexRef.current = -1;
  }, [activeTool]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check Alt+Z (Backward in history) and Alt+Y (Forward in history)
      const isAltZ = e.altKey && e.key.toLowerCase() === 'z';
      const isAltY = e.altKey && e.key.toLowerCase() === 'y';

      if (!isAltZ && !isAltY) return;

      const history = toolData?.history || [];
      if (history.length === 0) return;

      e.preventDefault();

      if (isAltZ) {
        // Move backward (older entries)
        const nextIndex = historyIndexRef.current + 1;
        if (nextIndex < history.length) {
          historyIndexRef.current = nextIndex;
          updateToolInput(activeTool, history[nextIndex]);
        }
      } else if (isAltY) {
        // Move forward (newer entries)
        const nextIndex = historyIndexRef.current - 1;
        if (nextIndex >= 0) {
          historyIndexRef.current = nextIndex;
          updateToolInput(activeTool, history[nextIndex]);
        } else if (nextIndex === -1) {
          historyIndexRef.current = -1;
          updateToolInput(activeTool, '');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTool, toolData, updateToolInput]);

  return {
    recordHistory: (text) => addHistoryEntry(activeTool, text),
    historyIndex: historyIndexRef.current,
  };
}
