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
  { id: 'removeArabicDiacritics', label: 'Remove Tashkeel (Arabic)' },
  { id: 'removeArabicTatweel', label: 'Remove Tatweel (Arabic)' },
  { id: 'removeAccents', label: 'Remove Accents' },
  { id: 'simplifiedToTraditional', label: 'Simplified ➔ Traditional' },
  { id: 'traditionalToSimplified', label: 'Traditional ➔ Simplified' },
];

import { useLanguageProfile } from '../../hooks/useLanguageProfile';

const optionGroups = {
  all: ['trim', 'collapseSpaces', 'removeBlankLines', 'deduplicateLines', 'stripHtml', 'normalizeUnicode', 'removeArabicDiacritics', 'removeArabicTatweel', 'removeAccents', 'simplifiedToTraditional', 'traditionalToSimplified'],
  arabic: ['removeArabicDiacritics', 'removeArabicTatweel', 'trim', 'collapseSpaces', 'removeBlankLines', 'deduplicateLines', 'stripHtml'],
  chinese: ['simplifiedToTraditional', 'traditionalToSimplified', 'trim', 'collapseSpaces', 'removeBlankLines', 'deduplicateLines', 'stripHtml'],
  latin: ['removeAccents', 'trim', 'collapseSpaces', 'removeBlankLines', 'deduplicateLines', 'stripHtml'],
  general: ['trim', 'collapseSpaces', 'removeBlankLines', 'deduplicateLines', 'stripHtml', 'normalizeUnicode']
};

export default function TextCleaner() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['text-cleaner']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const toggleToolOption = useToolStore((state) => state.toggleToolOption);

  const {
    selectedLang,
    inputDirectionMode,
    setInputDirectionMode,
    handleLanguageChange,
    handleClear,
  } = useLanguageProfile('text-cleaner');

  const options = toolData?.options || {};
  const activeGroup = optionGroups[selectedLang] || optionGroups.general;
  const filteredOptions = cleanOptions.filter(opt => activeGroup.includes(opt.id));

  const actionChips = filteredOptions.map((opt) => (
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
            onChange={(e) => updateToolInput('text-cleaner', e.target.value)}
            placeholder="Paste raw, messy text here..."
            directionMode={inputDirectionMode}
            onDirectionModeChange={setInputDirectionMode}
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
