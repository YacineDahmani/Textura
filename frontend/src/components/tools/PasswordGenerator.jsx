import React, { useEffect } from 'react';
import { useToolStore } from '../../store/useToolStore';
import { useTransform } from '../../hooks/useTransform';
import { WorkspaceLayout } from '../layout/WorkspaceLayout';
import { ActionButton } from '../ui/ActionButton';
import { CopyButton } from '../ui/CopyButton';
import { ExportButton } from '../ui/ExportButton';
import { Shield, RefreshCw, Key, Check, Info } from 'lucide-react';

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

  return (
    <WorkspaceLayout actionChips={null} showSwap={false}>
      {/* Left Input Pane: Configuration Controls */}
      <div className="flex-1 flex flex-col h-full bg-surface border-r border-outline-variant/20">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">Password Input & Generator</span>
          <button 
            onClick={() => clearToolInput('password-generator')}
            className="text-[10px] font-bold text-text-faint hover:text-error-red uppercase tracking-wider transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 text-sm">
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
              <div className="flex items-center gap-1">
                {[1, 3, 5].map((q) => (
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
            </div>

            <button
              onClick={handleGenerate}
              className="mt-2 w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer select-none"
            >
              <RefreshCw size={13} className="animate-spin-slow" /> Generate Secure Password
            </button>
          </div>

          {/* Interactive input area */}
          <div className="flex flex-col gap-2 flex-1 min-h-[140px]">
            <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono select-none">
              Test Custom / Active Passwords
            </label>
            <textarea
              value={passwordInput}
              onChange={(e) => updateToolInput('password-generator', e.target.value)}
              placeholder="Or type a custom password to evaluate..."
              className="flex-1 w-full p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest font-mono text-sm leading-relaxed text-text-base focus:border-primary/50 transition-colors select-text resize-none outline-none overflow-y-auto"
            />
          </div>
        </div>
      </div>

      {/* Right Output Pane: Strength Diagnostics */}
      <div className="flex-1 flex flex-col h-full bg-surface">
        <div className="h-8 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-lowest/30 select-none">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase font-mono">Strength Checker Diagnostics</span>
          <div className="flex items-center gap-1.5">
            <ExportButton text={toolData?.output || ''} toolId="password-generator" />
            <CopyButton text={passwordInput} label="Copy Password" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-sm select-none">
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
      </div>
    </WorkspaceLayout>
  );
}
