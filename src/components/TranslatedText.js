import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Component that displays text translated to the current language
 * @param {Object} props
 * @param {string} props.text - The original text in English to be translated
 * @param {string} props.className - Optional CSS class for styling
 * @param {string} props.as - HTML element to render (default: 'span')
 */
const TranslatedText = ({ text, className = '', as: Component = 'span', ...props }) => {
  const { translate, currentLanguage, isLoading } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    const translateText = async () => {
      // Always use original text for English or empty text
      if (!text || currentLanguage === 'English') {
        setTranslatedText(text);
        return;
      }

      try {
        const result = await translate(text);
        if (result) {
          setTranslatedText(result);
        } else {
          // Fallback to original text if translation fails
          setTranslatedText(text);
        }
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to original text on error
        setTranslatedText(text);
      }
    };

    translateText();
  }, [text, translate, currentLanguage]);

  // Reset to original text when switching to English
  useEffect(() => {
    if (currentLanguage === 'English') {
      setTranslatedText(text);
    }
  }, [currentLanguage, text]);

  return (
    <Component className={`${className} ${isLoading ? 'translating' : ''}`} {...props}>
      {translatedText || text}
    </Component>
  );
};

export default TranslatedText; 