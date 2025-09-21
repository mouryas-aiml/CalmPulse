import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * A hook to translate text based on the current language
 * 
 * @returns {function} translate - A function that translates text
 * @returns {string} currentLanguage - The current language
 * @returns {boolean} isLoading - Whether translation is in progress
 */
export const useTranslate = () => {
  const { translate: contextTranslate, currentLanguage, isLoading } = useLanguage();
  const [translatedTexts, setTranslatedTexts] = useState({});

  // Clear cached translations when language changes
  useEffect(() => {
    setTranslatedTexts({});
  }, [currentLanguage]);

  const translate = useCallback(async (text) => {
    // Return original text if it's empty or if language is English
    if (!text || currentLanguage === 'English') {
      return text;
    }

    // Check if we already have this translation cached
    const cacheKey = `${text}_${currentLanguage}`;
    if (translatedTexts[cacheKey]) {
      return translatedTexts[cacheKey];
    }

    try {
      // Get translation from context
      const translatedText = await contextTranslate(text);
      
      // Cache the translation
      setTranslatedTexts(prev => ({
        ...prev,
        [cacheKey]: translatedText
      }));

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, [currentLanguage, contextTranslate, translatedTexts]);

  return { translate, currentLanguage, isLoading };
};

export default useTranslate; 