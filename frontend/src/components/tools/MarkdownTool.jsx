import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';
import { ExportButton } from '../ui/ExportButton';

export default function MarkdownTool() {
  // Orchestrate transformations
  useTransform();

  const toolData = useToolStore((state) => state.tools['markdown-tool']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const setToolOption = useToolStore((state) => state.setToolOption);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const mode = toolData?.options?.mode || 'preview';

  const actionChips = [
    <ActionButton
      key="preview"
      active={mode === 'preview'}
      onClick={() => setToolOption('markdown-tool', 'mode', 'preview')}
    >
      Live Preview
    </ActionButton>,
    <ActionButton
      key="html"
      active={mode === 'html'}
      onClick={() => setToolOption('markdown-tool', 'mode', 'html')}
    >
      Raw HTML
    </ActionButton>,
  ];

  return (
    <WorkspaceLayout actionChips={actionChips} showSwap={false}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">Markdown Input</span>
          <button 
            onClick={() => clearToolInput('markdown-tool')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('markdown-tool', e.target.value)}
            placeholder="# Paste your markdown here"
            allowedExtensions={['.md', '.markdown', '.txt']}
          />
        </div>
      </div>

      {/* Right Output Pane */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-surface border-l border-outline-variant/20">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">
            {mode === 'preview' ? 'Live HTML Preview' : 'Raw HTML Output'}
          </span>
          <div className="flex items-center gap-1.5">
            <ExportButton text={toolData?.output || ''} toolId="markdown-tool" />
            <CopyButton text={toolData?.output || ''} />
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {mode === 'preview' ? (
            <div className="relative flex-1 min-h-0 min-w-0 overflow-hidden bg-surface-container-lowest text-text-base">
              <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-6 select-text">
                <div
                  className="markdown-preview prose prose-invert max-w-none text-sm leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: toolData?.output || '' }}
                />
              </div>
            </div>
          ) : (
            <TextArea
              value={toolData?.output || ''}
              readOnly={true}
              isOutput={true}
              placeholder="HTML output will render here"
            />
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
