import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [apiKey, setApiKey] = useState('');
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'bn', name: 'Bengali' }
  ];

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }

    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('translationApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // Use the provided API key as default
      const defaultApiKey = 'AIzaSyCyun0BWEsCoKFG_b36e83qF-KvXLojysk';
      setApiKey(defaultApiKey);
      localStorage.setItem('translationApiKey', defaultApiKey);
    }
  }, []);

  const changeLanguage = (language) => {
    // Force English text for English language
    if (language === 'English' || language === languages[0].name) {
      setCurrentLanguage('English');
      localStorage.setItem('preferredLanguage', 'English');
    } else {
      setCurrentLanguage(language);
      localStorage.setItem('preferredLanguage', language);
    }
    // Clear translations cache when language changes
    setTranslations({});
  };

  const translate = async (text, targetLanguage = currentLanguage) => {
    // Return original text for English language, empty text, or when target is English
    if (!text || targetLanguage === 'English' || targetLanguage === languages[0].name) {
      return Promise.resolve(text);
    }

    try {
      setIsLoading(true);
      
      // Check if we already have this translation cached
      const cacheKey = `${text}_${targetLanguage}`;
      if (translations[cacheKey]) {
        setIsLoading(false);
        return Promise.resolve(translations[cacheKey]);
      }

      const targetLang = languages.find(lang => lang.name === targetLanguage)?.code || 'en';
      
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: 'en',
            target: targetLang,
            format: 'text'
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) {
        console.error('Translation error:', data.error);
        setIsLoading(false);
        return text;
      }

      const translatedText = data.data.translations[0].translatedText;
      
      // Cache the translation result
      setTranslations(prev => ({
        ...prev,
        [cacheKey]: translatedText
      }));

      setIsLoading(false);
      return translatedText;
    } catch (error) {
      console.error('Error translating text:', error);
      setIsLoading(false);
      return text;
    }
  };

  const value = {
    currentLanguage,
    languages,
    changeLanguage,
    translate,
    isLoading,
    apiKey,
    setApiKey
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 