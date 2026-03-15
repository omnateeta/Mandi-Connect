import { useEffect } from 'react';

/**
 * Hook to force Google Translate to re-translate dynamic content
 * Use this in components that load data after initial page render
 */
export const useGoogleTranslateRefresh = (dependencies = []) => {
  useEffect(() => {
    // Wait for content to render
    const timeout = setTimeout(() => {
      if (window.google && window.google.translate) {
        // Trigger Google to re-scan the DOM
        const body = document.body;
        const translator = window.google.translate;
        
        // Method 1: Fire DOM mutation event
        const event = new MutationObserver((mutations) => {
          translator.translatePage();
        });
        
        event.observe(body, {
          childList: true,
          subtree: true,
          characterData: true
        });
        
        // Stop observing after 2 seconds
        setTimeout(() => event.disconnect(), 2000);
        
        // Method 2: Manual re-translation
        try {
          translator.translatePage();
        } catch (error) {
          console.log('Translation refresh:', error);
        }
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, dependencies);
};

export default useGoogleTranslateRefresh;
