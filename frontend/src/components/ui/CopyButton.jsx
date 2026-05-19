import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text || text.trim() === '') return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors text-[11px] font-semibold uppercase ${
        copied
          ? 'text-success-green bg-success-green/10'
          : 'text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check size={13} className="shrink-0 animate-scale-up" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy size={13} className="shrink-0" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
