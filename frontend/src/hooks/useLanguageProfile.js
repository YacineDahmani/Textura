import { useState, useEffect } from 'react';
import { useToolStore } from '../store/useToolStore';

export function useLanguageProfile(toolId) {
  const toolData = useToolStore((state) => state.tools[toolId]);
  const clearToolInput = useToolStore((state) => state.clearToolInput);

  const [selectedLang, setSelectedLang] = useState('general');
  const [hasManuallySelected, setHasManuallySelected] = useState(false);
  const [inputDirectionMode, setInputDirectionMode] = useState('auto');

  // Smart Auto-detection of language profile when text changes
  useEffect(() => {
    if (!toolData?.input) {
      if (!hasManuallySelected) {
        setSelectedLang('general');
        setInputDirectionMode('auto');
      }
      return;
    }
    if (hasManuallySelected) return;
    
    const input = toolData.input;
    const counts = {
      arabic: (input.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length,
      chinese: (input.match(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g) || []).length,
      latin: (input.match(/[\u00C0-\u017F]/g) || []).length, // Accented characters
    };

    let maxCount = 0;
    let detected = 'general';
    for (const [lang, count] of Object.entries(counts)) {
      if (count > maxCount && count > 1) { // Trigger if we find multiple specific language characters
        maxCount = count;
        detected = lang;
      }
    }
    
    if (detected !== 'general') {
      setSelectedLang(detected);
      if (detected === 'arabic') {
        setInputDirectionMode('rtl');
      } else {
        setInputDirectionMode('auto');
      }
    }
  }, [toolData?.input, hasManuallySelected]);

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    setHasManuallySelected(true);
    if (lang === 'arabic') {
      setInputDirectionMode('rtl');
    } else {
      setInputDirectionMode('auto');
    }
  };

  const handleClear = () => {
    clearToolInput(toolId);
    setHasManuallySelected(false);
    setSelectedLang('general');
    setInputDirectionMode('auto');
  };

  return {
    selectedLang,
    inputDirectionMode,
    setInputDirectionMode,
    handleLanguageChange,
    handleClear,
  };
}
