import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';

export default function JSONFormatter() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['json-formatter']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const setToolOption = useToolStore((state) => state.setToolOption);
  const toggleToolOption = useToolStore((state) => state.toggleToolOption);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const formatType = toolData?.options?.formatType || 'pretty-2';
  const sortKeys = !!toolData?.options?.sortKeys;

  // Extract line errors from error strings
  let validationError = null;
  const outputText = toolData?.output || '';
  if (outputText.startsWith('Error: ')) {
    const errorMsg = outputText.replace('Error: ', '');
    let line = null;
    
    // Parse position or line indicator from JSON parser error message
    const posMatch = errorMsg.match(/position (\d+)/i);
    const lineMatch = errorMsg.match(/at line (\d+)/i);
    
    if (lineMatch) {
      line = parseInt(lineMatch[1], 10);
    } else if (posMatch && toolData?.input) {
      const pos = parseInt(posMatch[1], 10);
      line = (toolData.input.substring(0, pos).match(/\n/g) || []).length + 1;
    }
    validationError = { message: errorMsg, line };
  }

  const actionChips = [
    <ActionButton
      key="pretty-2"
      active={formatType === 'pretty-2'}
      onClick={() => setToolOption('json-formatter', 'formatType', 'pretty-2')}
    >
      Pretty (2)
    </ActionButton>,
    <ActionButton
      key="pretty-4"
      active={formatType === 'pretty-4'}
      onClick={() => setToolOption('json-formatter', 'formatType', 'pretty-4')}
    >
      Pretty (4)
    </ActionButton>,
    <ActionButton
      key="minify"
      active={formatType === 'minify'}
      onClick={() => setToolOption('json-formatter', 'formatType', 'minify')}
    >
      Minify
    </ActionButton>,
    <ActionButton
      key="sort-keys"
      active={sortKeys}
      onClick={() => toggleToolOption('json-formatter', 'sortKeys')}
    >
      Sort Keys
    </ActionButton>,
  ];

  return (
    <WorkspaceLayout actionChips={actionChips} showSwap={true}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Input</span>
          <button 
            onClick={() => clearToolInput('json-formatter')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('json-formatter', e.target.value)}
            placeholder='{"paste": "your raw JSON here"}'
            error={validationError}
            allowedExtensions={['.json']}
          />
        </div>
      </div>

      {/* Right Output Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Output</span>
          <CopyButton text={validationError ? '' : toolData?.output || ''} />
        </div>
        <div className="flex-1 overflow-hidden">
          <TextArea
            value={validationError ? '' : toolData?.output || ''}
            readOnly={true}
            isOutput={true}
            placeholder="Formatted JSON will render here"
          />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
