import { useEffect, useRef } from 'react';
import { useLanguage } from '../components/common/LanguageToggle';
import translationService from '../services/translationService';

/**
 * Custom hook to auto-translate component content
 * @param {Object} options - Translation options
 * @param {boolean} options.auto - Auto-translate on mount and language change
 * @param {string[]} options.excludeSelectors - CSS selectors to exclude from translation
 */
export const useTranslate = (options = {}) => {
  const { auto = true, excludeSelectors = [] } = options;
  const { language, isTranslating } = useLanguage();
  const elementRef = useRef(null);

  useEffect(() => {
    if (!auto || !elementRef.current) return;

    const translateContent = async () => {
      if (language === 'en') return;

      try {
        // Get all text nodes in the element
        const walker = document.createTreeWalker(
          elementRef.current,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        const nodesToTranslate = [];
        let node;

        while ((node = walker.nextNode())) {
          // Skip excluded elements
          if (node.parentElement && 
              (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'].includes(node.parentElement.tagName) ||
               excludeSelectors.some(selector => node.parentElement.matches(selector)))) {
            continue;
          }

          if (node.textContent.trim()) {
            nodesToTranslate.push(node);
          }
        }

        // Translate all nodes
        await Promise.all(
          nodesToTranslate.map(async (node) => {
            const text = node.textContent.trim();
            if (text) {
              const translated = await translationService.translateText(text, language);
              node.textContent = translated;
            }
          })
        );

        // Also translate placeholders
        const inputElements = elementRef.current.querySelectorAll('input[placeholder], textarea[placeholder]');
        await Promise.all(
          Array.from(inputElements).map(async (input) => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
              const translated = await translationService.translateText(placeholder, language);
              input.setAttribute('placeholder', translated);
            }
          })
        );

      } catch (error) {
        console.warn('Component translation error:', error);
      }
    };

    translateContent();
  }, [language, auto, ...excludeSelectors]);

  return { elementRef, isTranslating, language };
};

/**
 * HOC to translate entire components
 * @param {React.ComponentType} WrappedComponent - Component to wrap
 */
export const withTranslation = (WrappedComponent) => {
  return function TranslatedComponent(props) {
    const { elementRef } = useTranslate({ auto: true });
    
    return (
      <div ref={elementRef}>
        <WrappedComponent {...props} />
      </div>
    );
  };
};

export default useTranslate;
