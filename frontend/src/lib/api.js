const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Helper to perform POST requests to Textura Backend API
 */
async function postRequest(endpoint, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server returned status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error in ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Case converter / cleaner remote route if needed (though usually local)
  transformText: (text, options) => postRequest('/text/transform', { input: text, options }),
  
  // Health check
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  // Base64 tools
  base64: (text, mode, urlSafe) => postRequest('/encode/base64', { input: text, options: { mode, urlSafe } }),

  // URL encoder
  urlEncode: (text, mode, fullUrl) => postRequest('/encode/url', { input: text, options: { mode, fullUrl } }),

  // Hash Generator
  generateHashes: (text) => postRequest('/hash/generate', { input: text, options: {} }),

  // Regex Tester
  testRegex: (text, pattern, replacePattern, flags, mode) => 
    postRequest('/text/regex', { 
      input: text, 
      options: { 
        pattern, 
        replacePattern: replacePattern || '', 
        flags: Object.keys(flags).filter(k => flags[k]).join(''),
        mode // 'test' or 'replace'
      } 
    }),

  // File parser
  parseFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/parser/parse-file`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server returned status ${response.status}`);
    }
    return await response.json();
  },
};

