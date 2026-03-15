import { useState, useEffect, createContext, useContext } from 'react';
import { Globe } from 'lucide-react';

// Create context for language
const LanguageContext = createContext({ 
  language: 'en', 
  setLanguage: () => {}, 
  t: (k) => k,
  translatePage: () => {}
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    // Always default to English, ignore any saved preference
    return 'en';
  });

  useEffect(() => {
    // Only save to localStorage, don't read from it
    localStorage.setItem('appLanguage', language);
  }, [language]);

  // Simple translation function for common terms (fallback)
  const translations = {
    hi: {
      'Dashboard': 'डैशबोर्ड',
      'My Crops': 'मेरी फसलें',
      'Orders': 'आदेश',
      'Profile': 'प्रोफाइल',
      'Marketplace': 'बाजार',
      'Cart': 'कार्ट',
      'Nearby Agriculture Locations': 'आस-पास के कृषि स्थान',
      'Discover mandis, warehouses & more near you': 'अपने पास मंडियों, गोदामों और अधिक की खोज करें',
      'View Map': 'मानचित्र देखें',
      'All': 'सभी',
      'Mandi (Market)': 'मंडी (बाजार)',
      'Warehouse': 'गोदाम',
      'Cold Storage': 'कोल्ड स्टोरेज',
      'Processing Center': 'प्रसंस्करण केंद्र',
      'Equipment Rental': 'उपकरण किराया',
      'Get Directions': 'दिशा-निर्देश प्राप्त करें',
      'No locations found': 'कोई स्थान नहीं मिला',
      'Try selecting a different category': 'एक अलग श्रेणी का चयन करने का प्रयास करें',
      'Logout': 'लॉग आउट',
      'Welcome': 'स्वागत है',
      'Welcome Back': 'वापसी का स्वागत है',
      'Add Crop': 'फसल जोड़ें',
      'View': 'देखें',
      'Edit': 'संपादित करें',
      'Delete': 'हटाएं',
      'Save': 'सहेजें',
      'Cancel': 'रद्द करें',
      'Submit': 'जमा करें',
      'Search': 'खोजें',
      'Filter': 'फिल्टर',
      'Price': 'कीमत',
      'Quantity': 'मात्रा',
      'Category': 'श्रेणी',
      'Description': 'विवरण',
      'Available': 'उपलब्ध',
      'Pending': 'लंबित',
      'Completed': 'पूरा हुआ',
      'Login': 'लॉग इन',
      'Register': 'पंजीकरण',
      'Farmer': 'किसान',
      'Retailer': 'विक्रेता',
      'Create Account': 'खाता बनाएं',
      'Phone Number': 'फोन नंबर',
      'Send OTP': 'OTP भेजें',
      'Verify OTP': 'OTP सत्यापित करें',
      'Name': 'नाम',
      'Address': 'पता',
      'Location': 'स्थान',
      'Trust Score': 'विश्वास स्कोर',
      'Rating': 'रेटिंग',
      'Total Orders': 'कुल आदेश',
      'Notifications': 'सूचनाएं',
      'Settings': 'सेटिंग्स',
      'Help': 'सहायता',
      'About': 'के बारे में',
      'Contact': 'संपर्क करें',
      'Update': 'अपडेट',
      'Upload': 'अपलोड',
      'Select': 'चुनें',
      'Success': 'सफल',
      'Error': 'त्रुटि',
      'Loading': 'लोड हो रहा है...',
      'Go Back': 'वापस जाएं',
      'View Details': 'विवरण देखें',
      'Get Started': 'शुरू करें',
      'Join Now': 'अभी जुड़ें',
      'Login to access your account': 'अपने खाते तक पहुंचने के लिए लॉग इन करें',
      'Enter your 10-digit number': 'अपना 10 अंकों का नंबर दर्ज करें',
      "We'll send you a verification code": 'हम आपको एक सत्यापन कोड भेजेंगे',
      'Checking account...': 'खाता जांच रहा है...',
      'Account Detected': 'खाता पता चला',
      'New User': 'नया उपयोगकर्ता',
      "You'll be redirected to register": 'आपको पंजीकरण के लिए रीडायरेक्ट किया जाएगा',
      'Sending OTP...': 'OTP भेज रहा है...',
      'Continue': 'जारी रखें',
      "Don't have an account?": 'खाता नहीं है?',
      'Register here': 'यहां पंजीकरण करें',
      'Direct Farm Sales': 'सीधी खेत बिक्री',
      'Better Prices': 'बेहतर कीमतें',
      'Trusted Network': 'विश्वसनीय नेटवर्क',
      'Please enter a valid phone number': 'कृपया एक वैध फोन नंबर दर्ज करें',
      'OTP sent successfully!': 'OTP सफलतापूर्वक भेजा गया!',
      'Failed to send OTP': 'OTP भेजने में विफल',
      'Join today': 'आज ही जुड़ें',
      'I am a': 'मैं हूं',
      'Full Name': 'पूरा नाम',
      'Enter your full name': 'अपना पूरा नाम दर्ज करें',
      'Please enter your name': 'कृपया अपना नाम दर्ज करें',
      'Already have an account?': 'पहले से ही खाता है?',
      'Login here': 'यहां लॉगिन करें',
      'Trusted by 10,000+ farmers & retailers': '10,000+ किसानों और विक्रेताओं द्वारा विश्वसनीय',
      'Secure': 'सुरक्षित',
      'Free to use': 'मुफ्त उपयोग',
      '24/7 Support': '24/7 सहायता',
      'Welcome back': 'वापसी का स्वागत है',
      "Here's what's happening with your farm today": 'आज आपके खेत में यह हो रहा है',
      'Add New Crop': 'नई फसल जोड़ें',
      'Total Revenue': 'कुल राजस्व',
      'Active Crops': 'सक्रिय फसलें',
      'Recent Orders': 'हाल के आदेश',
      'View All': 'सभी देखें',
      'No orders yet. Start by adding crops!': 'अभी तक कोई आदेश नहीं। फसलें जोड़कर शुरू करें!',
      'Manage Crops': 'फसलें प्रबंधित करें',
      'View and update your crop listings': 'अपनी फसल सूची देखें और अपडेट करें',
      'View Orders': 'आदेश देखें',
      'Track and manage customer orders': 'ग्राहक आदेशों को ट्रैक और प्रबंधित करें',
      'Market Prices': 'बाजार भाव',
      'Check current mandi rates': 'वर्तमान मंडी दरें देखें',
      'Add Crop': 'फसल जोड़ें',
      'No crops yet': 'अभी तक कोई फसल नहीं',
      'Start by adding your first crop listing': 'अपनी पहली फसल सूची जोड़कर शुरू करें',
      'Add Your First Crop': 'अपनी पहली फसल जोड़ें',
      'Are you sure you want to delete this crop?': 'क्या आप वाकई इस फसल को हटाना चाहते हैं?',
      'Unavailable': 'अनुपलब्ध',
      'Stock': 'स्टॉक',
      'Quality': 'गुणवत्ता',
    },
    ta: {
      'Dashboard': 'டாஷ்போர்டு',
      'My Crops': 'என் பயிர்கள்',
      'Orders': 'ஆர்டர்கள்',
      'Profile': 'சுயவிவரம்',
      'Marketplace': 'சந்தை',
      'Logout': 'வெளியேறு',
      'Welcome': 'வரவேற்பு',
      'Welcome Back': 'மீண்டும் வரவேற்கிறோம்',
      'Add Crop': 'பயிரைச் சேர்',
      'View': 'காண்க',
      'Edit': 'திருத்து',
      'Save': 'சேமி',
      'Login': 'உள்நுழை',
      'Register': 'பதிவு',
      'Farmer': 'விவசாயி',
      'Retailer': 'விற்பனையாளர்',
      'Phone Number': 'தொலைபேசி எண்',
      'Send OTP': 'OTP அனுப்பு',
      'Name': 'பெயர்',
      'Loading': 'ஏற்றுகிறது...',
      'Login to access your account': 'உங்கள் கணக்கை அணுக உள்நுழையவும்',
      'Enter your 10-digit number': 'உங்கள் 10 இலக்க எண்ணை உள்ளிடவும்',
      'Continue': 'தொடரவும்',
      'Create Account': 'கணக்கை உருவாக்கு',
      'Join today': 'இன்றே சேரவும்',
      'I am a': 'நான் ஒரு',
      'Full Name': 'முழு பெயர்',
      'Add New Crop': 'புதிய பயிரைச் சேர்',
      'Total Revenue': 'மொத்த வருமானம்',
      'Active Crops': 'செயலில் பயிர்கள்',
      'Total Orders': 'மொத்த ஆர்டர்கள்',
      'Trust Score': 'நம்பக மதிப்பு',
      'Recent Orders': 'சமீபத்திய ஆர்டர்கள்',
      'View All': 'அனைத்தையும் காண்க',
      'Manage Crops': 'பயிர்களை நிர்வகி',
      'View Orders': 'ஆர்டர்களை காண்க',
      'Market Prices': 'சந்தை விலைகள்',
      'Add Crop': 'பயிரைச் சேர்',
      'No crops yet': 'இன்னும் பயிர்கள் இல்லை',
      'View': 'காண்க',
      'Edit': 'திருத்து',
      'Delete': 'நீக்கு',
      'Available': 'கிடைக்கும்',
      'Unavailable': 'கிடைக்காது',
      'Stock': 'பங்கு',
      'Quality': 'தரம்',
      'All': 'அனைத்தும்',
      'Pending': 'நிலுவையில்',
      'Accepted': 'ஏற்றுக்கொள்ளப்பட்டது',
      'Delivered': 'வழங்கப்பட்டது',
      'Cancelled': 'ரத்து செய்யப்பட்டது',
    },
    te: {
      'Dashboard': 'డాష్‌బోర్డ్',
      'My Crops': 'నా పంటలు',
      'Orders': 'ఆర్డర్లు',
      'Profile': 'ప్రొఫైల్',
      'Logout': 'లాగౌట్',
      'Welcome': 'స్వాగతం',
      'Welcome Back': 'మళ్ళీ స్వాగతం',
      'Add Crop': 'పంట జోడించు',
      'View': 'చూడండి',
      'Edit': 'సవరించు',
      'Save': 'సేవ్',
      'Login': 'లాగిన్',
      'Register': 'రిజిస్టర్',
      'Farmer': 'రైతు',
      'Retailer': 'విక్రేత',
      'Phone Number': 'ఫోన్ నంబర్',
      'Send OTP': 'OTP పంపు',
      'Name': 'పేరు',
      'Loading': 'లోడ్ అవుతోంది...',
      'Login to access your account': 'మీ ఖాతాను యాక్సెస్ చేయడానికి లాగిన్ అవ్వండి',
      'Enter your 10-digit number': 'మీ 10 అంకెల నంబర్ నమోదు చేయండి',
      'Continue': 'కొనసాగించండి',
      'Create Account': 'ఖాతా సృష్టించండి',
      'Join today': 'ఈరోజే చేరండి',
      'I am a': 'నేను ఒక',
      'Full Name': 'పూర్తి పేరు',
      'Add New Crop': 'కొత్త పంట జోడించు',
      'Total Revenue': 'మొత్తం ఆదాయం',
      'Active Crops': 'సక్రియ పంటలు',
      'Total Orders': 'మొత్తం ఆర్డర్లు',
      'Trust Score': 'విశ్వసనీయత స్కోర్',
      'Recent Orders': 'ఇటీవలి ఆర్డర్లు',
      'View All': 'అన్నీ చూడండి',
      'Manage Crops': 'పంటలను నిర్వహించండి',
      'View Orders': 'ఆర్డర్లు చూడండి',
      'Market Prices': 'మార్కెట్ ధరలు',
      'Add Crop': 'పంట జోడించు',
      'No crops yet': 'ఇంకా పంటలు లేవు',
      'View': 'చూడండి',
      'Edit': 'సవరించు',
      'Delete': 'తొలగించు',
      'Available': 'అందుబాటులో ఉంది',
      'Unavailable': 'అందుబాటులో లేదు',
      'Stock': 'స్టాక్',
      'Quality': 'నాణ్యత',
      'All': 'అన్నీ',
      'Pending': 'పెండింగ్',
      'Accepted': 'ఆమోదించబడింది',
      'Delivered': 'డెలివరీ చేయబడింది',
      'Cancelled': 'రద్దు చేయబడింది',
    },
    kn: {
      'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'My Crops': 'ನನ್ನ ಬೆಳೆಗಳು',
      'Orders': 'ಆರ್ಡರ್‌ಗಳು',
      'Profile': 'ಪ್ರೊಫೈಲ್',
      'Logout': 'ಲಾಗ್ ಔಟ್',
      'Welcome': 'ಸ್ವಾಗತ',
      'Welcome Back': 'ಮರಳಿ ಸ್ವಾಗತ',
      'Add Crop': 'ಬೆಳೆ ಸೇರಿಸಿ',
      'View': 'ನೋಡಿ',
      'Edit': 'ಸಂಪಾದಿಸಿ',
      'Save': 'ಉಳಿಸಿ',
      'Login': 'ಲಾಗಿನ್',
      'Register': 'ನೋಂದಾಯಿಸಿ',
      'Farmer': 'ರೈತ',
      'Retailer': 'ವ್ಯಾಪಾರಿ',
      'Phone Number': 'ಫೋನ್ ಸಂಖ್ಯೆ',
      'Send OTP': 'OTP ಕಳುಹಿಸಿ',
      'Name': 'ಹೆಸರು',
      'Loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      'Login to access your account': 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಪ್ರವೇಶಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ',
      'Enter your 10-digit number': 'ನಿಮ್ಮ 10 ಅಂಕಿಯ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
      'Continue': 'ಮುಂದುವರಿಸಿ',
      'Create Account': 'ಖಾತೆ ರಚಿಸಿ',
      'Join today': 'ಇಂದೇ ಸೇರಿ',
      'I am a': 'ನಾನು ಒಬ್ಬ',
      'Full Name': 'ಪೂರ್ಣ ಹೆಸರು',
      'Add New Crop': 'ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ',
      'Total Revenue': 'ಒಟ್ಟು ಆದಾಯ',
      'Active Crops': 'ಸಕ್ರಿಯ ಬೆಳೆಗಳು',
      'Total Orders': 'ಒಟ್ಟು ಆರ್ಡರ್‌ಗಳು',
      'Trust Score': 'ವಿಶ್ವಾಸ ಸ್ಕೋರ್',
      'Recent Orders': 'ಇತ್ತೀಚಿನ ಆರ್ಡರ್‌ಗಳು',
      'View All': 'ಎಲ್ಲಾ ವೀಕ್ಷಿಸಿ',
      'Manage Crops': 'ಬೆಳೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
      'View Orders': 'ಆರ್ಡರ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      'Market Prices': 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
      'Add Crop': 'ಬೆಳೆ ಸೇರಿಸಿ',
      'No crops yet': 'ಇನ್ನೂ ಬೆಳೆಗಳಿಲ್ಲ',
      'View': 'ನೋಡಿ',
      'Edit': 'ಸಂಪಾದಿಸಿ',
      'Delete': 'ಅಳಿಸಿ',
      'Available': 'ಲಭ್ಯವಿದೆ',
      'Unavailable': 'ಲಭ್ಯವಿಲ್ಲ',
      'Stock': 'ಸ್ಟಾಕ್',
      'Quality': 'ಗುಣಮಟ್ಟ',
      'All': 'ಎಲ್ಲಾ',
      'Pending': 'ಬಾಕಿ',
      'Accepted': 'ಅಂಗೀಕರಿಸಲಾಗಿದೆ',
      'Delivered': 'ವಿತರಿಸಲಾಗಿದೆ',
      'Cancelled': 'ರದ್ದುಗೊಂಡಿದೆ',
    },
    mr: {
      'Dashboard': 'डॅशबोर्ड',
      'My Crops': 'माझी पिके',
      'Orders': 'ऑर्डर्स',
      'Profile': 'प्रोफाइल',
      'Logout': 'लॉगआउट',
      'Welcome': 'स्वागत आहे',
      'Welcome Back': 'पुन्हा स्वागत आहे',
      'Add Crop': 'पीक जोडा',
      'View': 'पहा',
      'Edit': 'संपादित करा',
      'Save': 'जतन करा',
      'Login': 'लॉगिन',
      'Register': 'नोंदणी',
      'Farmer': 'शेतकरी',
      'Retailer': 'विक्रेता',
      'Phone Number': 'फोन नंबर',
      'Send OTP': 'OTP पाठवा',
      'Name': 'नाव',
      'Loading': 'लोड होत आहे...',
      'Login to access your account': 'तुमच्या खात्यात प्रवेश करण्यासाठी लॉगिन करा',
      'Enter your 10-digit number': 'तुमचा 10 अंकी नंबर टाका',
      'Continue': 'सुरू ठेवा',
      'Create Account': 'खाते तयार करा',
      'Join today': 'आजच सामील व्हा',
      'I am a': 'मी आहे',
      'Full Name': 'पूर्ण नाव',
      'Add New Crop': 'नवीन पीक जोडा',
      'Total Revenue': 'एकूण उत्पन्न',
      'Active Crops': 'सक्रिय पिके',
      'Total Orders': 'एकूण ऑर्डर्स',
      'Trust Score': 'विश्वास स्कोर',
      'Recent Orders': 'अलीकडील ऑर्डर्स',
      'View All': 'सर्व पहा',
      'Manage Crops': 'पिके व्यवस्थापित करा',
      'View Orders': 'ऑर्डर्स पहा',
      'Market Prices': 'बाजार भाव',
      'Add Crop': 'पीक जोडा',
      'No crops yet': 'अद्याप कोणतीही पिके नाहीत',
      'View': 'पहा',
      'Edit': 'संपादित करा',
      'Delete': 'हटवा',
      'Available': 'उपलब्ध',
      'Unavailable': 'अनुपलब्ध',
      'Stock': 'स्टॉक',
      'Quality': 'गुणवत्ता',
      'All': 'सर्व',
      'Pending': 'प्रलंबित',
      'Accepted': 'स्वीकृत',
      'Delivered': 'वितरित',
      'Cancelled': 'रद्द',
    },
  };

  const t = (key) => {
    if (language === 'en') return key;
    return translations[language]?.[key] || key;
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('appLanguage', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
];

// Language Toggle Component
const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleTranslateClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLanguageSelect = (langCode) => {
    // Trigger Google Translate
    const selectBox = document.querySelector('.goog-te-combo');
    if (selectBox) {
      selectBox.value = langCode;
      selectBox.dispatchEvent(new Event('change'));
      setShowDropdown(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'ur', name: 'اردو (Urdu)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'de', name: 'Deutsch (German)' },
    { code: 'zh-CN', name: '中文 (Chinese)' },
    { code: 'ar', name: 'العربية (Arabic)' },
    { code: 'pt', name: 'Português (Portuguese)' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'ru', name: 'Русский (Russian)' },
  ];

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-secondary-300 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleTranslateClick}
      >
        <Globe className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-medium text-text-700">Translate</span>
      </div>

      {/* Language Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Select Language</h3>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  language === lang.code 
                    ? 'bg-primary-50 text-primary-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
