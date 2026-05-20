import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';
import { ExportButton } from '../ui/ExportButton';

export default function URLEncoder() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['url-encoder']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const setToolOption = useToolStore((state) => state.setToolOption);
  const toggleToolOption = useToolStore((state) => state.toggleToolOption);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const mode = toolData?.options?.mode || 'encode';
  const fullUrl = !!toolData?.options?.fullUrl;

  const actionChips = [
    <ActionButton
      key="encode"
      active={mode === 'encode'}
      onClick={() => setToolOption('url-encoder', 'mode', 'encode')}
    >
      Encode
    </ActionButton>,
    <ActionButton
      key="decode"
      active={mode === 'decode'}
      onClick={() => setToolOption('url-encoder', 'mode', 'decode')}
    >
      Decode
    </ActionButton>,
    <ActionButton
      key="full-url"
      active={fullUrl}
      onClick={() => toggleToolOption('url-encoder', 'fullUrl')}
    >
      Full URL
    </ActionButton>,
  ];

  return (
    <WorkspaceLayout actionChips={actionChips} showSwap={true}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Input</span>
          <button 
            onClick={() => clearToolInput('url-encoder')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('url-encoder', e.target.value)}
            placeholder="Paste text or URL component to encode/decode..."
          />
        </div>
      </div>

      {/* Right Output Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Output</span>
          <div className="flex items-center gap-1.5">
            <ExportButton text={toolData?.output || ''} toolId="url-encoder" />
            <CopyButton text={toolData?.output || ''} />
          </div>
        </div>
        <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
          <TextArea
            value={toolData?.output || ''}
            readOnly={true}
            isOutput={true}
            placeholder="URLEncoded output will render here"
          />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
