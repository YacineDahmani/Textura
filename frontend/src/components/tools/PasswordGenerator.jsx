import React, { useEffect, useState } from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';
import { ExportButton } from '../ui/ExportButton';
import { Shield, RefreshCw, Key, Check, Info, Upload, Eye, EyeOff, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PasswordGenerator() {
  // Execute transformation hook
  useTransform();

  const toolData = useToolStore((state) => state.tools['password-generator']);
  const updateToolInput = useToolStore((state) => state.updateToolInput);
  const setToolOption = useToolStore((state) => state.setToolOption);
  const toggleToolOption = useToolStore((state) => state.toggleToolOption);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const options = toolData?.options || {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    quantity: 1,
  };

  // State hooks for bulk diagnostics, search, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [strengthFilter, setStrengthFilter] = useState('all');
  const [revealAll, setRevealAll] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toggleReveal = (index) => {
    setRevealedIndices((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Smart heuristic file parsing utility for different formats
  const parseImportedContent = (fileName, rawContent) => {
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (ext === 'json') {
      try {
        const parsed = JSON.parse(rawContent);
        const passwords = [];
        
        const extractFromObj = (val) => {
          if (typeof val === 'string' && val.trim().length > 0) {
            passwords.push(val.trim());
          } else if (typeof val === 'number') {
            passwords.push(String(val));
          } else if (Array.isArray(val)) {
            val.forEach(item => extractFromObj(item));
          } else if (val !== null && typeof val === 'object') {
            const keys = Object.keys(val);
            // Search for typical password field keys
            const pwdKey = keys.find(k => /password|pwd|secret|passcode|token/i.test(k));
            if (pwdKey) {
              extractFromObj(val[pwdKey]);
            } else {
              keys.forEach(k => extractFromObj(val[k]));
            }
          }
        };
        
        extractFromObj(parsed);
        if (passwords.length > 0) {
          return passwords.join('\n');
        }
      } catch (e) {
        console.error("JSON parsing failed, falling back to lines", e);
      }
    }
    
    if (ext === 'csv' || ext === 'tsv') {
      try {
        const delimiter = ext === 'tsv' ? '\t' : ',';
        const lines = rawContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length > 0) {
          // Check for headers
          const firstLineCols = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
          const pwdIndex = firstLineCols.findIndex(h => /password|pwd|secret|passcode/i.test(h));
          
          if (pwdIndex !== -1 && lines.length > 1) {
            const passwords = [];
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(delimiter);
              if (cols[pwdIndex] !== undefined) {
                const val = cols[pwdIndex].trim().replace(/^["']|["']$/g, '');
                if (val) passwords.push(val);
              }
            }
            if (passwords.length > 0) {
              return passwords.join('\n');
            }
          }
          
          // Fallback if no password header or just one column
          const passwords = [];
          lines.forEach(line => {
            const cols = line.split(delimiter);
            if (cols.length === 1) {
              const val = cols[0].trim().replace(/^["']|["']$/g, '');
              if (val) passwords.push(val);
            } else {
              // Try to find columns that look like passwords
              cols.forEach(c => {
                const val = c.trim().replace(/^["']|["']$/g, '');
                // Heuristic: skip standard email formats and extremely long/short columns
                if (val && val.length >= 4 && val.length < 50 && !val.includes('@')) {
                  passwords.push(val);
                }
              });
            }
          });
          if (passwords.length > 0) {
            return passwords.join('\n');
          }
        }
      } catch (e) {
        console.error("CSV/TSV parsing failed, falling back to lines", e);
      }
    }
    
    // Default raw txt/log split by line
    return rawContent
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const parsedText = parseImportedContent(file.name, text);
        updateToolInput('password-generator', parsedText);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  // Helper to generate a new password based on options
  const handleGenerate = () => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Character pool filters
    let chars = '';
    if (options.lowercase) chars += lowercaseChars;
    if (options.uppercase) chars += uppercaseChars;
    if (options.numbers) chars += numberChars;
    if (options.symbols) chars += symbolChars;

    if (!chars) {
      updateToolInput('password-generator', 'Select at least one character set.');
      return;
    }

    let finalPasswords = [];
    const qty = options.quantity || 1;
    
    for (let q = 0; q < qty; q++) {
      let pwd = '';
      const array = new Uint32Array(options.length);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < options.length; i++) {
        pwd += chars[array[i] % chars.length];
      }
      finalPasswords.push(pwd);
    }

    updateToolInput('password-generator', finalPasswords.join('\n'));
  };

  // Generate an initial password if empty
  useEffect(() => {
    if (!toolData?.input) {
      handleGenerate();
    }
  }, []);

  // Parse Diagnostics out of Output to show visually
  const passwordInput = toolData?.input || '';
  
  // Calculate character pool and entropy natively for real-time visualization
  const hasLower = /[a-z]/.test(passwordInput);
  const hasUpper = /[A-Z]/.test(passwordInput);
  const hasNumber = /[0-9]/.test(passwordInput);
  const hasSymbol = /[^a-zA-Z0-9]/.test(passwordInput);
  const isLongEnough = passwordInput.length >= 12;
  const hasRepetitive = /(.)\1\1/.test(passwordInput) || /123|abc|qwerty/i.test(passwordInput);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 32;
  if (poolSize === 0) poolSize = 1;
  
  const entropy = passwordInput ? passwordInput.length * Math.log2(poolSize) : 0;
  
  let score = 0;
  if (passwordInput) {
    if (isLongEnough) score += 1;
    if (hasLower && hasUpper) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;
    if (hasRepetitive && score > 0) score -= 1;
  }

  // Visual classes for strength meter
  const getStrengthMeta = () => {
    if (!passwordInput) return { label: 'Enter/Generate Password', color: 'bg-outline-variant/30', width: 'w-0', text: 'text-text-faint' };
    if (entropy >= 80 && score >= 3) {
      return { label: 'Extremely Secure', color: 'bg-success-green shadow-[0_0_8px_rgba(34,197,94,0.4)]', width: 'w-full', text: 'text-success-green' };
    }
    if (entropy >= 60 && score >= 2) {
      return { label: 'Strong', color: 'bg-primary shadow-[0_0_8px_rgba(138,210,222,0.4)]', width: 'w-3/4', text: 'text-primary' };
    }
    if (entropy >= 40) {
      return { label: 'Weak / Medium', color: 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]', width: 'w-1/2', text: 'text-yellow-500' };
    }
    return { label: 'Very Weak', color: 'bg-error-red shadow-[0_0_8px_rgba(239,68,68,0.4)]', width: 'w-1/4', text: 'text-error-red' };
  };

  const strength = getStrengthMeta();

  const passwords = passwordInput
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  
  const isBulkMode = passwords.length > 1;

  // Reset pagination on input change
  useEffect(() => {
    setCurrentPage(1);
    setRevealedIndices({});
    setRevealAll(false);
  }, [passwordInput]);

  // Run bulk diagnostics if in bulk mode
  const bulkData = isBulkMode
    ? passwords.map((pwd) => {
        const hasLower = /[a-z]/.test(pwd);
        const hasUpper = /[A-Z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
        const isLongEnough = pwd.length >= 12;
        const hasRepetitive = /(.)\1\1/.test(pwd) || /123|abc|qwerty/i.test(pwd);

        let poolSize = 0;
        if (hasLower) poolSize += 26;
        if (hasUpper) poolSize += 26;
        if (hasNumber) poolSize += 10;
        if (hasSymbol) poolSize += 32;
        if (poolSize === 0) poolSize = 1;
        
        const entropy = pwd.length * Math.log2(poolSize);
        
        let score = 0;
        if (isLongEnough) score += 1;
        if (hasLower && hasUpper) score += 1;
        if (hasNumber) score += 1;
        if (hasSymbol) score += 1;
        if (hasRepetitive && score > 0) score -= 1;

        let label = 'Very Weak';
        let color = 'bg-error-red';
        let textColor = 'text-error-red';
        let textBg = 'bg-error-red/10 border-error-red/20';

        if (entropy >= 80 && score >= 3) {
          label = 'Extremely Secure';
          color = 'bg-success-green';
          textColor = 'text-success-green';
          textBg = 'bg-success-green/10 border-success-green/20';
        } else if (entropy >= 60 && score >= 2) {
          label = 'Strong';
          color = 'bg-primary';
          textColor = 'text-primary';
          textBg = 'bg-primary/10 border-primary/20';
        } else if (entropy >= 40) {
          label = 'Weak / Medium';
          color = 'bg-yellow-500';
          textColor = 'text-yellow-500';
          textBg = 'bg-yellow-500/10 border-yellow-500/20';
        }

        return {
          password: pwd,
          entropy,
          poolSize,
          score,
          label,
          color,
          textColor,
          textBg,
          hasLower,
          hasUpper,
          hasNumber,
          hasSymbol,
          isLongEnough,
          hasRepetitive
        };
      })
    : [];

  const totalScanned = bulkData.length;
  const extremelySecureCount = bulkData.filter((d) => d.label === 'Extremely Secure').length;
  const strongCount = bulkData.filter((d) => d.label === 'Strong').length;
  const weakMediumCount = bulkData.filter((d) => d.label === 'Weak / Medium').length;
  const veryWeakCount = bulkData.filter((d) => d.label === 'Very Weak').length;

  const avgEntropy = totalScanned > 0 
    ? bulkData.reduce((sum, d) => sum + d.entropy, 0) / totalScanned 
    : 0;

  const extremelySecurePct = totalScanned > 0 ? (extremelySecureCount / totalScanned) * 100 : 0;
  const strongPct = totalScanned > 0 ? (strongCount / totalScanned) * 100 : 0;
  const weakMediumPct = totalScanned > 0 ? (weakMediumCount / totalScanned) * 100 : 0;
  const veryWeakPct = totalScanned > 0 ? (veryWeakCount / totalScanned) * 100 : 0;

  const filteredBulkData = bulkData.filter((d) => {
    const matchesSearch = d.password.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStrength = strengthFilter === 'all' || d.label.toLowerCase() === strengthFilter.toLowerCase();
    return matchesSearch && matchesStrength;
  });

  const totalPages = Math.ceil(filteredBulkData.length / itemsPerPage) || 1;
  const paginatedData = filteredBulkData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderBulkDashboard = () => {
    return (
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-6 flex flex-col gap-6 text-sm">
        {/* Bulk Overview Card */}
        <div className="bg-surface-container-high/40 p-5 rounded-xl border border-outline-variant/30 flex flex-col gap-4">
          <div className="flex justify-between items-center select-none">
            <span className="text-xs text-text-muted uppercase font-mono font-bold tracking-wider">Bulk Diagnostic Summary</span>
            <span className="text-xs font-mono text-text-muted bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
              {totalScanned} Passwords
            </span>
          </div>

          {/* Segmented Strength Distribution Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden flex">
              {extremelySecureCount > 0 && (
                <div 
                  style={{ width: `${extremelySecurePct}%` }} 
                  className="h-full bg-success-green transition-all" 
                  title={`Extremely Secure: ${extremelySecureCount} (${extremelySecurePct.toFixed(1)}%)`} 
                />
              )}
              {strongCount > 0 && (
                <div 
                  style={{ width: `${strongPct}%` }} 
                  className="h-full bg-primary transition-all" 
                  title={`Strong: ${strongCount} (${strongPct.toFixed(1)}%)`} 
                />
              )}
              {weakMediumCount > 0 && (
                <div 
                  style={{ width: `${weakMediumPct}%` }} 
                  className="h-full bg-yellow-500 transition-all" 
                  title={`Weak / Medium: ${weakMediumCount} (${weakMediumPct.toFixed(1)}%)`} 
                />
              )}
              {veryWeakCount > 0 && (
                <div 
                  style={{ width: `${veryWeakPct}%` }} 
                  className="h-full bg-error-red transition-all" 
                  title={`Very Weak: ${veryWeakCount} (${veryWeakPct.toFixed(1)}%)`} 
                />
              )}
            </div>
            
            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono mt-1 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-success-green shrink-0" />
                <span className="text-text-muted">Secure: <strong>{extremelySecureCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-primary shrink-0" />
                <span className="text-text-muted">Strong: <strong>{strongCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-yellow-500 shrink-0" />
                <span className="text-text-muted">Weak: <strong>{weakMediumCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-error-red shrink-0" />
                <span className="text-text-muted">V. Weak: <strong>{veryWeakCount}</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-outline-variant/20 pt-4 select-none">
            <div className="flex flex-col gap-0.5">
              <span className="text-text-muted">Avg Entropy:</span>
              <span className="text-sm font-bold text-text-base">{avgEntropy.toFixed(1)} bits</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-text-muted">General Quality:</span>
              <span className={`text-sm font-bold ${
                avgEntropy >= 70 ? 'text-success-green' : avgEntropy >= 50 ? 'text-primary' : avgEntropy >= 30 ? 'text-yellow-500' : 'text-error-red'
              }`}>
                {avgEntropy >= 70 ? 'Excellent' : avgEntropy >= 50 ? 'Good' : avgEntropy >= 30 ? 'Moderate' : 'Poor'}
              </span>
            </div>
          </div>
        </div>

        {/* Passwords Table & Filters Card */}
        <div className="flex-1 flex flex-col min-h-0 bg-surface rounded-xl border border-outline-variant/30 overflow-hidden">
          {/* Controls */}
          <div className="p-3 border-b border-outline-variant/20 flex flex-col sm:flex-row gap-2.5 justify-between items-center bg-surface-container-low/40">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
              <input
                type="text"
                placeholder="Search password..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-outline-variant/20 rounded bg-surface-container-lowest text-text-base focus:border-primary/50 outline-none font-sans"
              />
            </div>

            {/* Filter Dropdown & Global Visibility */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={strengthFilter}
                onChange={(e) => {
                  setStrengthFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 text-xs border border-outline-variant/20 rounded bg-surface-container text-text-base focus:border-primary/50 outline-none font-sans cursor-pointer"
              >
                <option value="all">All Strengths</option>
                <option value="extremely secure">Extremely Secure</option>
                <option value="strong">Strong</option>
                <option value="weak / medium">Weak / Medium</option>
                <option value="very weak">Very Weak</option>
              </select>

              <button
                onClick={() => setRevealAll(!revealAll)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-sans font-bold border border-outline-variant/30 rounded bg-surface-container hover:bg-surface-container-high text-text-muted transition-colors cursor-pointer select-none"
              >
                {revealAll ? <EyeOff size={11} /> : <Eye size={11} />}
                {revealAll ? 'Hide All' : 'Show All'}
              </button>
            </div>
          </div>

          {/* List of Passwords */}
          <div className="flex-1 overflow-y-auto">
            {paginatedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-text-faint gap-1 select-none h-full">
                <span>No passwords matched your filters.</span>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/15">
                {paginatedData.map((item, idx) => {
                  const globalIdx = (currentPage - 1) * itemsPerPage + idx;
                  const isRevealed = revealAll || !!revealedIndices[globalIdx];
                  return (
                    <div key={globalIdx} className="p-3 flex items-center justify-between gap-4 hover:bg-surface-container-low/20 transition-colors">
                      <div className="flex flex-col gap-1 min-w-0">
                        {/* Password display (masked or unmasked) */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-text-base select-all truncate max-w-[140px] sm:max-w-[200px]" style={{ WebkitTextSecurity: isRevealed ? 'none' : 'disc' }}>
                            {item.password}
                          </span>
                          <button
                            onClick={() => toggleReveal(globalIdx)}
                            className="text-text-faint hover:text-primary transition-colors cursor-pointer"
                            title={isRevealed ? 'Hide Password' : 'Show Password'}
                          >
                            {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                          <CopyButton text={item.password} size={11} className="p-0.5 text-text-faint hover:text-primary" />
                        </div>

                        {/* Visual details */}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted select-none">
                          <span>{item.entropy.toFixed(0)} bits</span>
                          <span>•</span>
                          <span>{item.password.length} chars</span>
                        </div>
                      </div>

                      {/* Right Details: Strength and Checklist Indicators */}
                      <div className="flex items-center gap-3">
                        {/* Checklist Indicators: Tiny Dot Statuses */}
                        <div className="hidden sm:flex items-center gap-1 bg-surface-container-low/40 px-2 py-1 rounded border border-outline-variant/10 select-none">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.hasLower ? 'bg-success-green' : 'bg-outline-variant/35'}`} title="Lowercase" />
                          <span className={`w-1.5 h-1.5 rounded-full ${item.hasUpper ? 'bg-success-green' : 'bg-outline-variant/35'}`} title="Uppercase" />
                          <span className={`w-1.5 h-1.5 rounded-full ${item.hasNumber ? 'bg-success-green' : 'bg-outline-variant/35'}`} title="Numbers" />
                          <span className={`w-1.5 h-1.5 rounded-full ${item.hasSymbol ? 'bg-success-green' : 'bg-outline-variant/35'}`} title="Symbols" />
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isLongEnough ? 'bg-success-green' : 'bg-outline-variant/35'}`} title="Length >= 12" />
                          <span className={`w-1.5 h-1.5 rounded-full ${!item.hasRepetitive ? 'bg-success-green' : 'bg-outline-variant/35'}`} title="No repeating patterns" />
                        </div>

                        {/* Category Badge */}
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider select-none shrink-0 text-center ${item.textBg} ${item.textColor}`}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-outline-variant/20 flex items-center justify-between bg-surface-container-low/20 select-none">
              <span className="text-[10px] font-mono text-text-muted">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredBulkData.length)} of {filteredBulkData.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1 border border-outline-variant/30 rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:hover:bg-surface-container text-text-muted transition-colors cursor-pointer"
                >
                  <ChevronLeft size={12} />
                </button>
                <span className="text-[10px] font-mono font-bold text-text-base px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1 border border-outline-variant/30 rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-40 disabled:hover:bg-surface-container text-text-muted transition-colors cursor-pointer"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <WorkspaceLayout actionChips={null} showSwap={false}>
      {/* Left Input Pane: Configuration Controls */}
      <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden bg-surface border-r border-outline-variant/20">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">Password Input & Generator</span>
          <button 
            onClick={() => clearToolInput('password-generator')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        
        <div className="relative flex-1 min-h-0 overflow-hidden bg-surface">
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-5 flex flex-col gap-6 text-sm">
            {/* Main generator options */}
            <div className="bg-surface-container-high/40 p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-4">
              <h3 className="font-bold flex items-center gap-2 text-primary text-xs uppercase tracking-wider select-none">
                <Key size={14} /> Generator Settings
              </h3>
            
            {/* Length slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between font-mono text-xs select-none">
                <span className="text-text-muted">Length:</span>
                <span className="font-bold text-text-base">{options.length} characters</span>
              </div>
              <input 
                type="range" 
                min="6" 
                max="64"
                value={options.length}
                onChange={(e) => setToolOption('password-generator', 'length', parseInt(e.target.value, 10))}
                className="w-full accent-primary h-1 bg-surface-container rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Checkboxes grid */}
            <div className="grid grid-cols-2 gap-3 mt-1 font-sans text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer group text-text-base select-none">
                <input 
                  type="checkbox" 
                  checked={!!options.uppercase}
                  onChange={() => toggleToolOption('password-generator', 'uppercase')}
                  className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 bg-surface-container"
                />
                <span className="group-hover:text-primary transition-colors">Uppercase [A-Z]</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group text-text-base select-none">
                <input 
                  type="checkbox" 
                  checked={!!options.lowercase}
                  onChange={() => toggleToolOption('password-generator', 'lowercase')}
                  className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 bg-surface-container"
                />
                <span className="group-hover:text-primary transition-colors">Lowercase [a-z]</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group text-text-base select-none">
                <input 
                  type="checkbox" 
                  checked={!!options.numbers}
                  onChange={() => toggleToolOption('password-generator', 'numbers')}
                  className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 bg-surface-container"
                />
                <span className="group-hover:text-primary transition-colors">Numbers [0-9]</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group text-text-base select-none">
                <input 
                  type="checkbox" 
                  checked={!!options.symbols}
                  onChange={() => toggleToolOption('password-generator', 'symbols')}
                  className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 bg-surface-container"
                />
                <span className="group-hover:text-primary transition-colors">Symbols [!@#...]</span>
              </label>
            </div>

            {/* Quantity */}
            <div className="flex justify-between items-center mt-2 border-t border-outline-variant/20 pt-3 select-none">
              <span className="text-xs text-text-muted font-mono">Generate Quantity:</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 5, 10].map((q) => (
                    <button
                      key={q}
                      onClick={() => setToolOption('password-generator', 'quantity', q)}
                      className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded border transition-all cursor-pointer ${
                        options.quantity === q
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-text-muted'
                      }`}
                    >
                      x{q}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={options.quantity || 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setToolOption('password-generator', 'quantity', isNaN(val) ? 1 : Math.max(1, Math.min(1000, val)));
                  }}
                  className="w-16 px-2 py-1 text-xs text-center border border-outline-variant/30 rounded bg-surface-container font-mono text-text-base focus:border-primary/50 outline-none"
                  placeholder="Custom"
                  title="Enter custom quantity"
                />
              </div>
            </div>

              <button
                onClick={handleGenerate}
                className="mt-2 w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer select-none"
              >
                <RefreshCw size={13} className="animate-spin-slow" /> Generate Secure Password
              </button>
            </div>

            {/* Interactive input area */}
            <div className="flex flex-col gap-2 min-h-[260px]">
              <div className="flex justify-between items-center select-none">
                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">
                  Test Custom / Active Passwords
                </label>
                <label className="text-[10px] font-bold text-primary hover:text-primary-container cursor-pointer uppercase tracking-wider transition-colors flex items-center gap-1">
                  <Upload size={12} /> Import File
                  <input 
                    type="file" 
                    accept=".txt,.csv,.tsv,.json,.log"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="relative flex-1 min-h-[180px] overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
                <textarea
                  value={passwordInput}
                  onChange={(e) => updateToolInput('password-generator', e.target.value)}
                  placeholder="Or type a custom password to evaluate..."
                  className="absolute inset-0 h-full w-full p-4 font-mono text-sm leading-relaxed text-text-base focus:border-primary/50 transition-colors select-text resize-none outline-none overflow-y-auto overflow-x-auto bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Output Pane: Strength Diagnostics */}
      <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">Strength Checker Diagnostics</span>
          <div className="flex items-center gap-1.5">
            <ExportButton text={toolData?.output || ''} toolId="password-generator" />
            <CopyButton text={passwordInput} label="Copy Password" />
          </div>
        </div>

        <div className="relative flex-1 min-h-0 overflow-hidden bg-surface">
          {isBulkMode ? (
            renderBulkDashboard()
          ) : (
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-6 flex flex-col gap-6 text-sm select-none">
              {/* Main Visual Strength Card */}
              <div className="bg-surface-container-high/40 p-5 rounded-xl border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex justify-between items-center select-none">
                <span className="text-xs text-text-muted uppercase font-mono font-bold tracking-wider">Evaluation</span>
                <span className={`text-sm font-extrabold uppercase tracking-wide transition-colors ${strength.text}`}>
                  {strength.label}
                </span>
              </div>

              {/* Glowing Strength Bar */}
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 rounded-full ${strength.color} ${strength.width}`} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-outline-variant/20 pt-4 select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-muted">Entropy Score:</span>
                  <span className="text-sm font-bold text-text-base">{entropy.toFixed(1)} bits</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-text-muted">Pool Size:</span>
                  <span className="text-sm font-bold text-text-base">{poolSize} symbols</span>
                </div>
              </div>
              </div>

              {/* Diagnostic checklist */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono select-none">
                  Entropy Checklist
                </h4>
                
                <div className="flex flex-col gap-2.5">
                  {[
                    { checked: hasLower, label: 'Contains lowercase letters (a-z)' },
                    { checked: hasUpper, label: 'Contains uppercase letters (A-Z)' },
                    { checked: hasNumber, label: 'Contains numbers (0-9)' },
                    { checked: hasSymbol, label: 'Contains special symbols (!@#...)' },
                    { checked: isLongEnough, label: `Length is >= 12 characters (${passwordInput.length} chars)` },
                    { checked: !hasRepetitive, label: "No continuous repeating patterns (e.g. 'aaa', '123')" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs select-none">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-all ${
                        item.checked
                          ? 'bg-success-green/10 border-success-green/40 text-success-green shadow-[0_0_6px_rgba(34,197,94,0.1)]'
                          : 'border-outline-variant/30 text-text-faint bg-surface-container/20'
                      }`}>
                        {item.checked ? <Check size={11} strokeWidth={3} /> : <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />}
                      </div>
                      <span className={item.checked ? 'text-text-base' : 'text-text-muted'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Educational tooltip */}
              <div className="mt-2 bg-primary/5 rounded-lg border border-primary/10 p-3.5 flex gap-3 text-xs select-none text-text-muted leading-relaxed">
                <Info size={16} className="text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-text-base text-primary">Why Entropy Matters?</span>
                  Entropy measures a password's unpredictability. Higher entropy makes brute-forcing mathematically infeasible. We target at least <strong className="text-primary">60+ bits</strong> for robust security.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
