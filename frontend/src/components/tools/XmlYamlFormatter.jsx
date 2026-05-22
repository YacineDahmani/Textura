import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';
import { ExportButton } from '../ui/ExportButton';

export default function XmlYamlFormatter() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['xml-yaml-formatter']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const setToolOption = useToolStore((state) => state.setToolOption);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const mode = toolData?.options?.mode || 'xml';
  const formatType = toolData?.options?.formatType || 'pretty-2';

  // Extract validation errors
  let validationError = null;
  const outputText = toolData?.output || '';
  if (outputText.startsWith('Error: ')) {
    const errorMsg = outputText.replace('Error: ', '');
    let line = null;
    
    // Parse line info out of DOMParser error strings
    const lineMatch = errorMsg.match(/line\s+(\d+)/i) || errorMsg.match(/:(\d+):/);
    if (lineMatch) {
      line = parseInt(lineMatch[1], 10);
    }
    validationError = { message: errorMsg, line };
  }

  const actionChips = [
    <ActionButton
      key="mode-xml"
      active={mode === 'xml'}
      onClick={() => {
        setToolOption('xml-yaml-formatter', 'mode', 'xml');
        // Ensure formatType is valid for XML when switching
        if (formatType === 'minify' && mode === 'yaml') {
          setToolOption('xml-yaml-formatter', 'formatType', 'pretty-2');
        }
      }}
    >
      XML Mode
    </ActionButton>,
    <ActionButton
      key="mode-yaml"
      active={mode === 'yaml'}
      onClick={() => {
        setToolOption('xml-yaml-formatter', 'mode', 'yaml');
        // Disable minify option for YAML by resetting it to pretty-2
        if (formatType === 'minify') {
          setToolOption('xml-yaml-formatter', 'formatType', 'pretty-2');
        }
      }}
    >
      YAML Mode
    </ActionButton>,
    <span key="sep" className="w-[1px] h-4 bg-outline-variant/30 mx-1" />,
    <ActionButton
      key="pretty-2"
      active={formatType === 'pretty-2'}
      onClick={() => setToolOption('xml-yaml-formatter', 'formatType', 'pretty-2')}
    >
      Pretty (2 Spaces)
    </ActionButton>,
    <ActionButton
      key="pretty-4"
      active={formatType === 'pretty-4'}
      onClick={() => setToolOption('xml-yaml-formatter', 'formatType', 'pretty-4')}
    >
      Pretty (4 Spaces)
    </ActionButton>,
    mode === 'xml' && (
      <ActionButton
        key="minify"
        active={formatType === 'minify'}
        onClick={() => setToolOption('xml-yaml-formatter', 'formatType', 'minify')}
      >
        Minify XML
      </ActionButton>
    ),
  ].filter(Boolean);

  return (
    <WorkspaceLayout actionChips={actionChips} showSwap={true}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">
            {mode === 'xml' ? 'Raw XML Input' : 'Raw YAML Input'}
          </span>
          <button 
            onClick={() => clearToolInput('xml-yaml-formatter')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('xml-yaml-formatter', e.target.value)}
            placeholder={
              mode === 'xml' 
                ? '<root>\n  <element attr="val">Content</element>\n</root>'
                : 'root:\n  element:\n    attr: val\n    content: Content'
            }
            error={validationError}
            allowedExtensions={mode === 'xml' ? ['.xml', '.xsd', '.html'] : ['.yaml', '.yml', '.txt']}
          />
        </div>
      </div>

      {/* Right Output Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface border-l border-outline-variant/20">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">Formatted Output</span>
          <div className="flex items-center gap-1.5">
            <ExportButton text={validationError ? '' : toolData?.output || ''} toolId="xml-yaml-formatter" />
            <CopyButton text={validationError ? '' : toolData?.output || ''} />
          </div>
        </div>
        <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
          <TextArea
            value={validationError ? '' : toolData?.output || ''}
            readOnly={true}
            isOutput={true}
            placeholder={mode === 'xml' ? 'Formatted XML will render here' : 'Formatted YAML will render here'}
          />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
