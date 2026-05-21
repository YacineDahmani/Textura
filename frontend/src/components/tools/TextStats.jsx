import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { CopyButton } from '../ui/CopyButton';
import { ExportButton } from '../ui/ExportButton';
import { useLanguageProfile } from '../../hooks/useLanguageProfile';

export default function TextStats() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['text-stats']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);

  const {
    selectedLang,
    inputDirectionMode,
    setInputDirectionMode,
    handleLanguageChange,
    handleClear,
  } = useLanguageProfile('text-stats');

  return (
    <WorkspaceLayout showSwap={false}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Input</span>
          <div className="flex items-center gap-3">
            {/* Prominent Input Language Profile Selector */}
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[9px] font-bold text-text-muted uppercase">Language Profile:</span>
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-surface-container-high text-text-base border border-outline-variant/30 rounded px-1.5 py-0.5 text-[10px] font-bold outline-none cursor-pointer hover:border-primary transition-colors uppercase tracking-wider select-none"
              >
                <option value="general">🇬🇧 General</option>
                <option value="arabic">🇸🇦 Arabic</option>
                <option value="chinese">🇨🇳 Chinese</option>
                <option value="latin">🇪🇺 Accented</option>
              </select>
            </div>
            
            <span className="text-outline-variant/30">|</span>
            
            <button 
              onClick={handleClear}
              className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('text-stats', e.target.value)}
            placeholder="Paste text here to run detailed statistics..."
            directionMode={inputDirectionMode}
            onDirectionModeChange={setInputDirectionMode}
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
        <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
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
