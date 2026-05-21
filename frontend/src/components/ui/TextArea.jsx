import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Upload, Loader2, AlertCircle, X, ArrowLeftRight } from 'lucide-react';
import { api } from '../../lib/api';

const isRTL = (text) => {
  if (!text) return false;
  // Matches Arabic, Hebrew, Persian, Syriac, Thaana, and other RTL ranges
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return rtlRegex.test(text);
};


export function TextArea({
  value,
  onChange,
  placeholder,
  readOnly = false,
  isOutput = false,
  error = null,
  allowedExtensions = null, // e.g. ['.json'] or ['.js']
  directionMode: propDirectionMode,
  onDirectionModeChange,
}) {
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const fileInputRef = useRef(null);

  // File upload and processing states
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [localError, setLocalError] = useState(null);

  // Direction (RTL / LTR) management states
  const [localDirectionMode, setLocalDirectionMode] = useState('auto'); // 'auto' | 'ltr' | 'rtl'

  const directionMode = propDirectionMode !== undefined ? propDirectionMode : localDirectionMode;
  const setDirectionMode = onDirectionModeChange !== undefined ? onDirectionModeChange : setLocalDirectionMode;

  const computedDirection = useMemo(() => {
    if (directionMode === 'auto') {
      return isRTL(value) ? 'rtl' : 'ltr';
    }
    return directionMode;
  }, [value, directionMode]);

  // Compute padding to prevent overlapping with floating tools
  const paddingClasses = useMemo(() => {
    if (computedDirection === 'rtl') {
      // Gutter is on left (40px). Floating tool is also on left when RTL (~60px to ~160px).
      // We need pl-32 (128px) or pl-56 (224px) to clear them.
      // Right padding can be small/normal (pr-4 -> 16px).
      if (readOnly) {
        return 'pl-32 pr-4';
      } else {
        return 'pl-56 pr-4';
      }
    } else {
      // Floating tool is on right (~60px to ~160px).
      // Left padding is always pl-12 (48px) to clear the gutter.
      if (readOnly) {
        return 'pl-12 pr-24';
      } else {
        return 'pl-12 pr-48';
      }
    }
  }, [computedDirection, readOnly]);

  // Sync scroll between textarea and line number gutter
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineCount = useMemo(() => {
    if (!value) return 1;
    let count = 1;
    for (let i = 0; i < value.length; i += 1) {
      if (value.charCodeAt(i) === 10) count += 1;
    }
    return count;
  }, [value]);

  const lineNumbersText = useMemo(() => {
    const numbers = [];
    for (let i = 1; i <= lineCount; i += 1) {
      numbers.push(i);
    }
    return numbers.join('\n');
  }, [lineCount]);
  
  // Keep scroll aligned on value change (e.g. swap or copy)
  useEffect(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [value]);

  // Helper utility to get file extension
  const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
  };

  // Enforces a 1MB safety threshold for code files to prevent browser thread locking
  const isCodeFile = (filename) => {
    const ext = getFileExtension(filename);
    return ['html', 'css', 'js', 'json', 'ts', 'tsx', 'jsx'].includes(ext);
  };

  // Check if standard web/plain text formats
  const isTextFile = (filename) => {
    const ext = getFileExtension(filename);
    return [
      'txt', 'html', 'css', 'js', 'json', 'xml', 'csv', 'md', 
      'yaml', 'yml', 'ts', 'tsx', 'jsx'
    ].includes(ext);
  };

  // Check if heavy binary document formats requiring backend parser
  const isDocFile = (filename) => {
    const ext = getFileExtension(filename);
    return ['docx', 'pdf'].includes(ext);
  };

  // Core file validation and processing orchestration
  const handleFile = async (file) => {
    if (!file) return;
    setLocalError(null);

    const size = file.size;
    const maxBytes = 5 * 1024 * 1024; // 5MB total limit
    const maxCodeBytes = 1 * 1024 * 1024; // 1MB code safety limit

    // 0. Restricted Tool Extension Check
    if (allowedExtensions && allowedExtensions.length > 0) {
      const ext = '.' + getFileExtension(file.name);
      if (!allowedExtensions.includes(ext)) {
        setLocalError({
          message: `Invalid format. This input only accepts: ${allowedExtensions.join(', ')} files.`,
          isWarning: false
        });
        return;
      }
    }

    // 1. Validation checks
    if (size > maxBytes) {
      setLocalError({
        message: `File size exceeds the 5MB limit (${(size / (1024 * 1024)).toFixed(1)}MB).`,
        isWarning: false
      });
      return;
    }

    if (isCodeFile(file.name) && size > maxCodeBytes) {
      setLocalError({
        message: `Code files are limited to 1MB to prevent severe browser lag.`,
        isWarning: false
      });
      return;
    }

    // 2. Client-side or Server-side Text Extraction
    if (isTextFile(file.name)) {
      setIsProcessing(true);
      setProcessingMessage(`Reading plain text from ${file.name}...`);
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          onChange({ target: { value: text } });
          setIsProcessing(false);
        };
        reader.onerror = () => {
          setLocalError({ message: "Failed to read plain text file.", isWarning: false });
          setIsProcessing(false);
        };
        reader.readAsText(file);
      } catch {
        setLocalError({ message: "Error reading text file.", isWarning: false });
        setIsProcessing(false);
      }
    } else if (isDocFile(file.name)) {
      setIsProcessing(true);
      setProcessingMessage(`Extracting text from document ${file.name}...`);
      try {
        const res = await api.parseFile(file);
        onChange({ target: { value: res.text } });
        setIsProcessing(false);
      } catch (err) {
        setLocalError({
          message: err.message || "Failed to extract text. Make sure backend parser is online.",
          isWarning: false
        });
        setIsProcessing(false);
      }
    } else {
      // General fallback parsing: try reading as plain text first
      setIsProcessing(true);
      setProcessingMessage(`Reading unknown format ${file.name} as text...`);
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          onChange({ target: { value: text } });
          setIsProcessing(false);
        };
        reader.onerror = () => {
          setLocalError({
            message: "Unsupported file type. Please upload a .txt, .pdf, .docx, or text-based file.",
            isWarning: false
          });
          setIsProcessing(false);
        };
        reader.readAsText(file);
      } catch {
        setLocalError({
          message: "Unsupported file type. Please upload a .txt, .pdf, .docx, or text-based file.",
          isWarning: false
        });
        setIsProcessing(false);
      }
    }
  };

  // Drag and Drop handlers
  const handleDragEnter = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();

    // Reset drag indicator only when leaving the actual container bounds
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX >= rect.right ||
      e.clientY < rect.top ||
      e.clientY >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex h-full min-h-0 min-w-0 relative border border-transparent overflow-hidden ${
        isOutput ? 'bg-surface-container-low/20' : 'bg-surface-container-low/40'
      }`}
    >
      {/* Hidden Native File Selector */}
      {!readOnly && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept={allowedExtensions ? allowedExtensions.join(',') : ".txt,.html,.css,.js,.json,.pdf,.docx,.doc,text/*"}
        />
      )}

      {/* Floating Toolbar (Direction Toggle + Upload Button) */}
      {!isProcessing && (
        <div className={`absolute top-2.5 z-10 select-none flex items-center gap-1.5 ${
          computedDirection === 'rtl' 
            ? 'left-14 flex-row-reverse' 
            : 'right-4'
        }`}>
          {/* Floating Direction Toggle Button */}
          <button
            onClick={() => {
              const modes = ['auto', 'ltr', 'rtl'];
              const nextIndex = (modes.indexOf(directionMode) + 1) % modes.length;
              setDirectionMode(modes[nextIndex]);
            }}
            type="button"
            title={`Direction: ${directionMode.toUpperCase()} (Click to toggle)`}
            className={`px-2 py-1.5 rounded border transition-all duration-200 cursor-pointer shadow hover:shadow-md flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider group ${
              directionMode === 'auto'
                ? 'bg-surface border-outline-variant/30 text-text-muted hover:bg-surface-container-low'
                : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
            }`}
          >
            <ArrowLeftRight size={10} className={computedDirection === 'rtl' ? 'scale-x-[-1] text-primary transition-transform' : 'transition-transform'} />
            <span>{directionMode}</span>
          </button>

          {/* Floating Action Upload Button (Prominent styling with Icon + Text) */}
          {!readOnly && (
            <button
              onClick={handleUploadClick}
              type="button"
              title={allowedExtensions ? `Upload ${allowedExtensions.join('/')} file` : "Upload text, docx, pdf or code files"}
              className="px-2.5 py-1.5 rounded bg-primary/10 border border-primary/30 hover:border-primary text-primary hover:bg-primary/20 transition-all duration-200 cursor-pointer shadow hover:shadow-md flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider group"
            >
              <Upload size={12} className="group-hover:-translate-y-0.5 transition-transform" />
              <span>Upload File</span>
            </button>
          )}
        </div>
      )}

      {/* Line Numbers Gutter */}
      <pre
        ref={gutterRef}
        className="absolute left-0 top-0 bottom-0 w-10 select-none pointer-events-none bg-surface-container-lowest/30 border-r border-outline-variant/10 py-4 text-right pr-2 overflow-y-auto overflow-x-hidden scrollbar-hide text-text-faint font-mono text-[11px] leading-6 whitespace-pre m-0"
      >
        {lineNumbersText}
      </pre>

      {/* Editor Surface */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        placeholder={placeholder}
        readOnly={readOnly}
        spellCheck="false"
        dir={computedDirection}
        className={`flex-1 min-h-0 min-w-0 py-4 font-mono text-[13px] leading-6 outline-none h-full overflow-y-auto whitespace-pre overflow-x-auto ${paddingClasses} ${
          isOutput 
            ? 'text-primary/95 placeholder:text-text-faint' 
            : 'text-text-base placeholder:text-text-faint'
        }`}
      />

      {/* Interactive Visual Drag Overlay */}
      {isDragging && !readOnly && (
        <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-[2px] border-2 border-dashed border-primary/50 flex flex-col items-center justify-center p-6 z-20 pointer-events-none select-none">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
            <Upload size={20} className="animate-bounce" />
          </div>
          <span className="text-xs font-bold text-text-base mb-1">
            {allowedExtensions ? `Drop ${allowedExtensions.join('/')} file here` : "Drop file here to upload"}
          </span>
          <span className="text-[10px] text-text-muted text-center max-w-[250px]">
            {allowedExtensions 
              ? `Only accepts ${allowedExtensions.join(', ')} file formats` 
              : "Supports TXT, DOCX, PDF, HTML, CSS, JS (Max 5MB)"}
          </span>
        </div>
      )}

      {/* File Parsing Loading overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-bg-base/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 z-20 select-none">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <span className="text-xs font-mono text-text-base animate-pulse-subtle">{processingMessage}</span>
        </div>
      )}

      {/* Inline File Validation Error Alert */}
      {localError && (
        <div className="absolute top-11 right-4 left-14 bg-error-red/10 border border-error-red/20 px-3 py-2 text-[11px] font-mono text-error-red rounded flex items-start gap-2 justify-between z-30 shadow-lg">
          <div className="flex gap-2 items-start mt-0.5">
            <AlertCircle size={13} className="shrink-0 mt-0.5 text-error-red" />
            <span>{localError.message}</span>
          </div>
          <button 
            onClick={() => setLocalError(null)}
            type="button"
            className="text-text-muted hover:text-error-red transition-colors p-0.5 cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Inline Validation Error Overlay */}
      {error && (
        <div className="absolute bottom-4 left-14 right-4 bg-error-red/10 border border-error-red/20 px-3 py-2 text-[12px] font-mono text-error-red rounded flex items-center justify-between">
          <span>{error.message}</span>
          {error.line && <span className="opacity-70">Line {error.line}</span>}
        </div>
      )}
    </div>
  );
}


