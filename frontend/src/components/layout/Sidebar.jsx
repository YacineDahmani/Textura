import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { 
  Type, Eraser, BarChart2, 
  Braces, GitCompare, Code, 
  KeyRound, Link, Fingerprint,
  Minimize2
} from 'lucide-react';

const toolGroups = [
  {
    title: 'Text',
    tools: [
      { id: 'case-converter', name: 'Case Converter', icon: Type },
      { id: 'text-cleaner', name: 'Text Cleaner', icon: Eraser },
      { id: 'text-stats', name: 'Text Stats', icon: BarChart2 },
    ],
  },
  {
    title: 'Format',
    tools: [
      { id: 'json-formatter', name: 'JSON Formatter', icon: Braces },
      { id: 'diff-viewer', name: 'Diff Viewer', icon: GitCompare },
      { id: 'regex-tester', name: 'Regex Tester', icon: Code },
      { id: 'minifier', name: 'Code Minifier', icon: Minimize2 },
    ],
  },
  {
    title: 'Encode',
    tools: [
      { id: 'base64', name: 'Base64 Tool', icon: KeyRound },
      { id: 'url-encoder', name: 'URL Encoder', icon: Link },
      { id: 'hash-generator', name: 'Hash Generator', icon: Fingerprint },
    ],
  },
];

export function Sidebar() {
  const activeTool = useToolStore((state) => state.activeTool);
  const setActiveTool = useToolStore((state) => state.setActiveTool);
  const sidebarExpanded = useToolStore((state) => state.sidebarExpanded);
  const setSidebarExpanded = useToolStore((state) => state.setSidebarExpanded);

  return (
    <aside
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
      className={`h-[calc(100vh-48px)] fixed left-0 top-12 bg-surface-container-low border-r border-outline-variant/60 flex flex-col py-4 z-40 transition-all duration-200 ease-in-out select-none overflow-x-hidden ${
        sidebarExpanded 
          ? 'w-[220px] shadow-[8px_0_24px_rgba(0,0,0,0.3)]' 
          : 'w-14'
      }`}
    >
      <div className="flex flex-col gap-6 w-full h-full overflow-y-auto scrollbar-hide">
        {toolGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1 w-full px-2">
            {/* Group Label */}
            {sidebarExpanded ? (
              <span className="px-3 py-1.5 text-[9px] font-bold tracking-widest text-text-faint uppercase font-mono">
                {group.title}
              </span>
            ) : (
              <div className="h-4 border-b border-outline-variant/35 mx-2 my-1" />
            )}

            {/* Group Tools */}
            {group.tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;

              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  title={!sidebarExpanded ? tool.name : undefined}
                  className={`w-full h-9 rounded flex items-center gap-3 px-3 transition-colors outline-none cursor-pointer relative ${
                    isActive
                      ? 'text-primary bg-primary/5 border-l-2 border-primary'
                      : 'text-text-muted hover:text-text-base hover:bg-surface-container-high'
                  }`}
                >
                  <Icon 
                    size={16} 
                    className={`shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`} 
                  />
                  {sidebarExpanded && (
                    <span className="text-[12px] font-medium leading-none whitespace-nowrap animate-fade-in">
                      {tool.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
