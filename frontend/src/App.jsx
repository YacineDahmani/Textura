import React, { useEffect } from 'react';
import { useToolStore } from './store/useToolStore';
import { useHistory } from './hooks/useHistory';

// Layout & Overlays
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { ShortcutsModal } from './components/layout/ShortcutsModal';
import { HistoryDrawer } from './components/layout/HistoryDrawer';
import { CommandPalette } from './components/layout/CommandPalette';

// Tools Components
import CaseConverter from './components/tools/CaseConverter';
import TextCleaner from './components/tools/TextCleaner';
import TextStats from './components/tools/TextStats';
import JSONFormatter from './components/tools/JSONFormatter';
import DiffViewer from './components/tools/DiffViewer';
import RegexTester from './components/tools/RegexTester';
import Base64Tool from './components/tools/Base64Tool';
import URLEncoder from './components/tools/URLEncoder';
import HashGenerator from './components/tools/HashGenerator';

const toolIndexMap = [
  'case-converter',
  'text-cleaner',
  'text-stats',
  'json-formatter',
  'diff-viewer',
  'regex-tester',
  'base64',
  'url-encoder',
  'hash-generator',
];

export default function App() {
  const activeTool = useToolStore((state) => state.activeTool);
  const setActiveTool = useToolStore((state) => state.setActiveTool);
  const toolData = useToolStore((state) => state.tools[activeTool]);
  const clearToolInput = useToolStore((state) => state.clearToolInput);
  const swapToolInputOutput = useToolStore((state) => state.swapToolInputOutput);

  // Modals controllers
  const setCommandPaletteOpen = useToolStore((state) => state.setCommandPaletteOpen);
  const setShortcutsModalOpen = useToolStore((state) => state.setShortcutsModalOpen);
  const shortcutsModalOpen = useToolStore((state) => state.shortcutsModalOpen);

  // Initialize history recorder
  const { recordHistory } = useHistory();

  // Record history on valid changes
  useEffect(() => {
    if (toolData?.input && toolData.input.trim() !== '') {
      const timer = setTimeout(() => {
        recordHistory(toolData.input);
      }, 1000); // 1s idle timeout before logging history entry
      return () => clearTimeout(timer);
    }
  }, [toolData?.input, recordHistory]);

  // Global Keyboard Shortcuts orchestrator
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      const isTyping = 
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA';

      // 1. Ctrl+K (Open command search palette)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // 2. Escape (Close modal overlays)
      if (e.key === 'Escape') {
        // Handled individually by modals, but safe fallback
        return;
      }

      // 3. Shortcuts Modal toggler (Keyboard '?')
      if (e.key === '?' && !isTyping) {
        e.preventDefault();
        setShortcutsModalOpen(!shortcutsModalOpen);
        return;
      }

      // 4. Ctrl+D (Clear workspace input)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        clearToolInput(activeTool);
        return;
      }

      // 5. Ctrl+Shift+S (Swap inputs outputs)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        swapToolInputOutput(activeTool);
        return;
      }

      // 6. Ctrl+Shift+C (Copy active outputs)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (toolData?.output) {
          navigator.clipboard.writeText(toolData.output);
        }
        return;
      }

      // 7. Index numbers 1-9 to navigate tools
      if (!isTyping && /^[1-9]$/.test(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (toolIndexMap[index]) {
          e.preventDefault();
          setActiveTool(toolIndexMap[index]);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [
    activeTool, 
    toolData, 
    clearToolInput, 
    swapToolInputOutput, 
    setCommandPaletteOpen, 
    setShortcutsModalOpen, 
    shortcutsModalOpen,
    setActiveTool
  ]);

  // Dynamic tool renderer router mapping
  const renderActiveTool = () => {
    switch (activeTool) {
      case 'case-converter':
        return <CaseConverter />;
      case 'text-cleaner':
        return <TextCleaner />;
      case 'text-stats':
        return <TextStats />;
      case 'json-formatter':
        return <JSONFormatter />;
      case 'diff-viewer':
        return <DiffViewer />;
      case 'regex-tester':
        return <RegexTester />;
      case 'base64':
        return <Base64Tool />;
      case 'url-encoder':
        return <URLEncoder />;
      case 'hash-generator':
        return <HashGenerator />;
      default:
        return <CaseConverter />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-bg-base text-text-base select-text">
      {/* 1. Top navigation control header */}
      <TopBar />

      {/* Main content split */}
      <div className="flex-1 flex w-full h-[calc(100vh-48px)] mt-12 relative overflow-hidden">
        {/* 2. Side floating sidebar */}
        <Sidebar />

        {/* 3. Fluid primary tool area content */}
        <main className="ml-14 flex-1 flex flex-col relative overflow-hidden bg-bg-base">
          {renderActiveTool()}
        </main>
      </div>

      {/* 4. Overlay mod overlays */}
      <ShortcutsModal />
      <HistoryDrawer />
      <CommandPalette />
    </div>
  );
}
