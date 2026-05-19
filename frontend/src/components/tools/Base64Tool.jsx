import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';

export default function Base64Tool() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['base64']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const setToolOption = useToolStore((state) => state.setToolOption);
  const toggleToolOption = useToolStore((state) => state.toggleToolOption);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const mode = toolData?.options?.mode || 'encode';
  const urlSafe = !!toolData?.options?.urlSafe;

  const actionChips = [
    <ActionButton
      key="encode"
      active={mode === 'encode'}
      onClick={() => setToolOption('base64', 'mode', 'encode')}
    >
      Encode
    </ActionButton>,
    <ActionButton
      key="decode"
      active={mode === 'decode'}
      onClick={() => setToolOption('base64', 'mode', 'decode')}
    >
      Decode
    </ActionButton>,
    <ActionButton
      key="url-safe"
      active={urlSafe}
      onClick={() => toggleToolOption('base64', 'urlSafe')}
    >
      URL-Safe
    </ActionButton>,
  ];

  return (
    <WorkspaceLayout actionChips={actionChips} showSwap={true}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Input</span>
          <button 
            onClick={() => clearToolInput('base64')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('base64', e.target.value)}
            placeholder={mode === 'encode' ? 'Type or paste plain text to encode...' : 'SGVsbG8gd29ybGQ='}
          />
        </div>
      </div>

      {/* Right Output Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Output</span>
          <CopyButton text={toolData?.output || ''} />
        </div>
        <div className="flex-1 overflow-hidden">
          <TextArea
            value={toolData?.output || ''}
            readOnly={true}
            isOutput={true}
            placeholder="Base64 result will render here"
          />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
