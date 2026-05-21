import { useEffect, useRef } from 'react';
import { useToolStore } from '../store/useToolStore';
import { api } from '../lib/api';
import { minifyHTML, minifyCSS, minifyJS } from '../lib/minifier';
import { convertToTraditional, convertToSimplified } from '../lib/chineseConverter';

// Utility for Case Conversions
function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}

function toSentenceCase(str) {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
}

function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function toSnakeCase(str) {
  const matches = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
  if (!matches) return '';
  return matches.map(x => x.toLowerCase()).join('_');
}

function toKebabCase(str) {
  const matches = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
  if (!matches) return '';
  return matches.map(x => x.toLowerCase()).join('-');
}

function toPascalCase(str) {
  const matches = str.match(/[a-z0-9]+/gi);
  if (!matches) return '';
  return matches.map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()).join('');
}

// Key sorting utility for JSON
function sortJSONKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortJSONKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortJSONKeys(obj[key]);
        return result;
      }, {});
  }
  return obj;
}

export function useTransform() {
  const activeTool = useToolStore((state) => state.activeTool);
  const toolData = useToolStore((state) => state.tools[activeTool]);
  const updateToolOutput = useToolStore((state) => state.updateToolOutput);
  
  // Keep values in ref to avoid effect recreation loops
  const toolDataRef = useRef(toolData);
  toolDataRef.current = toolData;

  useEffect(() => {
    const data = toolDataRef.current;
    if (!data) return;
    const { input, options, flags, pattern, replacePattern } = data;

    if (!input || input.trim() === '') {
      updateToolOutput(activeTool, '');
      return;
    }

    let isSubscribed = true;
    let debounceTimer;

    const performLocalTransform = () => {
      let result = '';
      try {
        switch (activeTool) {
          case 'case-converter': {
            const activeCase = options.activeCase || 'uppercase';
            switch (activeCase) {
              case 'uppercase': result = input.toUpperCase(); break;
              case 'lowercase': result = input.toLowerCase(); break;
              case 'title': result = toTitleCase(input); break;
              case 'sentence': result = toSentenceCase(input); break;
              case 'camel': result = toCamelCase(input); break;
              case 'snake': result = toSnakeCase(input); break;
              case 'kebab': result = toKebabCase(input); break;
              case 'pascal': result = toPascalCase(input); break;
              default: result = input;
            }
            break;
          }

          case 'text-cleaner': {
            let temp = input;
            if (options.trim) temp = temp.trim();
            if (options.collapseSpaces) temp = temp.replace(/[ \t]+/g, ' ');
            if (options.removeBlankLines) temp = temp.split('\n').filter(line => line.trim() !== '').join('\n');
            if (options.deduplicateLines) temp = Array.from(new Set(temp.split('\n'))).join('\n');
            if (options.stripHtml) temp = temp.replace(/<[^>]*>/g, '');
            if (options.normalizeUnicode) temp = temp.normalize('NFC');
            if (options.removeArabicDiacritics) temp = temp.replace(/[\u064B-\u0652\u0670]/g, '');
            if (options.removeArabicTatweel) temp = temp.replace(/\u0640/g, '');
            if (options.removeAccents) temp = temp.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (options.simplifiedToTraditional) temp = convertToTraditional(temp);
            if (options.traditionalToSimplified) temp = convertToSimplified(temp);
            result = temp;
            break;
          }

          case 'text-stats': {
            // Stats are shown in the footer and main pane. We can compile details as output.
            const charCountVal = input.length;
            const noSpaceCharCount = input.replace(/\s/g, '').length;

            // Treat CJK characters as individual words for accurate statistics
            const cjkRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g;
            const cjkCharCount = (input.match(cjkRegex) || []).length;
            const nonCjkText = input.replace(cjkRegex, ' ');
            const words = nonCjkText.trim() === '' ? [] : nonCjkText.trim().split(/\s+/);
            const wordCountVal = words.length + cjkCharCount;

            const linesVal = input === '' ? 0 : input.split('\n').length;
            const paragraphs = input.split(/\n\s*\n/).filter(p => p.trim() !== '').length;

            // Sentence parsing supporting Western, CJK and Arabic sentence markers
            const sentenceMatches = input.match(/[^.!?。！？؟\s][^.!?。！？؟]*[.!?。！？؟]+/g) || [];
            let sentences = sentenceMatches.length;
            if (sentences === 0 && input.trim() !== '') {
              sentences = 1;
            }

            const readTime = Math.ceil(wordCountVal / 200);

            // Dominant Language Script detection
            const counts = {
              Latin: (input.match(/[a-zA-Z]/g) || []).length,
              Arabic: (input.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length,
              Chinese: (input.match(/[\u4E00-\u9FFF]/g) || []).length,
              Japanese: (input.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || []).length,
              Korean: (input.match(/[\uAC00-\uD7AF]/g) || []).length,
              Cyrillic: (input.match(/[\u0400-\u04FF]/g) || []).length,
            };

            let dominantScript = "Latin / Western";
            let maxCount = 0;
            for (const [script, count] of Object.entries(counts)) {
              if (count > maxCount) {
                maxCount = count;
                dominantScript = script;
              }
            }

            if (dominantScript === "Chinese") {
              dominantScript = "Chinese (Han / Mandarin)";
            } else if (dominantScript === "Japanese") {
              dominantScript = "Japanese (Kana / Kanji)";
            } else if (dominantScript === "Korean") {
              dominantScript = "Korean (Hangul)";
            } else if (dominantScript === "Arabic") {
              dominantScript = "Arabic / Persian (RTL)";
            } else if (dominantScript === "Cyrillic") {
              dominantScript = "Cyrillic (Russian / Slavic)";
            } else if (dominantScript === "Latin" && maxCount > 0) {
              dominantScript = "Latin (English / Spanish / French...)";
            } else if (maxCount === 0) {
              dominantScript = "Mixed / Other";
            }

            result = `--- Comprehensive Text Diagnostics ---
Detected Primary Script  : ${dominantScript}
Characters (with spaces) : ${charCountVal}
Characters (no spaces)   : ${noSpaceCharCount}
Words (script-aware)     : ${wordCountVal}
Lines                    : ${linesVal}
Paragraphs               : ${paragraphs}
Sentences                : ${sentences}
Estimated Reading Time   : ~${readTime} min (at 200 WPM)
Average Word Length      : ${wordCountVal > 0 ? (noSpaceCharCount / wordCountVal).toFixed(2) : 0} chars`;
            break;
          }

          case 'json-formatter': {
            let parsed = JSON.parse(input);
            if (options.sortKeys) {
              parsed = sortJSONKeys(parsed);
            }
            const mode = options.formatType || 'pretty-2';
            if (mode === 'minify') {
              result = JSON.stringify(parsed);
            } else {
              const spacing = mode === 'pretty-4' ? 4 : 2;
              result = JSON.stringify(parsed, null, spacing);
            }
            break;
          }

          case 'url-encoder': {
            const encodeMode = options.mode || 'encode';
            const fullUrl = options.fullUrl;
            if (encodeMode === 'encode') {
              result = fullUrl ? encodeURI(input) : encodeURIComponent(input);
            } else {
              result = fullUrl ? decodeURI(input) : decodeURIComponent(input);
            }
            break;
          }

          case 'minifier': {
            const mode = options.mode || 'html';
            if (mode === 'html') {
              result = minifyHTML(input, {
                stripComments: options.stripComments,
                collapseWhitespace: options.collapseWhitespace,
                minifyEmbedded: options.minifyEmbedded,
              });
            } else if (mode === 'css') {
              result = minifyCSS(input, {
                stripComments: options.stripComments,
                removeLastSemicolon: options.removeLastSemicolon,
              });
            } else if (mode === 'js') {
              result = minifyJS(input, {
                stripComments: options.stripComments,
                collapseSpaces: options.collapseSpaces,
              });
            }
            break;
          }

          default:
            return;
        }
        if (isSubscribed) {
          updateToolOutput(activeTool, result);
        }
      } catch (err) {
        if (isSubscribed) {
          updateToolOutput(activeTool, `Error: ${err.message}`);
        }
      }
    };

    const performRemoteTransform = () => {
      debounceTimer = setTimeout(async () => {
        try {
          let apiResult = '';
          switch (activeTool) {
            case 'base64': {
              const res = await api.base64(input, options.mode || 'encode', options.urlSafe);
              apiResult = res.output;
              break;
            }
            case 'hash-generator': {
              const res = await api.generateHashes(input);
              apiResult = JSON.stringify(res.output, null, 2);
              break;
            }
            case 'regex-tester': {
              if (pattern && pattern.trim() !== '') {
                const res = await api.testRegex(
                  input,
                  pattern,
                  replacePattern,
                  flags || {},
                  options.mode || 'test'
                );
                apiResult = res.output;
              } else {
                apiResult = 'Waiting for regex pattern input...';
              }
              break;
            }
            default:
              return;
          }
          if (isSubscribed) {
            updateToolOutput(activeTool, apiResult);
          }
        } catch (err) {
          if (isSubscribed) {
            updateToolOutput(activeTool, `Remote Error: ${err.message}`);
          }
        }
      }, 300); // 300ms debounce to prevent API thrashing
    };

    const localTools = ['case-converter', 'text-cleaner', 'text-stats', 'json-formatter', 'url-encoder', 'minifier'];
    if (localTools.includes(activeTool)) {
      if (input.length > 2000) {
        debounceTimer = setTimeout(() => {
          performLocalTransform();
        }, 150);
      } else {
        performLocalTransform();
      }
    } else {
      performRemoteTransform();
    }

    return () => {
      isSubscribed = false;
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [
    activeTool,
    toolData?.input,
    toolData?.options,
    toolData?.flags,
    toolData?.pattern,
    toolData?.replacePattern,
    updateToolOutput,
  ]);
}
