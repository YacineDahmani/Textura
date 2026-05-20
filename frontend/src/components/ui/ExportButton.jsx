import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, Check, FileText, FileCode } from 'lucide-react';

export function ExportButton({ text, toolId, mode = '', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!text || text.trim() === '' || text.startsWith('Error: ')) {
    return null;
  }

  // Base download helper
  const triggerDownload = (filename, content, mimeType) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setDownloadedFormat(filename.split('.').pop());
      setTimeout(() => setDownloadedFormat(null), 2000);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to export file', err);
    }
  };

  // Direct download handler for tools that export directly (minifiers, json formatter)
  const handleDirectExport = () => {
    if (toolId === 'minifier') {
      if (mode === 'html') {
        triggerDownload('minified.html', text, 'text/html');
      } else if (mode === 'js') {
        triggerDownload('minified.js', text, 'application/javascript');
      } else if (mode === 'css') {
        triggerDownload('minified.css', text, 'text/css');
      }
    } else if (toolId === 'json-formatter') {
      triggerDownload('formatted.json', text, 'application/json');
    }
  };

  // Word Document export helper (.doc / .docx) using standard HTML-Word Office formatting
  const handleWordExport = (extension) => {
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Normal</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <meta charset="utf-8">
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
          p { margin: 0 0 10px 0; }
        </style>
      </head>
      <body>
        ${text.split('\n').map(line => `<p>${line ? line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '&nbsp;'}</p>`).join('')}
      </body>
      </html>
    `;
    triggerDownload(`document.${extension}`, htmlContent, 'application/msword');
  };

  // Check if tool is direct download
  const isDirectDownload = toolId === 'minifier' || toolId === 'json-formatter';

  if (isDirectDownload) {
    const directExt = toolId === 'json-formatter' ? 'json' : mode;
    const isSaved = downloadedFormat === directExt;

    return (
      <button
        onClick={handleDirectExport}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all text-[11px] font-semibold uppercase cursor-pointer border border-transparent ${
          isSaved
            ? 'text-success-green bg-success-green/10'
            : 'text-text-muted hover:text-primary hover:bg-surface-container-high'
        } ${className}`}
        title={`Download raw minified .${directExt} file`}
      >
        {isSaved ? (
          <>
            <Check size={13} className="shrink-0 animate-scale-up" />
            <span>Saved!</span>
          </>
        ) : (
          <>
            <Download size={13} className="shrink-0" />
            <span>Export .{directExt}</span>
          </>
        )}
      </button>
    );
  }

  // Dropdown options for other text tools
  const dropdownOptions = [
    {
      id: 'txt',
      label: 'Plain Text (.txt)',
      icon: <FileText size={13} />,
      handler: () => triggerDownload('result.txt', text, 'text/plain'),
    },
    {
      id: 'docx',
      label: 'Word Document (.docx)',
      icon: <FileCode size={13} />,
      handler: () => handleWordExport('docx'),
    },
    {
      id: 'doc',
      label: 'Word Document (.doc)',
      icon: <FileCode size={13} />,
      handler: () => handleWordExport('doc'),
    },
  ];

  return (
    <div ref={dropdownRef} className="relative inline-block text-left select-none">
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all text-[11px] font-semibold uppercase cursor-pointer border border-transparent ${
          isOpen
            ? 'text-primary bg-primary/10 border-primary/20'
            : 'text-text-muted hover:text-primary hover:bg-surface-container-high'
        } ${className}`}
      >
        <Download size={13} className="shrink-0" />
        <span>Export</span>
        <ChevronDown
          size={11}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 origin-top-right rounded bg-surface-container-high/95 backdrop-blur-md border border-outline-variant shadow-xl z-50 overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-outline-variant/60 bg-surface-container-lowest/50">
            <span className="text-[9px] font-bold tracking-widest text-text-faint uppercase font-mono">
              Export Formats
            </span>
          </div>

          {/* List */}
          <div className="py-1 flex flex-col">
            {dropdownOptions.map((opt) => {
              const isDownloaded = downloadedFormat === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={opt.handler}
                  className="w-full px-3 py-2 flex items-center justify-between text-left text-[12px] font-sans text-text-muted hover:text-text-base hover:bg-primary/5 hover:border-l-2 hover:border-primary border-l-2 border-transparent transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-text-faint group-hover:text-primary transition-colors">
                      {opt.icon}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                  {isDownloaded && (
                    <span className="text-success-green flex items-center gap-0.5 text-[10px] font-semibold animate-scale-up uppercase font-mono">
                      <Check size={11} />
                      Saved
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
