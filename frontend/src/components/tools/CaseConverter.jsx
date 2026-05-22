import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';
import { ExportButton } from '../ui/ExportButton';

const caseOptions = [
  { id: 'uppercase', label: 'UPPERCASE' },
  { id: 'lowercase', label: 'lowercase' },
  { id: 'title', label: 'Title Case' },
  { id: 'sentence', label: 'Sentence' },
  { id: 'camel', label: 'camelCase' },
  { id: 'snake', label: 'snake_case' },
  { id: 'kebab', label: 'kebab-case' },
  { id: 'pascal', label: 'PascalCase' },
];

import { useLanguageProfile } from '../../hooks/useLanguageProfile';

export default function CaseConverter() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['case-converter']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const setToolOption = useToolStore((state) => state.setToolOption);

  const {
    selectedLang,
    inputDirectionMode,
    setInputDirectionMode,
    handleLanguageChange,
    handleClear,
  } = useLanguageProfile('case-converter');

  const activeCase = toolData?.options?.activeCase || 'uppercase';

  const actionChips = React.useMemo(() => {
    if (selectedLang === 'arabic') {
      return (
        <span className="text-[11px] font-bold text-text-muted italic flex items-center gap-1.5 font-mono">
          🇸🇦 Note: Arabic is a unicase script (letter casing transformations do not apply).
        </span>
      );
    }
    if (selectedLang === 'chinese') {
      return (
        <span className="text-[11px] font-bold text-text-muted italic flex items-center gap-1.5 font-mono">
          🇨🇳 Note: Chinese characters are unicase (letter casing transformations do not apply).
        </span>
      );
    }
    return caseOptions.map((opt) => (
      <ActionButton
        key={opt.id}
        active={activeCase === opt.id}
        onClick={() => setToolOption('case-converter', 'activeCase', opt.id)}
      >
        {opt.label}
      </ActionButton>
    ));
  }, [selectedLang, activeCase, setToolOption]);

  return (
    <WorkspaceLayout actionChips={actionChips} showSwap={true}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-surface">
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
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('case-converter', e.target.value)}
            placeholder="Paste or type your text here..."
            directionMode={inputDirectionMode}
            onDirectionModeChange={setInputDirectionMode}
          />
        </div>
      </div>

      {/* Right Output Pane */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Output</span>
          <div className="flex items-center gap-1.5">
            <ExportButton text={toolData?.output || ''} toolId="case-converter" />
            <CopyButton text={toolData?.output || ''} />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <TextArea
            value={toolData?.output || ''}
            readOnly={true}
            isOutput={true}
            placeholder="Result will appear here"
          />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
