import React, { useState, useEffect, useRef } from 'react';
import { useToolStore } from '../../store/useToolStore';
import { Search, CornerDownLeft, Terminal } from 'lucide-react';

const tools = [
  { id: 'case-converter', name: 'Case Converter', desc: 'UPPER, lower, camel, snake, kebab converter', group: 'Text' },
  { id: 'text-cleaner', name: 'Text Cleaner', desc: 'Trim spaces, strip html tags, clean text', group: 'Text' },
  { id: 'text-stats', name: 'Text Stats', desc: 'Characters, words, read times statistics', group: 'Text' },
  { id: 'json-formatter', name: 'JSON Formatter', desc: 'Pretty print, minify, validate JSON strings', group: 'Format' },
  { id: 'diff-viewer', name: 'Diff Viewer', desc: 'Compare and diff lines, words, chars of texts', group: 'Format' },
  { id: 'regex-tester', name: 'Regex Tester', desc: 'Test patterns, capture groups, replace matching', group: 'Format' },
  { id: 'base64', name: 'Base64 Tool', desc: 'Encode and decode Base64 strings safely', group: 'Encode' },
  { id: 'url-encoder', name: 'URL Encoder', desc: 'Encode and decode percent URLs', group: 'Encode' },
  { id: 'hash-generator', name: 'Hash Generator', desc: 'Generate SHA256, MD5, SHA512 digests', group: 'Encode' },
  { id: 'minifier', name: 'Code Minifier', desc: 'Minify HTML, CSS, and Javascript code blocks', group: 'Format' },
];

export function CommandPalette() {
  const isOpen = useToolStore((state) => state.commandPaletteOpen);
  const setOpen = useToolStore((state) => state.setCommandPaletteOpen);
  const setActiveTool = useToolStore((state) => state.setActiveTool);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter tools
  const filtered = tools.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.desc.toLowerCase().includes(query.toLowerCase()) ||
    t.group.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation inside list
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          setActiveTool(filtered[selectedIndex].id);
          setOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, setOpen, setActiveTool]);

  if (!isOpen) return null;

  const handleSelect = (toolId) => {
    setActiveTool(toolId);
    setOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 modal-backdrop select-none"
      onClick={() => setOpen(false)}
    >
      <div 
        className="w-[480px] bg-surface-container border border-outline-variant/60 rounded shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-3 py-3 gap-2.5 bg-surface-container-low border-b border-outline-variant/60">
          <Search size={16} className="text-text-faint shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tools or category groups..."
            className="flex-1 bg-transparent border-none outline-none text-[13px] font-sans text-text-base placeholder:text-text-faint"
          />
          <span className="text-[10px] font-mono text-text-faint select-none">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-0.5 bg-surface-container">
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-text-faint text-[12px] italic">
              No matching tools found.
            </div>
          ) : (
            filtered.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelect(tool.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-primary/5 text-primary border border-primary/20' 
                      : 'border border-transparent text-text-muted hover:text-text-base hover:bg-surface-container-high/40'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <Terminal size={12} className={isSelected ? 'text-primary' : 'text-text-faint'} />
                      <span className="text-[12px] font-semibold">{tool.name}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-surface-container-low rounded border border-outline-variant/20 uppercase tracking-widest text-text-faint">
                        {tool.group}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-faint leading-relaxed line-clamp-1">
                      {tool.desc}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-mono text-primary flex items-center gap-1 opacity-80 leading-none uppercase">
                      Select
                      <CornerDownLeft size={10} />
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Mini shortcut tip footer */}
        <div className="h-8 px-3 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between">
          <span className="text-[9px] font-mono text-text-faint">
            Use ↑ ↓ keys to navigate
          </span>
          <span className="text-[9px] font-mono text-text-faint">
            Press ↩ Enter to run
          </span>
        </div>
      </div>
    </div>
  );
}
