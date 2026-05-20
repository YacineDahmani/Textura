import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { CopyButton } from '../ui/CopyButton';
import { ExportButton } from '../ui/ExportButton';

export default function TextStats() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['text-stats']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  return (
    <WorkspaceLayout showSwap={false}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Input</span>
          <button 
            onClick={() => clearToolInput('text-stats')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('text-stats', e.target.value)}
            placeholder="Paste text here to run detailed statistics..."
          />
        </div>
      </div>

      {/* Right Output Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Diagnostics Report</span>
          <div className="flex items-center gap-1.5">
            <ExportButton text={toolData?.output || ''} toolId="text-stats" />
            <CopyButton text={toolData?.output || ''} />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <TextArea
            value={toolData?.output || ''}
            readOnly={true}
            isOutput={true}
            placeholder="Analysis report will render here"
          />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
