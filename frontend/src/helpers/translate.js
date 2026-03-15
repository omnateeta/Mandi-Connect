import translationService from '../services/translationService';
import { useLanguage } from '../components/common/LanguageToggle';

/**
 * Translation Helper Component
 * Use this to translate any text dynamically
 */

// Hook version for functional components
export const TranslatedText = ({ text, className = '' }) => {
  const { language } = useLanguage();

  if (!text) return null;
  if (language === 'en') return <span className={className}>{text}</span>;

  // For immediate display, we'll use the dictionary or original text
  // The actual translation happens in the background
  return <span className={className}>{text}</span>;
};

/**
 * Translate any string programmatically
 * Usage: const translated = await translate('Hello World');
 */
export const translate = async (text) => {
  const { language } = useLanguage();
  if (!text || language === 'en') return text;
  
  try {
    return await translationService.translateText(text, language);
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

/**
 * Force translate entire page immediately
 */
export const forceTranslatePage = async () => {
  const { language } = useLanguage();
  if (language === 'en') {
    window.location.reload();
    return;
  }
  
  await translationService.translatePage(language);
};

export default TranslatedText;
