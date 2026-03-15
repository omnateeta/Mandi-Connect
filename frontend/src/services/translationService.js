/**
 * Translation Service - Provides comprehensive translations for all content
 * Supports: English, Hindi, Tamil, Telugu, Kannada, Marathi
 */

const supportedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'mr'];

// Cache translations to reduce API calls
const translationCache = new Map();

/**
 * Get Google Translate API URL
 * Note: This uses the free Google Translate web endpoint
 * For production, consider using official Google Cloud Translation API
 */
const getTranslateUrl = (text, targetLang) => {
  const encodedText = encodeURIComponent(text);
  return `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodedText}`;
};

/**
 * Translate text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, targetLang) => {
  if (!text || typeof text !== 'string') return '';
  if (targetLang === 'en') return text;
  if (!supportedLanguages.includes(targetLang)) return text;

  // Check cache first
  const cacheKey = `${text}:${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // Use fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(getTranslateUrl(text, targetLang), {
      signal: controller.signal,
      method: 'GET',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    const translated = data[0]?.map(item => item[0]).join('') || text;
    
    // Cache the result
    translationCache.set(cacheKey, translated);
    
    return translated;
  } catch (error) {
    console.warn('Translation error:', error);
    return text; // Return original text on error
  }
};

/**
 * Translate multiple texts in parallel
 * @param {Object} translations - Object with keys and text values to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<Object>} Translated texts
 */
export const translateBatch = async (translations, targetLang) => {
  if (targetLang === 'en') return translations;

  const entries = Object.entries(translations);
  const translatedEntries = await Promise.all(
    entries.map(async ([key, text]) => {
      const translated = await translateText(text, targetLang);
      return [key, translated];
    })
  );

  return Object.fromEntries(translatedEntries);
};

/**
 * Translate DOM element content
 * @param {HTMLElement} element - DOM element to translate
 * @param {string} targetLang - Target language code
 */
export const translateElement = async (element, targetLang) => {
  if (!element) return;

  // Skip script and style tags
  if (['SCRIPT', 'STYLE'].includes(element.tagName)) return;

  // Translate text content
  if (element.childNodes.length === 1 && element.firstChild.nodeType === Node.TEXT_NODE) {
    const text = element.textContent.trim();
    if (text) {
      const translated = await translateText(text, targetLang);
      element.textContent = translated;
    }
  }

  // Recursively translate children
  Array.from(element.children).forEach(child => {
    translateElement(child, targetLang);
  });
};

/**
 * Translate entire page
 * @param {string} targetLang - Target language code
 */
export const translatePage = async (targetLang) => {
  if (targetLang === 'en') {
    window.location.reload();
    return;
  }

  // Set loading state
  document.body.style.opacity = '0.5';

  try {
    // Translate all text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const nodesToTranslate = [];
    let node;
    
    while ((node = walker.nextNode())) {
      if (node.parentElement && 
          !['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'].includes(node.parentElement.tagName) &&
          node.textContent.trim()) {
        nodesToTranslate.push(node);
      }
    }

    // Batch translate
    await Promise.all(
      nodesToTranslate.map(async (node) => {
        const text = node.textContent.trim();
        if (text) {
          const translated = await translateText(text, targetLang);
          node.textContent = translated;
        }
      })
    );

    // Also translate placeholders
    const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    await Promise.all(
      Array.from(inputElements).map(async (input) => {
        const placeholder = input.getAttribute('placeholder');
        if (placeholder) {
          const translated = await translateText(placeholder, targetLang);
          input.setAttribute('placeholder', translated);
        }
      })
    );

  } catch (error) {
    console.error('Page translation failed:', error);
  } finally {
    // Restore visibility
    document.body.style.opacity = '1';
  }
};

/**
 * Detect language from text
 * @param {string} text - Text to analyze
 * @returns {string} Detected language code
 */
export const detectLanguage = (text) => {
  // Simple detection based on character ranges
  const hindiRange = /[\u0900-\u097F]/;
  const tamilRange = /[\u0B80-\u0BFF]/;
  const teluguRange = /[\u0C00-\u0C7F]/;
  const kannadaRange = /[\u0C80-\u0CFF]/;
  const marathiRange = /[\u0900-\u097F]/; // Marathi uses Devanagari like Hindi

  if (hindiRange.test(text)) return 'hi';
  if (tamilRange.test(text)) return 'ta';
  if (teluguRange.test(text)) return 'te';
  if (kannadaRange.test(text)) return 'kn';
  if (marathiRange.test(text)) return 'mr';
  
  return 'en';
};

export default {
  translateText,
  translateBatch,
  translateElement,
  translatePage,
  detectLanguage,
  supportedLanguages
};
