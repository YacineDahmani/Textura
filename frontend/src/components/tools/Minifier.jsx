import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { TextArea } from '../ui/TextArea';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';

export default function Minifier() {
  // Execute transformation orchestration hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['minifier']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const setToolOption = useToolStore((state) => state.setToolOption);
  const toggleToolOption = useToolStore((state) => state.toggleToolOption);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const mode = toolData?.options?.mode || 'html';
  const options = toolData?.options || {};

  // Build the bottom action bar based on current mode
  const actionChips = [];

  // 1. Mode Selectors (Always visible on left of action bar)
  actionChips.push(
    <div key="mode-group" className="flex items-center gap-1.5 border-r border-outline-variant/60 pr-3.5 mr-1.5">
      <ActionButton
        active={mode === 'html'}
        onClick={() => setToolOption('minifier', 'mode', 'html')}
      >
        HTML
      </ActionButton>
      <ActionButton
        active={mode === 'css'}
        onClick={() => setToolOption('minifier', 'mode', 'css')}
      >
        CSS
      </ActionButton>
      <ActionButton
        active={mode === 'js'}
        onClick={() => setToolOption('minifier', 'mode', 'js')}
      >
        JS
      </ActionButton>
    </div>
  );

  // 2. Mode-Specific Options
  if (mode === 'html') {
    actionChips.push(
      <ActionButton
        key="strip-comments"
        active={!!options.stripComments}
        onClick={() => toggleToolOption('minifier', 'stripComments')}
      >
        Strip Comments
      </ActionButton>,
      <ActionButton
        key="collapse-whitespace"
        active={!!options.collapseWhitespace}
        onClick={() => toggleToolOption('minifier', 'collapseWhitespace')}
      >
        Collapse Space
      </ActionButton>,
      <ActionButton
        key="minify-embedded"
        active={!!options.minifyEmbedded}
        onClick={() => toggleToolOption('minifier', 'minifyEmbedded')}
      >
        Minify Inline CSS/JS
      </ActionButton>
    );
  } else if (mode === 'css') {
    actionChips.push(
      <ActionButton
        key="strip-comments"
        active={!!options.stripComments}
        onClick={() => toggleToolOption('minifier', 'stripComments')}
      >
        Strip Comments
      </ActionButton>,
      <ActionButton
        key="remove-last-semicolon"
        active={!!options.removeLastSemicolon}
        onClick={() => toggleToolOption('minifier', 'removeLastSemicolon')}
      >
        Remove Last Semicolon
      </ActionButton>
    );
  } else if (mode === 'js') {
    actionChips.push(
      <ActionButton
        key="strip-comments"
        active={!!options.stripComments}
        onClick={() => toggleToolOption('minifier', 'stripComments')}
      >
        Strip Comments
      </ActionButton>,
      <ActionButton
        key="collapse-spaces"
        active={!!options.collapseSpaces}
        onClick={() => toggleToolOption('minifier', 'collapseSpaces')}
      >
        Collapse Spaces & Operators
      </ActionButton>
    );
  }

  // Input Placeholder based on current mode
  const getPlaceholder = () => {
    switch (mode) {
      case 'html':
        return `<!-- Paste raw HTML source here -->\n<!DOCTYPE html>\n<html>\n  <head>\n    <style>\n      body { color: #fff; }\n    </style>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n    <script>\n      console.log("embedded script");\n    </script>\n  </body>\n</html>`;
      case 'css':
        return `/* Paste raw CSS source here */\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 20px;\n  margin-bottom: 10px;\n}`;
      case 'js':
        return `// Paste raw Javascript source here\nfunction calculateSum(a, b) {\n  // adds two parameters together\n  const result = a + b;\n  console.log("sum of " + a + " and " + b + " is: " + result);\n  return result;\n}`;
      default:
        return 'Paste code here...';
    }
  };

  return (
    <WorkspaceLayout actionChips={actionChips} showSwap={true}>
      {/* Left Input Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
            Input ({mode.toUpperCase()})
          </span>
          <button
            onClick={() => clearToolInput('minifier')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <TextArea
            value={toolData?.input || ''}
            onChange={(e) => updateToolInput('minifier', e.target.value)}
            placeholder={getPlaceholder()}
            allowedExtensions={['.' + mode]}
          />
        </div>
      </div>

      {/* Right Output Pane */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
            Minified Output
          </span>
          <CopyButton text={toolData?.output || ''} />
        </div>
        <div className="flex-1 overflow-hidden">
          <TextArea
            value={toolData?.output || ''}
            readOnly={true}
            isOutput={true}
            placeholder="Minified output code will appear here"
          />
        </div>
      </div>
    </WorkspaceLayout>
  );
}
