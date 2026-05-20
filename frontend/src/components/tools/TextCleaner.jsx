import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';
import { ExportButton } from '../ui/ExportButton';

const cleanOptions = [
  { id: 'trim', label: 'Trim Spaces' },
  { id: 'collapseSpaces', label: 'Collapse Spaces' },
  { id: 'removeBlankLines', label: 'Remove Blank Lines' },
  { id: 'deduplicateLines', label: 'Deduplicate Lines' },
  { id: 'stripHtml', label: 'Strip HTML' },
  { id: 'normalizeUnicode', label: 'Normalize Unicode' },
];

export default function TextCleaner() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['text-cleaner']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const toggleToolOption = useToolStore((state) => state.toggleToolOption);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const options = toolData?.options || {};

  const actionChips = cleanOptions.map((opt) => (
    <ActionButton
      key={opt.id}
      active={!!options[opt.id]}
      onClick={() => toggleToolOption('text-cleaner', opt.id)}
    >
      {opt.label}
    </ActionButton>
  ));

  return (
    <WorkspaceLayout actionChips={actionChips} showSwap={true}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Input</span>
          <button 
            onClick={() => clearToolInput('text-cleaner')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('text-cleaner', e.target.value)}
            placeholder="Paste raw, messy text here..."
          />
        </div>
      </div>

      {/* Right Output Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Output</span>
          <div className="flex items-center gap-1.5">
            <ExportButton text={toolData?.output || ''} toolId="text-cleaner" />
            <CopyButton text={toolData?.output || ''} />
          </div>
        </div>
        <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
          <TextArea
            value={toolData?.output || ''}
            readOnly={true}
            isOutput={true}
            placeholder="Cleaned result will appear here"
          />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
