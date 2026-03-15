import { useState } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ur', name: 'اردو (Urdu)' },
];

const GoogleTranslate = () => {
  const [selectedLang, setSelectedLang] = useState('en');

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    console.log('Language selected:', lang);
    setSelectedLang(lang);
    
    if (lang === 'en') {
      // Reset to English - reload current page
      window.location.reload();
      return;
    }
    
    // Use Google Translate web interface
    const currentUrl = encodeURIComponent(window.location.href);
    const translateUrl = `https://translate.google.com/translate?hl=${lang}&sl=en&tl=${lang}&u=${currentUrl}`;
    console.log('Opening translate URL:', translateUrl);
    window.open(translateUrl, '_blank');
  };

  return (
    <div className="flex items-center gap-2 bg-cream-100 rounded-lg px-3 py-2 border border-secondary-300">
      <Globe className="w-4 h-4 text-accent-600" />
      <select
        value={selectedLang}
        onChange={handleLanguageChange}
        className="bg-transparent border-none text-sm text-primary-700 focus:outline-none cursor-pointer font-medium"
        style={{ minWidth: '100px' }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GoogleTranslate;
