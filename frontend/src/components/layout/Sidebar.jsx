import React from 'react';
import { useToolStore } from '../../store/useToolStore';
import { 
  Type, Eraser, BarChart2, 
  Braces, GitCompare, Code, 
  KeyRound, Link, Fingerprint,
  Minimize2, FileText, Database, Lock
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
      { id: 'markdown-tool', name: 'Markdown Preview', icon: FileText },
      { id: 'xml-yaml-formatter', name: 'XML/YAML Format', icon: Database },
    ],
  },
  {
    title: 'Encode',
    tools: [
      { id: 'base64', name: 'Base64 Tool', icon: KeyRound },
      { id: 'url-encoder', name: 'URL Encoder', icon: Link },
      { id: 'hash-generator', name: 'Hash Generator', icon: Fingerprint },
      { id: 'password-generator', name: 'Password Gen', icon: Lock },
    ],
  },
];

export function Sidebar() {
  const activeTool = useToolStore((state) => state.activeTool);
  const setActiveTool = useToolStore((state) => state.setActiveTool);
  const sidebarExpanded = useToolStore((state) => state.sidebarExpanded);
  const setSidebarExpanded = useToolStore((state) => state.setSidebarExpanded);
  const mobileSidebarOpen = useToolStore((state) => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useToolStore((state) => state.setMobileSidebarOpen);

  const showLabels = sidebarExpanded || mobileSidebarOpen;

  return (
    <>
      <div
        className={`fixed inset-0 top-12 z-30 bg-black/50 transition-opacity duration-200 md:hidden ${
          mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`fixed left-0 top-12 z-40 flex h-[calc(100dvh-48px)] flex-col overflow-x-hidden select-none border-r border-outline-variant/60 bg-surface-container-low py-4 transition-all duration-200 ease-in-out md:translate-x-0 ${
          mobileSidebarOpen
            ? 'w-[min(19rem,85vw)] translate-x-0 shadow-[8px_0_24px_rgba(0,0,0,0.3)]'
            : '-translate-x-full w-[min(19rem,85vw)]'
        } ${sidebarExpanded ? 'md:w-[220px] md:shadow-[8px_0_24px_rgba(0,0,0,0.3)]' : 'md:w-14'}`}
      >
        <div className="flex items-center justify-between px-4 pb-3 md:hidden">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase font-sans">Tools</span>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded p-1.5 text-text-muted outline-none transition-colors hover:bg-surface-container-high hover:text-primary cursor-pointer"
            aria-label="Close tools menu"
          >
            <span className="block h-0.5 w-3.5 translate-y-[3px] rotate-45 rounded bg-current" />
            <span className="block h-0.5 w-3.5 -translate-y-[1px] -rotate-45 rounded bg-current" />
          </button>
        </div>
        <div className="flex h-full w-full flex-col gap-4 overflow-y-auto scrollbar-hide">
          {toolGroups.map((group, groupIdx) => (
            <React.Fragment key={groupIdx}>
              {groupIdx > 0 && (
                <div className="mx-3 my-1 border-t border-outline-variant/30" />
              )}
              <div className="flex w-full flex-col gap-1 px-2">
                {/* Group Label */}
                {showLabels && (
                  <span className="px-3 py-1 text-[9px] font-bold tracking-widest text-text-faint uppercase font-mono">
                    {group.title}
                  </span>
                )}

                {/* Group Tools */}
                {group.tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;

                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveTool(tool.id);
                        setMobileSidebarOpen(false);
                      }}
                      title={!showLabels ? tool.name : undefined}
                      className={`relative flex h-9 w-full items-center gap-3 rounded px-3 transition-colors outline-none cursor-pointer ${
                        isActive
                          ? 'border-l-2 border-primary bg-primary/5 text-primary'
                          : 'text-text-muted hover:bg-surface-container-high hover:text-text-base'
                      }`}
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}
                      />
                      {showLabels && (
                        <span className="text-[12px] font-medium leading-none whitespace-nowrap animate-fade-in">
                          {tool.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </aside>
    </>
  );
}
