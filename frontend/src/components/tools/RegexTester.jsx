import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';
import { ExportButton } from '../ui/ExportButton';

export default function RegexTester() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['regex-tester']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const updateToolPattern = useToolStore((state) => state.updateToolPattern);
  const updateToolReplacePattern = useToolStore((state) => state.updateToolReplacePattern);
  const toggleToolFlag = useToolStore((state) => state.toggleToolFlag);
  const setToolOption = useToolStore((state) => state.setToolOption);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const mode = toolData?.options?.mode || 'test';
  const pattern = toolData?.pattern || '';
  const replacePattern = toolData?.replacePattern || '';
  const flags = toolData?.flags || { g: true, i: true, m: false };

  const backendOnline = useToolStore((state) => state.backendOnline);

  const actionChips = [
    <ActionButton
      key="mode-test"
      active={mode === 'test'}
      onClick={() => setToolOption('regex-tester', 'mode', 'test')}
    >
      Test Mode
    </ActionButton>,
    <ActionButton
      key="mode-replace"
      active={mode === 'replace'}
      onClick={() => setToolOption('regex-tester', 'mode', 'replace')}
    >
      Replace Mode
    </ActionButton>,
    <div key="divider" className="w-[1px] h-4 bg-outline-variant/40 mx-1 shrink-0" />,
    <ActionButton
      key="flag-g"
      active={flags.g}
      onClick={() => toggleToolFlag('regex-tester', 'g')}
    >
      g
    </ActionButton>,
    <ActionButton
      key="flag-i"
      active={flags.i}
      onClick={() => toggleToolFlag('regex-tester', 'i')}
    >
      i
    </ActionButton>,
    <ActionButton
      key="flag-m"
      active={flags.m}
      onClick={() => toggleToolFlag('regex-tester', 'm')}
    >
      m
    </ActionButton>,
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden select-text">
      {/* Pattern Input Header Bar */}
      <div className="bg-surface-container-low border-b border-outline-variant/60 p-4 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-widest text-text-muted uppercase font-mono select-none">
            Pattern:
          </span>
          <div className="flex-1 flex items-center bg-surface-container border border-outline-variant/40 rounded px-3 py-1 font-mono text-[13px]">
            <span className="text-text-faint font-bold select-none">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => updateToolPattern('regex-tester', e.target.value)}
              placeholder="[a-zA-Z]+"
              className="flex-1 bg-transparent border-none outline-none text-primary px-2 font-mono text-[13px]"
            />
            <span className="text-text-faint font-bold select-none">/</span>
            <span className="text-success-green ml-2 font-bold select-none">
              {Object.keys(flags).filter(f => flags[f]).join('')}
            </span>
          </div>
        </div>

        {mode === 'replace' && (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="text-[11px] font-bold tracking-widest text-text-muted uppercase font-mono select-none">
              Replace:
            </span>
            <div className="flex-1 flex items-center bg-surface-container border border-outline-variant/40 rounded px-3 py-1 font-mono text-[13px]">
              <input
                type="text"
                value={replacePattern}
                onChange={(e) => updateToolReplacePattern('regex-tester', e.target.value)}
                placeholder="Substitution text (e.g. $1)"
                className="flex-1 bg-transparent border-none outline-none text-text-base px-2 font-mono text-[13px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace Layout */}
      <WorkspaceLayout actionChips={actionChips} showSwap={false}>
        {/* Left Input Pane */}
        <div className="flex-1 flex flex-col h-full bg-surface">
          <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
            <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Test Text</span>
            <button 
              onClick={() => clearToolInput('regex-tester')}
              className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
            {!backendOnline && (
              <div className="bg-error-red/10 border-b border-error-red/20 text-error-red text-[11px] font-medium px-4 py-2 flex items-center gap-2 select-none shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-error-red animate-pulse" />
                <span>FastAPI Backend Offline: Regex testing operations are currently unavailable.</span>
              </div>
            )}
            <TextArea
              value={toolData?.input || ''}
              onChange={(e) => updateToolInput('regex-tester', e.target.value)}
              placeholder="Paste test strings here to match against your pattern..."
            />
          </div>
        </div>

        {/* Right Output Pane */}
        <div className="flex-1 flex flex-col h-full bg-surface">
          <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
            <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
              {mode === 'test' ? 'Matches Breakdown' : 'Replaced Output'}
            </span>
            <div className="flex items-center gap-1.5">
              <ExportButton text={toolData?.output || ''} toolId="regex-tester" />
              <CopyButton text={toolData?.output || ''} />
            </div>
          </div>
          <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
            <TextArea
              value={toolData?.output || ''}
              readOnly={true}
              isOutput={true}
              placeholder={mode === 'test' ? 'Match descriptions will list here' : 'Substitution result will appear here'}
            />
          </div>
        </div>
      </WorkspaceLayout>
    </div>
  );
}
