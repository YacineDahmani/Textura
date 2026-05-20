/**
 * Client-Side Minification Utilities for Textura
 */

/**
 * Minifies CSS strings by stripping comments and collapsing whitespaces.
 * @param {string} css - The raw CSS input.
 * @param {object} options - Options for minification.
 * @returns {string} - The minified CSS.
 */
export function minifyCSS(css, options = {}) {
  if (!css) return '';
  let result = css;

  // Strip multi-line comments
  if (options.stripComments !== false) {
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // Collapse multiple whitespaces/tabs/newlines
  result = result.replace(/\s+/g, ' ');

  // Collapse whitespaces around characters: { } ; : ,
  result = result.replace(/\s*([{};:,])\s*/g, '$1');

  // Strip trailing semicolons inside rule-blocks
  if (options.removeLastSemicolon) {
    result = result.replace(/;}/g, '}');
  }

  return result.trim();
}

/**
 * Minifies Javascript strings using a robust state-machine scanning approach.
 * This guarantees comments are stripped without corrupting strings or regex literals containing slashes.
 * @param {string} js - The raw Javascript input.
 * @param {object} options - Options for minification.
 * @returns {string} - The minified Javascript.
 */
export function minifyJS(js, options = {}) {
  if (!js) return '';
  
  let i = 0;
  const len = js.length;
  let output = '';
  
  // States: 'normal', 'single-comment', 'multi-comment', 'string-double', 'string-single', 'string-template', 'regex'
  let state = 'normal';
  
  while (i < len) {
    const char = js[i];
    const nextChar = js[i + 1] || '';
    const prevChar = output[output.length - 1] || '';
    
    if (state === 'normal') {
      if (char === '/' && nextChar === '/') {
        state = 'single-comment';
        i += 2;
        continue;
      } else if (char === '/' && nextChar === '*') {
        state = 'multi-comment';
        i += 2;
        continue;
      } else if (char === '"') {
        state = 'string-double';
        output += char;
        i++;
        continue;
      } else if (char === "'") {
        state = 'string-single';
        output += char;
        i++;
        continue;
      } else if (char === '`') {
        state = 'string-template';
        output += char;
        i++;
        continue;
      } else if (char === '/' && prevChar !== '\\' && !/[a-zA-Z0-9_$)]/.test(prevChar)) {
        // Simple heuristic for start of a regex literal
        state = 'regex';
        output += char;
        i++;
        continue;
      }
      
      output += char;
      i++;
    } else if (state === 'single-comment') {
      if (char === '\n' || char === '\r') {
        state = 'normal';
        output += '\n'; // Preserve newline for Automatic Semicolon Insertion (ASI)
      }
      i++;
    } else if (state === 'multi-comment') {
      if (char === '*' && nextChar === '/') {
        state = 'normal';
        i += 2;
      } else {
        i++;
      }
    } else if (state === 'string-double') {
      output += char;
      if (char === '"' && prevChar !== '\\') {
        state = 'normal';
      }
      i++;
    } else if (state === 'string-single') {
      output += char;
      if (char === "'" && prevChar !== '\\') {
        state = 'normal';
      }
      i++;
    } else if (state === 'string-template') {
      output += char;
      if (char === '`' && prevChar !== '\\') {
        state = 'normal';
      }
      i++;
    } else if (state === 'regex') {
      output += char;
      if (char === '/' && prevChar !== '\\') {
        state = 'normal';
      }
      i++;
    }
  }
  
  if (options.collapseSpaces !== false) {
    // Normalize newlines and collapse white-space
    let processed = output
      .replace(/\r\n/g, '\n')
      .replace(/\n+/g, '\n')
      .replace(/[ \t]+/g, ' ');
    
    // Collapse spacing around common symbols/operators
    processed = processed.replace(/\s*([=+\-*/%&|^<>!?:;,.{}()[\]])\s*/g, (match, op) => {
      return op;
    });
    
    // Split, trim, remove empty lines
    return processed
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .join('\n');
  }
  
  return output.trim();
}

/**
 * Minifies HTML strings, protecting contents inside tags like pre, code, and textarea.
 * @param {string} html - The raw HTML input.
 * @param {object} options - Options for minification.
 * @returns {string} - The minified HTML.
 */
export function minifyHTML(html, options = {}) {
  if (!html) return '';
  let result = html;
  
  // Protect pre, code, textarea, script, style from standard collapsing
  const placeholders = [];
  const protectRegex = /<(pre|code|textarea|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
  
  result = result.replace(protectRegex, (match) => {
    const placeholder = `___HTML_MINIFIER_PLACEHOLDER_${placeholders.length}___`;
    placeholders.push({ placeholder, content: match });
    return placeholder;
  });
  
  // Strip HTML Comments
  if (options.stripComments !== false) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }
  
  // Collapse whitespaces
  if (options.collapseWhitespace !== false) {
    result = result.replace(/\s+/g, ' ');
    // Remove space between block tags
    result = result.replace(/>\s+</g, '><');
  }
  
  // Restore elements, and optionally minify nested stylesheet & javascript contents
  for (let i = 0; i < placeholders.length; i++) {
    const item = placeholders[i];
    let content = item.content;
    
    if (options.minifyEmbedded !== false) {
      if (/^<style\b[^>]*>([\s\S]*?)<\/style>/i.test(content)) {
        content = content.replace(/^<style\b([^>]*)>([\s\S]*?)<\/style>/i, (m, attrs, cssContent) => {
          return `<style${attrs}>${minifyCSS(cssContent, { stripComments: true })}</style>`;
        });
      } else if (/^<script\b[^>]*>([\s\S]*?)<\/script>/i.test(content)) {
        content = content.replace(/^<script\b([^>]*)>([\s\S]*?)<\/script>/i, (m, attrs, jsContent) => {
          // Only minify if it is standard Javascript (no type or type="module"/"text/javascript")
          if (!attrs || /type=["']?(module|text\/javascript)["']?/i.test(attrs)) {
            return `<script${attrs}>${minifyJS(jsContent, { stripComments: true, collapseSpaces: true })}</script>`;
          }
          return m;
        });
      }
    }
    
    result = result.replace(item.placeholder, content);
  }
  
  return result.trim();
}
