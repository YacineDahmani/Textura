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

// Helper for Markdown rendering
export function markdownToHtml(md) {
  if (!md) return "";
  let html = md;

  // Escape HTML entities to prevent XSS (except for basic tags that we generate)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 1. Headers
  html = html.replace(/^######\s+(.*)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.*)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.*)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");

  // 2. Horizontal Rules
  html = html.replace(/^---\s*$/gm, "<hr />");

  // 3. Blockquotes
  html = html.replace(/^>\s+(.*)$/gm, "<blockquote>$1</blockquote>");

  // 4. Code Blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-surface-container-highest font-mono p-3 rounded my-2 text-[12px] block overflow-x-auto select-text">$1</pre>');

  // 5. Inline Code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-surface-container-highest px-1.5 py-0.5 rounded font-mono text-primary text-[11px]">$1</code>');

  // 6. Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

  // 7. Lists
  html = html.replace(/^\s*[-*+]\s+(.*)$/gm, "<li>$1</li>");
  html = html.replace(/^\s*\d+\.\s+(.*)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)+/g, (match) => {
    if (match.includes("1.")) {
      return `<ol class="list-decimal pl-6 my-2 flex flex-col gap-1">${match}</ol>`;
    }
    return `<ul class="list-disc pl-6 my-2 flex flex-col gap-1">${match}</ul>`;
  });

  // 8. Links and Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded border border-outline-variant/30 my-2" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">$1</a>');

  // 9. Tables
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  let finalLines = [];

  for (let line of lines) {
    const isRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    if (isRow) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
    } else {
      if (inTable) {
        inTable = false;
        finalLines.push(compileTable(tableRows));
      }
      finalLines.push(line);
    }
  }
  if (inTable) {
    finalLines.push(compileTable(tableRows));
  }
  html = finalLines.join('\n');

  function compileTable(rows) {
    let htmlTable = '<div class="overflow-x-auto my-3"><table class="w-full text-left border-collapse border border-outline-variant/30 text-[12px] font-sans">';
    let hasHeader = false;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (row.includes('---') && i === 1) {
        continue;
      }
      
      if (i === 0 && rows.length > 1 && rows[1].includes('---')) {
        htmlTable += '<thead><tr class="bg-surface-container-high border-b border-outline-variant/40">';
        cells.forEach(cell => {
          htmlTable += `<th class="p-2.5 font-bold border border-outline-variant/20">${cell}</th>`;
        });
        htmlTable += '</tr></thead><tbody>';
        hasHeader = true;
      } else {
        htmlTable += '<tr class="border-b border-outline-variant/10 hover:bg-surface-container-low/40">';
        cells.forEach(cell => {
          htmlTable += `<td class="p-2.5 border border-outline-variant/10">${cell}</td>`;
        });
        htmlTable += '</tr>';
      }
    }
    
    if (hasHeader) {
      htmlTable += '</tbody>';
    }
    htmlTable += '</table></div>';
    return htmlTable;
  }

  // 10. Paragraph splits
  const paragraphLines = html.split('\n');
  for (let i = 0; i < paragraphLines.length; i++) {
    const line = paragraphLines[i].trim();
    if (line && 
        !line.startsWith('<h') && 
        !line.startsWith('<ul') && 
        !line.startsWith('<ol') && 
        !line.startsWith('<li') && 
        !line.startsWith('<blo') && 
        !line.startsWith('<pre') && 
        !line.startsWith('<hr') && 
        !line.startsWith('<div') &&
        !line.startsWith('<table') &&
        !line.startsWith('</')) {
      paragraphLines[i] = `<p class="my-2 leading-relaxed text-text-base/90">${paragraphLines[i]}</p>`;
    }
  }
  html = paragraphLines.join('\n');

  return html;
}

// XML Prettifier
function formatXML(xmlString, indentString = "  ") {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error(parserError.textContent);
  }
  
  function serializeNode(node, level = 0) {
    let indent = indentString.repeat(level);
    if (node.nodeType === Node.ELEMENT_NODE) {
      let childContent = "";
      let hasElementChildren = false;
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
          hasElementChildren = true;
        }
        childContent += serializeNode(child, level + 1);
      }
      let attrs = "";
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        attrs += ` ${attr.name}="${attr.value}"`;
      }
      if (node.childNodes.length === 0) {
        return `${indent}<${node.nodeName}${attrs}/>\n`;
      }
      if (hasElementChildren) {
        return `${indent}<${node.nodeName}${attrs}>\n${childContent}${indent}</${node.nodeName}>\n`;
      } else {
        return `${indent}<${node.nodeName}${attrs}>${node.textContent}</${node.nodeName}>\n`;
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue.trim();
      return text ? text : "";
    } else if (node.nodeType === Node.COMMENT_NODE) {
      return `${indent}<!--${node.nodeValue}-->\n`;
    }
    return "";
  }
  return serializeNode(xmlDoc.documentElement).trim();
}

// XML Minifier
function minifyXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error(parserError.textContent);
  }
  const serializer = new XMLSerializer();
  const raw = serializer.serializeToString(xmlDoc);
  return raw.replace(/>\s+</g, '><').trim();
}

// YAML Beautifier
function formatYaml(yamlStr, indentSpaces = 2) {
  const lines = yamlStr.split('\n');
  let formattedLines = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formattedLines.push('');
      continue;
    }
    
    if (trimmed.startsWith('#')) {
      const match = line.match(/^(\s*)/);
      const indent = match ? match[1] : '';
      formattedLines.push(indent + trimmed);
      continue;
    }
    
    const leadingSpaces = line.match(/^(\s*)/)[1].length;
    const level = Math.round(leadingSpaces / 2);
    const indent = " ".repeat(level * indentSpaces);
    
    if (trimmed.startsWith('-')) {
      const itemContent = trimmed.substring(1).trim();
      if (itemContent.includes(':')) {
        const colonIndex = itemContent.indexOf(':');
        const key = itemContent.substring(0, colonIndex).trim();
        const val = itemContent.substring(colonIndex + 1).trim();
        formattedLines.push(`${indent}- ${key}: ${val}`);
      } else {
        formattedLines.push(`${indent}- ${itemContent}`);
      }
    } else if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIndex).trim();
      const val = trimmed.substring(colonIndex + 1).trim();
      formattedLines.push(`${indent}${key}: ${val}`);
    } else {
      formattedLines.push(indent + trimmed);
    }
  }
  return formattedLines.join('\n').trim();
}

// Password Strength Analyzer
function analyzePasswordStrength(pwd) {
  if (!pwd) {
    return {
      score: 0,
      label: "Too Short",
      entropy: 0,
      poolSize: 0,
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSymbol: false,
      isLongEnough: false,
      hasRepetitive: false
    };
  }

  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
  const isLongEnough = pwd.length >= 12;

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 32;

  if (poolSize === 0) poolSize = 1;
  const entropy = pwd.length * Math.log2(poolSize);

  const hasRepetitive = /(.)\1\1/.test(pwd) || /123|abc|qwerty/i.test(pwd);

  let score = 0;
  if (isLongEnough) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSymbol) score += 1;
  if (hasRepetitive && score > 0) score -= 1;

  let label = "Very Weak";
  if (entropy >= 80 && score >= 3) {
    label = "Extremely Secure";
  } else if (entropy >= 60 && score >= 2) {
    label = "Strong";
  } else if (entropy >= 40) {
    label = "Weak / Medium";
  }

  return {
    score,
    label,
    entropy,
    poolSize,
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
    isLongEnough,
    hasRepetitive
  };
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

          case 'markdown-tool': {
            result = markdownToHtml(input);
            break;
          }

          case 'xml-yaml-formatter': {
            const mode = options.mode || 'xml';
            if (mode === 'xml') {
              if (options.formatType === 'minify') {
                result = minifyXML(input);
              } else {
                const spaces = options.formatType === 'pretty-4' ? '    ' : '  ';
                result = formatXML(input, spaces);
              }
            } else if (mode === 'yaml') {
              const spacing = options.formatType === 'pretty-4' ? 4 : 2;
              result = formatYaml(input, spacing);
            }
            break;
          }

          case 'password-generator': {
            const analysis = analyzePasswordStrength(input);
            result = `--- Password Strength Diagnostics ---
Score: ${analysis.score}/4 (${analysis.label})
Entropy: ${analysis.entropy.toFixed(1)} bits
Character Pool Size: ${analysis.poolSize}

Requirements Checklist:
[${analysis.hasLower ? 'x' : ' '}] Contains lowercase letters
[${analysis.hasUpper ? 'x' : ' '}] Contains uppercase letters
[${analysis.hasNumber ? 'x' : ' '}] Contains numbers
[${analysis.hasSymbol ? 'x' : ' '}] Contains special symbols
[${analysis.isLongEnough ? 'x' : ' '}] Length is >= 12 characters (${input.length} chars)
[${!analysis.hasRepetitive ? 'x' : ' '}] No continuous repeating patterns (e.g. 'aaa', '123')`;
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

    const localTools = ['case-converter', 'text-cleaner', 'text-stats', 'json-formatter', 'url-encoder', 'minifier', 'markdown-tool', 'xml-yaml-formatter', 'password-generator'];
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
