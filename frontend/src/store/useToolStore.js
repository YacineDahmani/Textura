import { create } from 'zustand';

const initialToolsState = {
  'case-converter': {
    input: '',
    output: '',
    options: { activeCase: '' },
    history: [],
  },
  'text-cleaner': {
    input: '',
    output: '',
    options: {
      trim: true,
      removeBlankLines: false,
      deduplicateLines: false,
      collapseSpaces: false,
      stripHtml: false,
      normalizeUnicode: false,
      removeArabicDiacritics: false,
      removeArabicTatweel: false,
      removeAccents: false,
      simplifiedToTraditional: false,
      traditionalToSimplified: false,
    },
    history: [],
  },
  'text-stats': {
    input: '',
    output: '',
    options: {},
    history: [],
  },
  'json-formatter': {
    input: '',
    output: '',
    options: {
      formatType: 'pretty-2', // 'pretty-2', 'pretty-4', 'minify'
      sortKeys: false,
    },
    history: [],
  },
  'diff-viewer': {
    input: '', // Represents Text A
    inputB: '', // Represents Text B
    output: '',
    options: {
      diffType: 'line', // 'line', 'word', 'char'
    },
    history: [],
  },
  'regex-tester': {
    input: '', // Represents test text
    pattern: '',
    replacePattern: '',
    flags: { g: true, i: true, m: false },
    output: '',
    options: {
      mode: 'test', // 'test', 'replace'
    },
    history: [],
  },
  'base64': {
    input: '',
    output: '',
    options: {
      mode: 'encode', // 'encode', 'decode'
      urlSafe: false,
    },
    history: [],
  },
  'url-encoder': {
    input: '',
    output: '',
    options: {
      mode: 'encode', // 'encode', 'decode'
      fullUrl: false,
    },
    history: [],
  },
  'hash-generator': {
    input: '',
    output: '', // JSON-encoded string or object of hashes
    options: {},
    history: [],
  },
  'minifier': {
    input: '',
    output: '',
    options: {
      mode: 'html', // 'html', 'css', 'js'
      stripComments: true,
      collapseWhitespace: true,
      minifyEmbedded: true,
      removeLastSemicolon: false,
      collapseSpaces: true,
    },
    history: [],
  },
  'markdown-tool': {
    input: '# Welcome to Textura Markdown\n\nTextura is a **premium** text workbench. Here is a quick demonstration of Markdown rendering:\n\n### Core Features\n1. Dynamic live HTML preview\n2. Clean, syntax-aware code blocks\n3. Consistent typographic visual styling\n\nHere is a simple table:\n\n| Tool Family | Purpose | Status |\n| :--- | :--- | :--- |\n| **Text** | Case, Cleaning | Live |\n| **Format** | XML, JSON, YAML | Live |\n| **Encode** | Base64, Hashes | Live |\n\nEnjoy using the **best** text workbench!\n\n```javascript\nconst hello = "Welcome to Textura!";\nconsole.log(hello);\n```',
    output: '',
    options: {
      mode: 'preview', // 'preview' | 'html'
      cleanHeaders: true,
      normalizeSpacing: true,
    },
    history: [],
  },
  'xml-yaml-formatter': {
    input: '<note>\n  <to>Tove</to>\n  <from>Jani</from>\n  <heading>Reminder</heading>\n  <body>Don\'t forget me this weekend!</body>\n</note>',
    output: '',
    options: {
      mode: 'xml', // 'xml' | 'yaml'
      formatType: 'pretty-2', // 'pretty-2' | 'pretty-4' | 'minify'
    },
    history: [],
  },
  'password-generator': {
    input: '',
    output: '',
    options: {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      quantity: 1,
    },
    history: [],
  },
};

export const useToolStore = create((set, get) => ({
  activeTool: 'case-converter',
  backendOnline: true,
  setBackendOnline: (online) => set({ backendOnline: online }),
  sidebarExpanded: false,
  mobileSidebarOpen: false,
  shortcutsModalOpen: false,
  commandPaletteOpen: false,
  historyDrawerOpen: false,
  theme: localStorage.getItem('textura-theme') || 'dark',
  tools: initialToolsState,

  setActiveTool: (toolId) => set({ activeTool: toolId }),

  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  toggleSidebarExpanded: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebarOpen: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setHistoryDrawerOpen: (open) => set({ historyDrawerOpen: open }),

  setTheme: (theme) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('textura-theme', theme);
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(nextTheme);
    localStorage.setItem('textura-theme', nextTheme);
    set({ theme: nextTheme });
  },

  updateToolInput: (toolId, value) => set((state) => ({
    tools: {
      ...state.tools,
      [toolId]: {
        ...state.tools[toolId],
        input: value,
      },
    },
  })),

  updateToolInputB: (toolId, value) => set((state) => ({
    tools: {
      ...state.tools,
      [toolId]: {
        ...state.tools[toolId],
        inputB: value,
      },
    },
  })),

  updateToolPattern: (toolId, value) => set((state) => ({
    tools: {
      ...state.tools,
      [toolId]: {
        ...state.tools[toolId],
        pattern: value,
      },
    },
  })),

  updateToolReplacePattern: (toolId, value) => set((state) => ({
    tools: {
      ...state.tools,
      [toolId]: {
        ...state.tools[toolId],
        replacePattern: value,
      },
    },
  })),

  toggleToolFlag: (toolId, flag) => set((state) => ({
    tools: {
      ...state.tools,
      [toolId]: {
        ...state.tools[toolId],
        flags: {
          ...state.tools[toolId].flags,
          [flag]: !state.tools[toolId].flags[flag],
        },
      },
    },
  })),

  updateToolOutput: (toolId, value) => set((state) => {
    if (state.tools[toolId]?.output === value) return {};
    return {
      tools: {
        ...state.tools,
        [toolId]: {
          ...state.tools[toolId],
          output: value,
        },
      },
    };
  }),

  setToolOption: (toolId, optionKey, optionValue) => set((state) => ({
    tools: {
      ...state.tools,
      [toolId]: {
        ...state.tools[toolId],
        options: {
          ...state.tools[toolId].options,
          [optionKey]: optionValue,
        },
      },
    },
  })),

  toggleToolOption: (toolId, optionKey) => set((state) => ({
    tools: {
      ...state.tools,
      [toolId]: {
        ...state.tools[toolId],
        options: {
          ...state.tools[toolId].options,
          [optionKey]: !state.tools[toolId].options[optionKey],
        },
      },
    },
  })),

  clearToolInput: (toolId) => set((state) => {
    const defaultState = initialToolsState[toolId];
    return {
      tools: {
        ...state.tools,
        [toolId]: {
          ...state.tools[toolId],
          input: '',
          inputB: defaultState.inputB !== undefined ? '' : undefined,
          pattern: defaultState.pattern !== undefined ? '' : undefined,
          replacePattern: defaultState.replacePattern !== undefined ? '' : undefined,
          output: '',
        },
      },
    };
  }),

  swapToolInputOutput: (toolId) => set((state) => {
    const current = state.tools[toolId];
    if (current.output === undefined || current.output === null) return {};
    return {
      tools: {
        ...state.tools,
        [toolId]: {
          ...current,
          input: String(current.output),
          output: String(current.input || ''),
        },
      },
    };
  }),

  addHistoryEntry: (toolId, text) => set((state) => {
    if (!text || text.trim() === '') return {};
    const history = state.tools[toolId].history || [];
    // Avoid adjacent duplicates
    if (history[0] === text) return {};
    const newHistory = [text, ...history.filter(t => t !== text)].slice(0, 10);
    return {
      tools: {
        ...state.tools,
        [toolId]: {
          ...state.tools[toolId],
          history: newHistory,
        },
      },
    };
  }),
}));
