import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { CopyButton } from '../ui/CopyButton';
import { Badge } from '../ui/Badge';
import { ExportButton } from '../ui/ExportButton';

export default function HashGenerator() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['hash-generator']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  let hashes = { md5: '', sha1: '', sha256: '', sha512: '' };
  
  if (toolData?.output && !toolData.output.startsWith('Remote Error')) {
    try {
      hashes = JSON.parse(toolData.output);
    } catch {
      // safe fallback
    }
  }

  const hashList = [
    { label: 'MD5', value: hashes.md5 },
    { label: 'SHA-1', value: hashes.sha1 },
    { label: 'SHA-256', value: hashes.sha256 },
    { label: 'SHA-512', value: hashes.sha512 },
  ];

  return (
    <WorkspaceLayout showSwap={false}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Input</span>
          <button 
            onClick={() => clearToolInput('hash-generator')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('hash-generator', e.target.value)}
            placeholder="Type or paste plain text to generate digests..."
          />
        </div>
      </div>

      {/* Right Output Pane: Custom List */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">Digests List</span>
          <div className="flex items-center gap-2">
            <ExportButton text={toolData?.output || ''} toolId="hash-generator" />
            <span className="text-[9px] font-mono text-text-faint select-none">Generated Simultaneously</span>
          </div>
        </div>
        
        <div className="flex-1 p-4 bg-surface-container-low/20 overflow-y-auto flex flex-col gap-4 select-text">
          {hashList.map((hash) => (
            <div key={hash.label} className="flex flex-col gap-1.5 bg-surface-container-low/40 border border-outline-variant/20 p-3 rounded">
              <div className="flex items-center justify-between">
                <Badge variant="primary">{hash.label}</Badge>
                {hash.value && <CopyButton text={hash.value} />}
              </div>
              <div className="font-mono text-[12px] break-all leading-relaxed text-primary/95 min-h-[20px]">
                {hash.value || <span className="text-text-faint italic">Awaiting input...</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
