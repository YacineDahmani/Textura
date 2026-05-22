import React, { useMemo } from 'react';
import { useToolStore } from '../../store/useToolStore';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { ActionButton } from '../ui/ActionButton';
import * as Diff from 'diff';

export default function DiffViewer() {
  const toolData = useToolStore((state) => state.tools['diff-viewer']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const updateToolInputB = useToolStore((state) => state.updateToolInputB);
  const setToolOption = useToolStore((state) => state.setToolOption);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const diffType = toolData?.options?.diffType || 'line';
  const textA = toolData?.input || '';
  const textB = toolData?.inputB || '';

  // Execute diff compilation using the npm package
  const { diffChanges, stats } = useMemo(() => {
    if (!textA && !textB) {
      return { diffChanges: [], stats: { added: 0, removed: 0 } };
    }

    let changes = [];
    if (diffType === 'word') {
      changes = Diff.diffWords(textA, textB);
    } else if (diffType === 'char') {
      changes = Diff.diffChars(textA, textB);
    } else {
      changes = Diff.diffLines(textA, textB);
    }

    let addedCount = 0;
    let removedCount = 0;

    changes.forEach((c) => {
      if (c.added) addedCount += c.count || 1;
      if (c.removed) removedCount += c.count || 1;
    });

    return {
      diffChanges: changes,
      stats: { added: addedCount, removed: removedCount },
    };
  }, [textA, textB, diffType]);

  const actionChips = [
    <ActionButton
      key="line"
      active={diffType === 'line'}
      onClick={() => setToolOption('diff-viewer', 'diffType', 'line')}
    >
      Line Diff
    </ActionButton>,
    <ActionButton
      key="word"
      active={diffType === 'word'}
      onClick={() => setToolOption('diff-viewer', 'diffType', 'word')}
    >
      Word Diff
    </ActionButton>,
    <ActionButton
      key="char"
      active={diffType === 'char'}
      onClick={() => setToolOption('diff-viewer', 'diffType', 'char')}
    >
      Char Diff
    </ActionButton>,
    <div key="divider" className="w-[1px] h-4 bg-outline-variant/40 mx-1 shrink-0" />,
    <span key="stats" className="text-[10px] font-mono text-text-muted select-none">
      +{stats.added} added · -{stats.removed} removed
    </span>,
  ];

  // Helper to clear both inputs
  const handleClear = () => {
    clearToolInput('diff-viewer');
    updateToolInputB('diff-viewer', '');
  };

  return (
    <WorkspaceLayout actionChips={actionChips} showSwap={false}>
      {/* Left Pane: Stacked input fields */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-surface border-r border-outline-variant/20">
        {/* Text A Header & Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
            <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Original Text (A)</span>
            <button 
              onClick={handleClear}
              className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
            >
              Clear Both
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <TextArea
              value={textA}
              onChange={(e) => updateToolInput('diff-viewer', e.target.value)}
              placeholder="Paste original version here..."
            />
          </div>
        </div>

        <div className="h-[1px] bg-outline-variant/30" />

        {/* Text B Header & Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 bg-surface-container-lowest/30 select-none">
            <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Modified Text (B)</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <TextArea
              value={textB}
              onChange={(e) => updateToolInputB('diff-viewer', e.target.value)}
              placeholder="Paste updated version here..."
            />
          </div>
        </div>
      </div>

      {/* Right Pane: Diff Output Visualizer */}
      <div className="flex-1 flex flex-col min-h-0 bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Comparison Gutter</span>
          <span className="text-[9px] font-mono text-text-faint">Visual Difference View</span>
        </div>
        
        <div className="flex-1 min-h-0 p-4 overflow-y-auto font-mono text-[13px] leading-6 bg-surface-container-low/20 select-text whitespace-pre-wrap">
          {diffChanges.length === 0 ? (
            <div className="text-text-faint italic text-center mt-8 select-none">
              Awaiting differences... Paste inputs in Text A and Text B.
            </div>
          ) : (
            diffChanges.map((chunk, index) => {
              let styleClass = 'text-text-muted opacity-70';

              if (chunk.added) {
                styleClass = 'bg-success-green/15 text-success-green border-l-2 border-success-green px-1';
              } else if (chunk.removed) {
                styleClass = 'bg-error-red/15 text-error-red border-l-2 border-error-red px-1 line-through opacity-80';
              }

              return (
                <span key={index} className={`inline ${styleClass}`}>
                  {chunk.value}
                </span>
              );
            })
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
